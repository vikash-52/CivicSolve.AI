from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.db.session import get_db
from app.core.deps import require_roles
from app.models.entities import (
    User, UserRole, Problem, ProblemStatus, StatusTimeline, Notification, AuditLog
)
from app.schemas.schemas import ProblemResponse, ProblemStatusUpdateRequest
from app.routes.problems import _format_problem_response

router = APIRouter(prefix="/authority", tags=["Authority Officer"])

@router.get("/assignments", response_model=List[ProblemResponse])
def get_officer_assignments(
    status_filter: Optional[str] = None,
    db: Session = Depends(get_db),
    officer: User = Depends(require_roles([UserRole.AUTHORITY_OFFICER, UserRole.SYSTEM_ADMIN]))
):
    query = db.query(Problem)
    if officer.role == UserRole.AUTHORITY_OFFICER:
        # Officer sees cases specifically assigned to them or their department
        query = query.filter(
            (Problem.assigned_officer_id == officer.id) |
            (Problem.assigned_department_id == officer.department_id if hasattr(officer, 'department_id') and officer.department_id else Problem.assigned_officer_id == officer.id)
        )

    if status_filter and status_filter != "All":
        query = query.filter(Problem.status == status_filter)

    problems = query.order_by(desc(Problem.priority_score), desc(Problem.created_at)).all()
    return [_format_problem_response(p, officer.id) for p in problems]

@router.post("/problems/{id}/status", response_model=ProblemResponse)
def update_problem_status(
    id: int,
    payload: ProblemStatusUpdateRequest,
    db: Session = Depends(get_db),
    officer: User = Depends(require_roles([UserRole.AUTHORITY_OFFICER, UserRole.SYSTEM_ADMIN]))
):
    problem = db.query(Problem).filter(Problem.id == id).first()
    if not problem:
        raise HTTPException(status_code=404, detail="Problem not found")

    # If officer, verify assignment
    if officer.role == UserRole.AUTHORITY_OFFICER and problem.assigned_officer_id != officer.id:
        # Allow if no officer assigned yet and belongs to their dept, or raise
        if problem.assigned_officer_id is not None:
            raise HTTPException(status_code=403, detail="You are not the assigned officer for this case")
        else:
            problem.assigned_officer_id = officer.id

    old_status = problem.status.value
    new_status = payload.new_status

    # Validate transition
    valid_transitions = {
        ProblemStatus.REPORTED: [ProblemStatus.UNDER_REVIEW, ProblemStatus.VERIFIED, ProblemStatus.REJECTED],
        ProblemStatus.UNDER_REVIEW: [ProblemStatus.VERIFIED, ProblemStatus.REJECTED],
        ProblemStatus.VERIFIED: [ProblemStatus.ASSIGNED],
        ProblemStatus.ASSIGNED: [ProblemStatus.IN_PROGRESS],
        ProblemStatus.IN_PROGRESS: [ProblemStatus.RESOLVED],
        ProblemStatus.RESOLVED: [ProblemStatus.CLOSED, ProblemStatus.IN_PROGRESS],
        ProblemStatus.CLOSED: [],
        ProblemStatus.REJECTED: [ProblemStatus.UNDER_REVIEW]
    }

    # Admins have override privileges, but officers follow valid transitions
    if officer.role == UserRole.AUTHORITY_OFFICER:
        allowed = valid_transitions.get(problem.status, [])
        if new_status not in allowed:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid status transition from {old_status} to {new_status.value}. Allowed: {[s.value for s in allowed]}"
            )

    problem.status = new_status
    if payload.notes:
        problem.resolution_notes = payload.notes
    if payload.resolution_evidence_url:
        problem.resolution_evidence_url = payload.resolution_evidence_url

    if new_status == ProblemStatus.RESOLVED:
        problem.resolved_at = datetime.utcnow()

    # Timeline entry
    timeline = StatusTimeline(
        problem_id=problem.id,
        previous_status=old_status,
        new_status=new_status.value,
        changed_by_name=officer.full_name,
        changed_by_role="Municipal Authority Officer",
        notes=payload.notes
    )
    db.add(timeline)

    # Citizen notification
    msg = f"Progress update on '{problem.title}': Status is now {new_status.value}."
    if new_status == ProblemStatus.RESOLVED:
        msg = f"Good news! Your reported issue '{problem.title}' has been marked as RESOLVED. Please provide feedback on the work done."

    notif = Notification(
        user_id=problem.citizen_id,
        title=f"Update on {problem.report_id}: {new_status.value}",
        message=msg,
        link=f"/issues/{problem.id}",
        notification_type="STATUS_UPDATE"
    )
    db.add(notif)

    # Audit log
    audit = AuditLog(
        user_id=officer.id,
        user_email=officer.email,
        action="UPDATE_PROBLEM_STATUS",
        target_type="PROBLEM",
        target_id=str(problem.id),
        details=f"Status transitioned from {old_status} to {new_status.value}. Notes: {payload.notes}"
    )
    db.add(audit)
    db.commit()
    db.refresh(problem)

    return _format_problem_response(problem, officer.id)


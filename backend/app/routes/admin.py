from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.db.session import get_db
from app.core.deps import require_roles
from app.models.entities import (
    User, UserRole, Problem, ProblemStatus, ProblemPriority,
    Department, StatusTimeline, Notification, AuditLog, DuplicateCandidate
)
from app.schemas.schemas import (
    ProblemResponse, ProblemVerifyRequest, ProblemAssignRequest,
    UserResponse
)
from app.routes.problems import _format_problem_response

router = APIRouter(prefix="/admin", tags=["Admin Portal"])

@router.get("/stats")
def get_admin_stats(
    db: Session = Depends(get_db),
    admin: User = Depends(require_roles([UserRole.SYSTEM_ADMIN]))
):
    total_reports = db.query(Problem).count()
    pending = db.query(Problem).filter(Problem.status.in_([ProblemStatus.REPORTED, ProblemStatus.UNDER_REVIEW])).count()
    verified = db.query(Problem).filter(Problem.status == ProblemStatus.VERIFIED).count()
    unassigned = db.query(Problem).filter(Problem.status == ProblemStatus.VERIFIED, Problem.assigned_officer_id.is_(None)).count()
    in_progress = db.query(Problem).filter(Problem.status == ProblemStatus.IN_PROGRESS).count()
    resolved = db.query(Problem).filter(Problem.status == ProblemStatus.RESOLVED).count()
    rejected = db.query(Problem).filter(Problem.status == ProblemStatus.REJECTED).count()
    total_users = db.query(User).count()
    duplicates_pending = db.query(DuplicateCandidate).filter(DuplicateCandidate.status == "PENDING_REVIEW").count()

    return {
        "total_reports": total_reports,
        "pending_verification": pending,
        "verified": verified,
        "unassigned": unassigned,
        "in_progress": in_progress,
        "resolved": resolved,
        "rejected": rejected,
        "total_users": total_users,
        "duplicates_pending": duplicates_pending
    }

@router.get("/pending-verification", response_model=List[ProblemResponse])
def get_pending_verification(
    db: Session = Depends(get_db),
    admin: User = Depends(require_roles([UserRole.SYSTEM_ADMIN]))
):
    problems = db.query(Problem).filter(
        Problem.status.in_([ProblemStatus.REPORTED, ProblemStatus.UNDER_REVIEW])
    ).order_by(desc(Problem.priority_score)).all()

    return [_format_problem_response(p, admin.id) for p in problems]

@router.post("/problems/{id}/verify", response_model=ProblemResponse)
def verify_problem(
    id: int,
    payload: ProblemVerifyRequest,
    db: Session = Depends(get_db),
    admin: User = Depends(require_roles([UserRole.SYSTEM_ADMIN]))
):
    problem = db.query(Problem).filter(Problem.id == id).first()
    if not problem:
        raise HTTPException(status_code=404, detail="Problem not found")

    old_status = problem.status.value
    if payload.is_verified:
        problem.status = ProblemStatus.VERIFIED
        new_status = ProblemStatus.VERIFIED.value
        note = "Verified by Administrator after content and authenticity review."
    else:
        problem.status = ProblemStatus.REJECTED
        new_status = ProblemStatus.REJECTED.value
        problem.rejection_reason = payload.rejection_reason or "Report does not meet municipal verification guidelines."
        note = f"Rejected: {problem.rejection_reason}"

    # Allow correction of category and priority by human admin
    if payload.adjusted_category:
        problem.category = payload.adjusted_category
    if payload.adjusted_priority:
        problem.priority = payload.adjusted_priority

    # Record timeline
    timeline = StatusTimeline(
        problem_id=problem.id,
        previous_status=old_status,
        new_status=new_status,
        changed_by_name=admin.full_name,
        changed_by_role="System Administrator",
        notes=note
    )
    db.add(timeline)

    # Notify citizen
    citizen_msg = f"Your report '{problem.title}' has been verified." if payload.is_verified else f"Your report '{problem.title}' was rejected: {problem.rejection_reason}"
    notif = Notification(
        user_id=problem.citizen_id,
        title=f"Report {problem.report_id} {new_status}",
        message=citizen_msg,
        link=f"/issues/{problem.id}",
        notification_type="STATUS_UPDATE"
    )
    db.add(notif)

    # Audit log
    audit = AuditLog(
        user_id=admin.id,
        user_email=admin.email,
        action="VERIFY_PROBLEM",
        target_type="PROBLEM",
        target_id=str(problem.id),
        details=f"Admin transitioned problem from {old_status} to {new_status}"
    )
    db.add(audit)
    db.commit()
    db.refresh(problem)

    return _format_problem_response(problem, admin.id)

@router.post("/problems/{id}/assign", response_model=ProblemResponse)
def assign_problem(
    id: int,
    payload: ProblemAssignRequest,
    db: Session = Depends(get_db),
    admin: User = Depends(require_roles([UserRole.SYSTEM_ADMIN]))
):
    problem = db.query(Problem).filter(Problem.id == id).first()
    if not problem:
        raise HTTPException(status_code=404, detail="Problem not found")

    dept = db.query(Department).filter(Department.id == payload.department_id).first()
    if not dept:
        raise HTTPException(status_code=404, detail="Department not found")

    officer = None
    if payload.officer_id:
        officer = db.query(User).filter(User.id == payload.officer_id).first()
        if not officer or officer.role != UserRole.AUTHORITY_OFFICER:
            raise HTTPException(status_code=400, detail="Invalid officer selected")

    old_status = problem.status.value
    problem.assigned_department_id = dept.id
    problem.assigned_officer_id = officer.id if officer else None
    problem.status = ProblemStatus.ASSIGNED

    # Timeline
    officer_info = f" to Officer {officer.full_name}" if officer else ""
    note = f"Assigned to {dept.name}{officer_info}. {payload.notes or ''}".strip()
    timeline = StatusTimeline(
        problem_id=problem.id,
        previous_status=old_status,
        new_status=ProblemStatus.ASSIGNED.value,
        changed_by_name=admin.full_name,
        changed_by_role="System Administrator",
        notes=note
    )
    db.add(timeline)

    # Notify officer if assigned
    if officer:
        notif_officer = Notification(
            user_id=officer.id,
            title="New Case Assignment",
            message=f"Case {problem.report_id} ({problem.title}) assigned to you.",
            link=f"/officer-dashboard",
            notification_type="CASE_ASSIGNED"
        )
        db.add(notif_officer)

    # Notify citizen
    notif_citizen = Notification(
        user_id=problem.citizen_id,
        title=f"Report {problem.report_id} Assigned",
        message=f"Your complaint has been assigned to {dept.name}{officer_info}.",
        link=f"/issues/{problem.id}",
        notification_type="STATUS_UPDATE"
    )
    db.add(notif_citizen)

    # Audit log
    audit = AuditLog(
        user_id=admin.id,
        user_email=admin.email,
        action="ASSIGN_PROBLEM",
        target_type="PROBLEM",
        target_id=str(problem.id),
        details=f"Assigned to Dept: {dept.name}, Officer: {officer.full_name if officer else 'None'}"
    )
    db.add(audit)
    db.commit()
    db.refresh(problem)

    return _format_problem_response(problem, admin.id)

@router.get("/users", response_model=List[UserResponse])
def get_all_users(
    db: Session = Depends(get_db),
    admin: User = Depends(require_roles([UserRole.SYSTEM_ADMIN]))
):
    users = db.query(User).order_by(desc(User.created_at)).all()
    return [UserResponse.model_validate(u) for u in users]

@router.post("/users/{id}/role")
def update_user_role(
    id: int,
    new_role: UserRole,
    db: Session = Depends(get_db),
    admin: User = Depends(require_roles([UserRole.SYSTEM_ADMIN]))
):
    target_user = db.query(User).filter(User.id == id).first()
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")

    old_role = target_user.role.value
    target_user.role = new_role

    audit = AuditLog(
        user_id=admin.id,
        user_email=admin.email,
        action="UPDATE_USER_ROLE",
        target_type="USER",
        target_id=str(target_user.id),
        details=f"Admin changed role of {target_user.email} from {old_role} to {new_role.value}"
    )
    db.add(audit)
    db.commit()

    return {"message": f"User {target_user.email} role updated to {new_role.value}"}

@router.get("/audit-logs")
def get_audit_logs(
    limit: int = 50,
    db: Session = Depends(get_db),
    admin: User = Depends(require_roles([UserRole.SYSTEM_ADMIN]))
):
    logs = db.query(AuditLog).order_by(desc(AuditLog.created_at)).limit(limit).all()
    return [
        {
            "id": l.id,
            "user_id": l.user_id,
            "user_email": l.user_email,
            "action": l.action,
            "target_type": l.target_type,
            "target_id": l.target_id,
            "details": l.details,
            "created_at": l.created_at
        }
        for l in logs
    ]


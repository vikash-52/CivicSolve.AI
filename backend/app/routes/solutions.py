from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.db.session import get_db
from app.core.deps import get_current_user, get_optional_current_user, require_roles
from app.models.entities import (
    User, UserRole, Challenge, SolutionProposal, ProjectTask,
    ProjectMilestone, IndustryInterest, Notification, AuditLog
)
from app.schemas.schemas import (
    ChallengeCreate, ChallengeResponse, ProposalCreate, ProposalResponse,
    TaskCreate, TaskResponse, MilestoneCreate, MilestoneResponse,
    FacultyReviewRequest, IndustryInterestCreate, IndustryInterestResponse
)

router = APIRouter(prefix="/solutions", tags=["Solution Hub & Innovation"])

def _format_proposal(p: SolutionProposal) -> dict:
    return {
        "id": p.id,
        "challenge_id": p.challenge_id,
        "challenge_title": p.challenge.title if p.challenge else None,
        "team_name": p.team_name,
        "university_name": p.university_name,
        "lead_user_id": p.lead_user_id,
        "title": p.title,
        "approach": p.approach,
        "tech_stack": p.tech_stack,
        "expected_impact": p.expected_impact,
        "timeline_weeks": p.timeline_weeks,
        "prototype_url": p.prototype_url,
        "status": p.status,
        "faculty_reviewer_id": p.faculty_reviewer_id,
        "faculty_feedback": p.faculty_feedback,
        "is_demo": p.is_demo,
        "created_at": p.created_at,
        "updated_at": p.updated_at,
        "tasks": [
            {
                "id": t.id,
                "title": t.title,
                "description": t.description,
                "assigned_to": t.assigned_to,
                "status": t.status,
                "due_date": t.due_date,
                "created_at": t.created_at
            }
            for t in p.tasks
        ] if p.tasks else [],
        "milestones": [
            {
                "id": m.id,
                "title": m.title,
                "description": m.description,
                "target_date": m.target_date,
                "is_completed": m.is_completed,
                "created_at": m.created_at
            }
            for m in p.milestones
        ] if p.milestones else []
    }

@router.get("/challenges", response_model=List[ChallengeResponse])
def get_challenges(db: Session = Depends(get_db)):
    challenges = db.query(Challenge).order_by(desc(Challenge.created_at)).all()
    results = []
    for c in challenges:
        results.append({
            "id": c.id,
            "code": c.code,
            "title": c.title,
            "problem_statement": c.problem_statement,
            "category": c.category,
            "location": c.location,
            "desired_outcomes": c.desired_outcomes,
            "required_skills": c.required_skills,
            "status": c.status,
            "is_demo": c.is_demo,
            "created_at": c.created_at,
            "proposals_count": len(c.proposals) if c.proposals else 0
        })
    return results

@router.post("/challenges", response_model=ChallengeResponse)
def create_challenge(
    payload: ChallengeCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    count = db.query(Challenge).count() + 1
    code = f"CH-2026-{count:02d}"

    challenge = Challenge(
        code=code,
        title=payload.title,
        problem_statement=payload.problem_statement,
        category=payload.category,
        location=payload.location,
        desired_outcomes=payload.desired_outcomes,
        required_skills=payload.required_skills,
        status="ACTIVE",
        is_demo=False
    )
    db.add(challenge)
    db.commit()
    db.refresh(challenge)

    return {
        "id": challenge.id,
        "code": challenge.code,
        "title": challenge.title,
        "problem_statement": challenge.problem_statement,
        "category": challenge.category,
        "location": challenge.location,
        "desired_outcomes": challenge.desired_outcomes,
        "required_skills": challenge.required_skills,
        "status": challenge.status,
        "is_demo": challenge.is_demo,
        "created_at": challenge.created_at,
        "proposals_count": 0
    }

@router.get("/proposals", response_model=List[ProposalResponse])
def get_proposals(
    challenge_id: Optional[int] = None,
    my_proposals: bool = False,
    db: Session = Depends(get_db),
    user: Optional[User] = Depends(get_optional_current_user)
):
    query = db.query(SolutionProposal)
    if challenge_id:
        query = query.filter(SolutionProposal.challenge_id == challenge_id)
    if my_proposals and user:
        query = query.filter(SolutionProposal.lead_user_id == user.id)

    proposals = query.order_by(desc(SolutionProposal.created_at)).all()
    return [_format_proposal(p) for p in proposals]

@router.get("/proposals/{id}", response_model=ProposalResponse)
def get_proposal_by_id(id: int, db: Session = Depends(get_db)):
    proposal = db.query(SolutionProposal).filter(SolutionProposal.id == id).first()
    if not proposal:
        raise HTTPException(status_code=404, detail="Proposal not found")
    return _format_proposal(proposal)

@router.post("/proposals", response_model=ProposalResponse)
def create_proposal(
    payload: ProposalCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    challenge = db.query(Challenge).filter(Challenge.id == payload.challenge_id).first()
    if not challenge:
        raise HTTPException(status_code=404, detail="Challenge not found")

    proposal = SolutionProposal(
        challenge_id=payload.challenge_id,
        team_name=payload.team_name,
        university_name=payload.university_name,
        lead_user_id=user.id,
        title=payload.title,
        approach=payload.approach,
        tech_stack=payload.tech_stack,
        expected_impact=payload.expected_impact,
        timeline_weeks=payload.timeline_weeks,
        prototype_url=payload.prototype_url,
        status="SUBMITTED",
        is_demo=False
    )
    db.add(proposal)
    db.commit()
    db.refresh(proposal)

    # Initial milestone & task
    m1 = ProjectMilestone(
        proposal_id=proposal.id,
        title="Literature & System Architecture Design",
        description="Finalize hardware/software architecture and baseline models.",
        target_date="Week 2",
        is_completed=True
    )
    t1 = ProjectTask(
        proposal_id=proposal.id,
        title="Requirement Gathering and Sensor / API Benchmarking",
        description="Survey existing civic APIs and hardware component spec sheets.",
        assigned_to="Team Lead",
        status="COMPLETED",
        due_date="Week 1"
    )
    db.add(m1)
    db.add(t1)
    db.commit()
    db.refresh(proposal)

    return _format_proposal(proposal)

@router.post("/proposals/{id}/review", response_model=ProposalResponse)
def review_proposal(
    id: int,
    payload: FacultyReviewRequest,
    db: Session = Depends(get_db),
    faculty: User = Depends(require_roles([UserRole.FACULTY_MENTOR, UserRole.SYSTEM_ADMIN]))
):
    proposal = db.query(SolutionProposal).filter(SolutionProposal.id == id).first()
    if not proposal:
        raise HTTPException(status_code=404, detail="Proposal not found")

    proposal.status = payload.status
    proposal.faculty_reviewer_id = faculty.id
    proposal.faculty_feedback = payload.feedback

    # Notify team lead
    notif = Notification(
        user_id=proposal.lead_user_id,
        title=f"Faculty Review on Proposal: {payload.status}",
        message=f"Faculty Mentor {faculty.full_name} reviewed your proposal '{proposal.title}'. Feedback: {payload.feedback}",
        link=f"/solutions/proposals/{proposal.id}",
        notification_type="PROPOSAL_REVIEWED"
    )
    db.add(notif)
    db.commit()
    db.refresh(proposal)

    return _format_proposal(proposal)

@router.post("/proposals/{id}/tasks", response_model=TaskResponse)
def add_task(
    id: int,
    payload: TaskCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    proposal = db.query(SolutionProposal).filter(SolutionProposal.id == id).first()
    if not proposal:
        raise HTTPException(status_code=404, detail="Proposal not found")

    task = ProjectTask(
        proposal_id=id,
        title=payload.title,
        description=payload.description,
        assigned_to=payload.assigned_to or user.full_name,
        status="TODO",
        due_date=payload.due_date
    )
    db.add(task)
    db.commit()
    db.refresh(task)

    return task

@router.patch("/tasks/{task_id}/status", response_model=TaskResponse)
def update_task_status(
    task_id: int,
    new_status: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    task = db.query(ProjectTask).filter(ProjectTask.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    task.status = new_status
    db.commit()
    db.refresh(task)
    return task

@router.post("/proposals/{id}/milestones", response_model=MilestoneResponse)
def add_milestone(
    id: int,
    payload: MilestoneCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    proposal = db.query(SolutionProposal).filter(SolutionProposal.id == id).first()
    if not proposal:
        raise HTTPException(status_code=404, detail="Proposal not found")

    milestone = ProjectMilestone(
        proposal_id=id,
        title=payload.title,
        description=payload.description,
        target_date=payload.target_date,
        is_completed=False
    )
    db.add(milestone)
    db.commit()
    db.refresh(milestone)
    return milestone

@router.patch("/milestones/{milestone_id}/toggle", response_model=MilestoneResponse)
def toggle_milestone(
    milestone_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    milestone = db.query(ProjectMilestone).filter(ProjectMilestone.id == milestone_id).first()
    if not milestone:
        raise HTTPException(status_code=404, detail="Milestone not found")

    milestone.is_completed = not milestone.is_completed
    db.commit()
    db.refresh(milestone)
    return milestone

@router.post("/proposals/{id}/interest", response_model=IndustryInterestResponse)
def express_industry_interest(
    id: int,
    payload: IndustryInterestCreate,
    db: Session = Depends(get_db),
    partner: User = Depends(require_roles([UserRole.INDUSTRY_PARTNER, UserRole.SYSTEM_ADMIN]))
):
    proposal = db.query(SolutionProposal).filter(SolutionProposal.id == id).first()
    if not proposal:
        raise HTTPException(status_code=404, detail="Proposal not found")

    interest = IndustryInterest(
        proposal_id=id,
        partner_user_id=partner.id,
        company_name=payload.company_name,
        interest_type=payload.interest_type,
        proposal_notes=payload.proposal_notes,
        status="PENDING"
    )
    db.add(interest)
    db.commit()
    db.refresh(interest)

    # Notify student team lead
    notif = Notification(
        user_id=proposal.lead_user_id,
        title=f"Industry Interest Received: {payload.company_name}",
        message=f"{payload.company_name} expressed {payload.interest_type} interest in your project '{proposal.title}'.",
        link=f"/solutions/proposals/{proposal.id}",
        notification_type="INDUSTRY_INTEREST"
    )
    db.add(notif)
    db.commit()

    return interest


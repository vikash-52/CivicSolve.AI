import os
import shutil
import uuid
from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc, asc, or_
from app.db.session import get_db
from app.core.config import settings
from app.core.deps import get_current_user, get_optional_current_user
from app.models.entities import (
    Problem, ProblemStatus, ProblemPriority, Attachment, StatusTimeline,
    Comment, SupportVote, SavedProblem, AIAnalysisRecord, DuplicateCandidate,
    Notification, AuditLog, CitizenFeedback, User, UserRole, Department
)
from app.schemas.schemas import (
    ProblemCreate, ProblemResponse, CommentCreate, CommentResponse,
    CitizenFeedbackCreate, CitizenFeedbackResponse, DuplicateMatch
)
from app.services.ai_service import AIService

router = APIRouter(prefix="/problems", tags=["Civic Problems"])

def _format_problem_response(p: Problem, current_user_id: Optional[int] = None) -> dict:
    votes_count = len(p.votes) if p.votes else 0
    has_voted = any(v.user_id == current_user_id for v in p.votes) if current_user_id and p.votes else False
    is_saved = any(s.user_id == current_user_id for s in p.saved_by) if current_user_id and p.saved_by else False
    comments_count = len(p.comments) if p.comments else 0

    return {
        "id": p.id,
        "report_id": p.report_id,
        "title": p.title,
        "description": p.description,
        "category": p.category,
        "subcategory": p.subcategory,
        "status": p.status,
        "priority": p.priority,
        "priority_score": p.priority_score,
        "priority_explanation": p.priority_explanation,
        "safety_hazard": p.safety_hazard,
        "urgency_level": p.urgency_level,
        "address": p.address,
        "locality": p.locality,
        "landmark": p.landmark,
        "city": p.city,
        "latitude": p.latitude,
        "longitude": p.longitude,
        "citizen_id": p.citizen_id,
        "citizen_name": p.citizen.full_name if p.citizen else "Anonymous Citizen",
        "assigned_department_id": p.assigned_department_id,
        "assigned_department_name": p.assigned_department.name if p.assigned_department else None,
        "assigned_officer_id": p.assigned_officer_id,
        "assigned_officer_name": p.assigned_officer.full_name if p.assigned_officer else None,
        "rejection_reason": p.rejection_reason,
        "resolution_notes": p.resolution_notes,
        "resolution_evidence_url": p.resolution_evidence_url,
        "resolved_at": p.resolved_at,
        "is_demo": p.is_demo,
        "demo_label": p.demo_label,
        "created_at": p.created_at,
        "updated_at": p.updated_at,
        "votes_count": votes_count,
        "has_voted": has_voted,
        "is_saved": is_saved,
        "comments_count": comments_count,
        "attachments": [
            {
                "id": a.id,
                "file_path": a.file_path,
                "original_filename": a.original_filename,
                "file_type": a.file_type,
                "file_size": a.file_size,
                "created_at": a.created_at
            } for a in p.attachments
        ] if p.attachments else [],
        "timeline": [
            {
                "id": t.id,
                "previous_status": t.previous_status,
                "new_status": t.new_status,
                "changed_by_name": t.changed_by_name,
                "changed_by_role": t.changed_by_role,
                "notes": t.notes,
                "created_at": t.created_at
            } for t in p.timeline
        ] if p.timeline else [],
        "ai_analysis": {
            "suggested_category": p.ai_analysis.suggested_category,
            "confidence_score": p.ai_analysis.confidence_score,
            "calculated_priority_score": p.ai_analysis.calculated_priority_score,
            "suggested_priority": p.ai_analysis.suggested_priority,
            "risk_factors": p.ai_analysis.risk_factors,
            "recommended_department": p.ai_analysis.recommended_department,
            "duplicate_candidates_count": p.ai_analysis.duplicate_candidates_count,
        } if p.ai_analysis else None
    }

@router.get("", response_model=List[ProblemResponse])
def get_problems(
    search: Optional[str] = None,
    category: Optional[str] = None,
    status: Optional[str] = None,
    priority: Optional[str] = None,
    sort_by: Optional[str] = "newest", # newest, priority, support
    my_reports: bool = False,
    saved_only: bool = False,
    limit: int = 50,
    offset: int = 0,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user)
):
    query = db.query(Problem)

    if my_reports:
        if not current_user:
            raise HTTPException(status_code=401, detail="Must be logged in to view personal reports")
        query = query.filter(Problem.citizen_id == current_user.id)
    
    if saved_only:
        if not current_user:
            raise HTTPException(status_code=401, detail="Must be logged in to view saved reports")
        query = query.join(SavedProblem).filter(SavedProblem.user_id == current_user.id)

    if search:
        search_filter = or_(
            Problem.title.ilike(f"%{search}%"),
            Problem.description.ilike(f"%{search}%"),
            Problem.address.ilike(f"%{search}%"),
            Problem.report_id.ilike(f"%{search}%")
        )
        query = query.filter(search_filter)

    if category and category != "All":
        query = query.filter(Problem.category == category)

    if status and status != "All":
        query = query.filter(Problem.status == status)

    if priority and priority != "All":
        query = query.filter(Problem.priority == priority)

    if sort_by == "priority":
        query = query.order_by(desc(Problem.priority_score), desc(Problem.created_at))
    else: # default newest
        query = query.order_by(desc(Problem.created_at))

    problems = query.offset(offset).limit(limit).all()

    user_id = current_user.id if current_user else None
    results = [_format_problem_response(p, user_id) for p in problems]

    if sort_by == "support":
        results.sort(key=lambda x: x["votes_count"], reverse=True)

    return results

@router.get("/{id}", response_model=ProblemResponse)
def get_problem_by_id(
    id: int,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user)
):
    problem = db.query(Problem).filter(Problem.id == id).first()
    if not problem:
        raise HTTPException(status_code=404, detail="Problem report not found")
    
    user_id = current_user.id if current_user else None
    return _format_problem_response(problem, user_id)

@router.post("", response_model=ProblemResponse, status_code=status.HTTP_201_CREATED)
def create_problem(
    payload: ProblemCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # 1. Generate unique human-readable report ID: e.g. CS-2026-XXXX
    count = db.query(Problem).count() + 1
    report_id = f"CS-2026-{count:04d}"

    # 2. AI Category Classification
    ai_category, conf_score = AIService.classify_category(payload.title, payload.description)
    category_to_use = payload.category if payload.category and payload.category != "Auto-Detect" else ai_category

    # 3. AI Priority Estimation
    priority_score, priority_level, explanation, factors = AIService.calculate_priority(
        payload.title, payload.description, payload.urgency_level, payload.safety_hazard
    )

    # 4. Department Recommendation
    recommended_dept = AIService.recommend_department(category_to_use, payload.locality)

    # 5. Create Problem Record
    new_problem = Problem(
        report_id=report_id,
        title=payload.title,
        description=payload.description,
        category=category_to_use,
        subcategory=payload.subcategory,
        status=ProblemStatus.REPORTED,
        priority=priority_level,
        priority_score=priority_score,
        priority_explanation=explanation,
        safety_hazard=payload.safety_hazard,
        urgency_level=payload.urgency_level,
        address=payload.address,
        locality=payload.locality,
        landmark=payload.landmark,
        city=payload.city,
        latitude=payload.latitude,
        longitude=payload.longitude,
        citizen_id=current_user.id,
        is_demo=False
    )
    db.add(new_problem)
    db.commit()
    db.refresh(new_problem)

    # 6. Status Timeline entry
    timeline_entry = StatusTimeline(
        problem_id=new_problem.id,
        previous_status=None,
        new_status=ProblemStatus.REPORTED.value,
        changed_by_name=current_user.full_name,
        changed_by_role=current_user.role.value,
        notes="Citizen submitted complaint report with location and details."
    )
    db.add(timeline_entry)

    # 7. AI Duplicate Detection against existing database reports
    existing = db.query(Problem).filter(Problem.id != new_problem.id).all()
    existing_dicts = [
        {
            "id": p.id,
            "report_id": p.report_id,
            "title": p.title,
            "description": p.description,
            "latitude": p.latitude,
            "longitude": p.longitude,
            "status": p.status.value
        }
        for p in existing
    ]
    duplicate_matches = AIService.find_duplicates(
        new_problem.title,
        new_problem.description,
        new_problem.latitude,
        new_problem.longitude,
        existing_dicts
    )

    # Save duplicate candidates
    for match in duplicate_matches:
        candidate = DuplicateCandidate(
            source_problem_id=new_problem.id,
            target_problem_id=match["id"],
            similarity_score=match["similarity_score"],
            distance_meters=match.get("distance_meters"),
            status="PENDING_REVIEW"
        )
        db.add(candidate)

    # 8. Save AI Analysis Record
    ai_record = AIAnalysisRecord(
        problem_id=new_problem.id,
        suggested_category=ai_category,
        confidence_score=conf_score,
        calculated_priority_score=priority_score,
        suggested_priority=priority_level.value,
        risk_factors="; ".join(factors),
        recommended_department=recommended_dept,
        duplicate_candidates_count=len(duplicate_matches)
    )
    db.add(ai_record)

    # 9. Citizen In-App Notification
    notif = Notification(
        user_id=current_user.id,
        title=f"Report Submitted: {report_id}",
        message=f"Your complaint '{payload.title}' has been registered and is queued for verification.",
        link=f"/issues/{new_problem.id}",
        notification_type="REPORT_SUBMITTED"
    )
    db.add(notif)

    # 10. Audit Log
    audit = AuditLog(
        user_id=current_user.id,
        user_email=current_user.email,
        action="PROBLEM_SUBMITTED",
        target_type="PROBLEM",
        target_id=str(new_problem.id),
        details=f"Created report {report_id} with priority {priority_level.value}"
    )
    db.add(audit)
    db.commit()
    db.refresh(new_problem)

    return _format_problem_response(new_problem, current_user.id)

@router.post("/{id}/upload")
def upload_attachment(
    id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    problem = db.query(Problem).filter(Problem.id == id).first()
    if not problem:
        raise HTTPException(status_code=404, detail="Problem not found")

    # Authorize: citizen owner or officer/admin
    if problem.citizen_id != current_user.id and current_user.role not in [UserRole.SYSTEM_ADMIN, UserRole.AUTHORITY_OFFICER]:
        raise HTTPException(status_code=403, detail="Not authorized to attach files to this problem")

    # Validate file extension (supporting images, videos, and PDFs)
    ext = os.path.splitext(file.filename)[1].lower()
    allowed_extensions = [".jpg", ".jpeg", ".png", ".webp", ".pdf", ".mp4", ".webm", ".mov", ".mkv"]
    if ext not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file format '{ext}'. Allowed: {', '.join(allowed_extensions)}"
        )

    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    unique_filename = f"{uuid.uuid4().hex}_{file.filename}"
    file_path = os.path.join(settings.UPLOAD_DIR, unique_filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    file_size = os.path.getsize(file_path)

    attachment = Attachment(
        problem_id=problem.id,
        file_path=f"/uploads/{unique_filename}",
        original_filename=file.filename,
        file_type=file.content_type or "image/jpeg",
        file_size=file_size
    )
    db.add(attachment)
    db.commit()
    db.refresh(attachment)

    return {
        "id": attachment.id,
        "file_path": attachment.file_path,
        "original_filename": attachment.original_filename
    }

@router.post("/{id}/vote")
def vote_problem(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    problem = db.query(Problem).filter(Problem.id == id).first()
    if not problem:
        raise HTTPException(status_code=404, detail="Problem not found")

    existing_vote = db.query(SupportVote).filter(
        SupportVote.problem_id == id,
        SupportVote.user_id == current_user.id
    ).first()

    if existing_vote:
        raise HTTPException(status_code=400, detail="You have already supported this issue")

    vote = SupportVote(problem_id=id, user_id=current_user.id)
    db.add(vote)
    db.commit()

    return {"message": "Support added successfully", "votes_count": len(problem.votes)}

@router.delete("/{id}/vote")
def remove_vote(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    vote = db.query(SupportVote).filter(
        SupportVote.problem_id == id,
        SupportVote.user_id == current_user.id
    ).first()

    if not vote:
        raise HTTPException(status_code=404, detail="Vote not found")

    db.delete(vote)
    db.commit()
    return {"message": "Support removed"}

@router.post("/{id}/save")
def save_problem(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    existing = db.query(SavedProblem).filter(
        SavedProblem.problem_id == id,
        SavedProblem.user_id == current_user.id
    ).first()
    if existing:
        return {"message": "Issue is already in your saved list"}

    saved = SavedProblem(problem_id=id, user_id=current_user.id)
    db.add(saved)
    db.commit()
    return {"message": "Issue saved to personal list"}

@router.delete("/{id}/save")
def unsave_problem(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    saved = db.query(SavedProblem).filter(
        SavedProblem.problem_id == id,
        SavedProblem.user_id == current_user.id
    ).first()
    if saved:
        db.delete(saved)
        db.commit()
    return {"message": "Issue removed from saved list"}

@router.get("/{id}/comments", response_model=List[CommentResponse])
def get_comments(id: int, db: Session = Depends(get_db)):
    comments = db.query(Comment).filter(Comment.problem_id == id).order_by(Comment.created_at.asc()).all()
    return comments

@router.post("/{id}/comments", response_model=CommentResponse)
def add_comment(
    id: int,
    payload: CommentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    problem = db.query(Problem).filter(Problem.id == id).first()
    if not problem:
        raise HTTPException(status_code=404, detail="Problem not found")

    comment = Comment(
        problem_id=id,
        user_id=current_user.id,
        content=payload.content.strip()
    )
    db.add(comment)
    db.commit()
    db.refresh(comment)

    # Notify issue reporter if someone else commented
    if problem.citizen_id != current_user.id:
        notif = Notification(
            user_id=problem.citizen_id,
            title="New Comment on Your Issue",
            message=f"{current_user.full_name} commented on '{problem.title}'",
            link=f"/issues/{problem.id}",
            notification_type="COMMENT_ADDED"
        )
        db.add(notif)
        db.commit()

    return comment

@router.post("/{id}/feedback", response_model=CitizenFeedbackResponse)
def submit_feedback(
    id: int,
    payload: CitizenFeedbackCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    problem = db.query(Problem).filter(Problem.id == id).first()
    if not problem:
        raise HTTPException(status_code=404, detail="Problem not found")
    if problem.citizen_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only the citizen who reported the problem can submit resolution feedback")
    if problem.status != ProblemStatus.RESOLVED and problem.status != ProblemStatus.CLOSED:
        raise HTTPException(status_code=400, detail="Feedback can only be provided after the issue has been resolved")

    existing_fb = db.query(CitizenFeedback).filter(CitizenFeedback.problem_id == id).first()
    if existing_fb:
        raise HTTPException(status_code=400, detail="Feedback has already been submitted for this issue")

    fb = CitizenFeedback(
        problem_id=id,
        citizen_id=current_user.id,
        rating=payload.rating,
        satisfaction_level=payload.satisfaction_level or "Satisfied",
        comments=payload.comments
    )
    db.add(fb)
    db.commit()
    db.refresh(fb)

    return fb

@router.get("/{id}/duplicates", response_model=List[DuplicateMatch])
def get_duplicates(id: int, db: Session = Depends(get_db)):
    candidates = db.query(DuplicateCandidate).filter(DuplicateCandidate.source_problem_id == id).all()
    results = []
    for c in candidates:
        target = db.query(Problem).filter(Problem.id == c.target_problem_id).first()
        if target:
            results.append({
                "id": target.id,
                "report_id": target.report_id,
                "title": target.title,
                "description": target.description,
                "similarity_score": c.similarity_score,
                "distance_meters": c.distance_meters,
                "status": c.status
            })
    return results


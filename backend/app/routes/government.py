from typing import List, Dict, Any
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.db.session import get_db
from app.core.deps import require_roles, get_optional_current_user
from app.models.entities import (
    User, UserRole, Problem, ProblemStatus, ProblemPriority, Department
)

router = APIRouter(prefix="/government", tags=["Government Command Center"])

@router.get("/analytics")
def get_analytics(
    db: Session = Depends(get_db)
):
    total = db.query(Problem).count()
    pending = db.query(Problem).filter(Problem.status.in_([ProblemStatus.REPORTED, ProblemStatus.UNDER_REVIEW])).count()
    verified = db.query(Problem).filter(Problem.status == ProblemStatus.VERIFIED).count()
    in_progress = db.query(Problem).filter(Problem.status == ProblemStatus.IN_PROGRESS).count()
    resolved = db.query(Problem).filter(Problem.status == ProblemStatus.RESOLVED).count()
    rejected = db.query(Problem).filter(Problem.status == ProblemStatus.REJECTED).count()

    # Priority distribution
    priority_counts = {
        "CRITICAL": db.query(Problem).filter(Problem.priority == ProblemPriority.CRITICAL).count(),
        "HIGH": db.query(Problem).filter(Problem.priority == ProblemPriority.HIGH).count(),
        "MEDIUM": db.query(Problem).filter(Problem.priority == ProblemPriority.MEDIUM).count(),
        "LOW": db.query(Problem).filter(Problem.priority == ProblemPriority.LOW).count(),
    }

    # Category distribution
    categories = db.query(Problem.category, func.count(Problem.id)).group_by(Problem.category).all()
    category_data = [{"category": c[0], "count": c[1]} for c in categories]

    # Department workload
    dept_workload = []
    departments = db.query(Department).all()
    for d in departments:
        active_count = db.query(Problem).filter(
            Problem.assigned_department_id == d.id,
            Problem.status.in_([ProblemStatus.ASSIGNED, ProblemStatus.IN_PROGRESS])
        ).count()
        resolved_count = db.query(Problem).filter(
            Problem.assigned_department_id == d.id,
            Problem.status == ProblemStatus.RESOLVED
        ).count()
        dept_workload.append({
            "department": d.name,
            "code": d.code,
            "active_cases": active_count,
            "resolved_cases": resolved_count
        })

    # Resolution rate percentage
    res_rate = round((resolved / total * 100), 1) if total > 0 else 0.0

    return {
        "metrics": {
            "total_reports": total,
            "pending_verification": pending,
            "verified": verified,
            "in_progress": in_progress,
            "resolved": resolved,
            "rejected": rejected,
            "resolution_rate_percent": res_rate
        },
        "priority_distribution": priority_counts,
        "category_distribution": category_data,
        "department_workload": dept_workload,
        "is_demo_included": True
    }

@router.get("/map")
def get_map_points(
    db: Session = Depends(get_db)
):
    """
    Returns geo-tagged issue coordinates for the interactive Leaflet map.
    """
    problems = db.query(Problem).filter(
        Problem.latitude.isnot(None),
        Problem.longitude.isnot(None)
    ).all()

    points = []
    for p in problems:
        points.append({
            "id": p.id,
            "report_id": p.report_id,
            "title": p.title,
            "category": p.category,
            "status": p.status.value,
            "priority": p.priority.value,
            "priority_score": p.priority_score,
            "latitude": p.latitude,
            "longitude": p.longitude,
            "address": p.address,
            "locality": p.locality,
            "is_demo": p.is_demo
        })

    return points


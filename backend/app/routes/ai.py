from typing import Optional, List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.entities import Problem
from app.schemas.schemas import ProblemCreate, AIAnalysisSummary, DuplicateMatch
from app.services.ai_service import AIService

router = APIRouter(prefix="/ai", tags=["AI Engine"])

@router.post("/analyze-preview")
def preview_ai_analysis(
    payload: ProblemCreate,
    db: Session = Depends(get_db)
):
    """
    Real-time interactive AI assistance preview for the reporting wizard.
    Analyzes title, description, urgency, and hazard to provide instant suggestions.
    """
    category, confidence = AIService.classify_category(payload.title, payload.description)
    priority_score, priority_level, explanation, factors = AIService.calculate_priority(
        payload.title, payload.description, payload.urgency_level, payload.safety_hazard
    )
    recommended_dept = AIService.recommend_department(category, payload.locality)

    # Check duplicates against current database
    existing = db.query(Problem).all()
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
    duplicates = AIService.find_duplicates(
        payload.title,
        payload.description,
        payload.latitude,
        payload.longitude,
        existing_dicts
    )

    return {
        "suggested_category": category,
        "confidence_score": confidence,
        "calculated_priority_score": priority_score,
        "suggested_priority": priority_level.value,
        "priority_explanation": explanation,
        "risk_factors": factors,
        "recommended_department": recommended_dept,
        "duplicate_candidates": duplicates,
        "is_ai_assisted": True
    }


from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.entities import Department, User, UserRole
from app.schemas.schemas import DepartmentResponse, UserResponse

router = APIRouter(prefix="/departments", tags=["Departments & Jurisdictions"])

@router.get("", response_model=List[DepartmentResponse])
def get_departments(db: Session = Depends(get_db)):
    return db.query(Department).all()

@router.get("/{id}/officers", response_model=List[UserResponse])
def get_department_officers(id: int, db: Session = Depends(get_db)):
    officers = db.query(User).filter(User.role == UserRole.AUTHORITY_OFFICER).all()
    return [UserResponse.model_validate(o) for o in officers]


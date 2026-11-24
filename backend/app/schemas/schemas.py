from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from app.models.entities import UserRole, ProblemStatus, ProblemPriority

# Auth & User
class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)
    full_name: str = Field(..., min_length=2)
    role: UserRole = UserRole.CITIZEN
    phone: Optional[str] = None
    organization: Optional[str] = None
    jurisdiction: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    email: str
    full_name: str
    role: UserRole
    phone: Optional[str] = None
    organization: Optional[str] = None
    jurisdiction: Optional[str] = None
    is_active: bool
    is_verified: bool
    avatar_url: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

# Departments
class DepartmentBase(BaseModel):
    name: str
    code: str
    contact_email: Optional[str] = None
    jurisdiction: Optional[str] = None
    categories: Optional[str] = None

class DepartmentResponse(DepartmentBase):
    id: int

    class Config:
        from_attributes = True

# Problems
class AttachmentResponse(BaseModel):
    id: int
    file_path: str
    original_filename: str
    file_type: str
    file_size: int
    created_at: datetime

    class Config:
        from_attributes = True

class StatusTimelineResponse(BaseModel):
    id: int
    previous_status: Optional[str] = None
    new_status: str
    changed_by_name: str
    changed_by_role: str
    notes: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class CommentCreate(BaseModel):
    content: str = Field(..., min_length=1, max_length=1000)

class CommentResponse(BaseModel):
    id: int
    content: str
    created_at: datetime
    user: UserResponse

    class Config:
        from_attributes = True

class ProblemCreate(BaseModel):
    title: str = Field(..., min_length=5, max_length=255)
    description: str = Field(..., min_length=15)
    category: str
    subcategory: Optional[str] = None
    urgency_level: str = "Medium"
    safety_hazard: bool = False
    address: str
    locality: Optional[str] = None
    landmark: Optional[str] = None
    city: str = "Metro City"
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class AIAnalysisSummary(BaseModel):
    suggested_category: str
    confidence_score: float
    calculated_priority_score: float
    suggested_priority: str
    risk_factors: Optional[str] = None
    recommended_department: Optional[str] = None
    duplicate_candidates_count: int = 0

    class Config:
        from_attributes = True

class DuplicateMatch(BaseModel):
    id: int
    report_id: str
    title: str
    description: str
    similarity_score: float
    distance_meters: Optional[float] = None
    status: str

class ProblemResponse(BaseModel):
    id: int
    report_id: str
    title: str
    description: str
    category: str
    subcategory: Optional[str] = None
    status: ProblemStatus
    priority: ProblemPriority
    priority_score: float
    priority_explanation: Optional[str] = None
    safety_hazard: bool
    urgency_level: str
    address: str
    locality: Optional[str] = None
    landmark: Optional[str] = None
    city: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    citizen_id: int
    citizen_name: Optional[str] = None
    assigned_department_id: Optional[int] = None
    assigned_department_name: Optional[str] = None
    assigned_officer_id: Optional[int] = None
    assigned_officer_name: Optional[str] = None
    rejection_reason: Optional[str] = None
    resolution_notes: Optional[str] = None
    resolution_evidence_url: Optional[str] = None
    resolved_at: Optional[datetime] = None
    is_demo: bool = False
    demo_label: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    
    votes_count: int = 0
    has_voted: bool = False
    is_saved: bool = False
    comments_count: int = 0
    attachments: List[AttachmentResponse] = []
    timeline: List[StatusTimelineResponse] = []
    ai_analysis: Optional[AIAnalysisSummary] = None

    class Config:
        from_attributes = True

class ProblemVerifyRequest(BaseModel):
    is_verified: bool
    rejection_reason: Optional[str] = None
    adjusted_category: Optional[str] = None
    adjusted_priority: Optional[ProblemPriority] = None

class ProblemAssignRequest(BaseModel):
    department_id: int
    officer_id: Optional[int] = None
    notes: Optional[str] = None

class ProblemStatusUpdateRequest(BaseModel):
    new_status: ProblemStatus
    notes: str
    resolution_evidence_url: Optional[str] = None

class CitizenFeedbackCreate(BaseModel):
    rating: int = Field(..., ge=1, le=5)
    satisfaction_level: Optional[str] = "Satisfied"
    comments: Optional[str] = None

class CitizenFeedbackResponse(BaseModel):
    id: int
    rating: int
    satisfaction_level: str
    comments: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class NotificationResponse(BaseModel):
    id: int
    title: str
    message: str
    link: Optional[str] = None
    is_read: bool
    notification_type: str
    created_at: datetime

    class Config:
        from_attributes = True

# Innovation & Solution Hub
class ChallengeCreate(BaseModel):
    title: str
    problem_statement: str
    category: str
    location: str
    desired_outcomes: str
    required_skills: Optional[str] = None

class ChallengeResponse(BaseModel):
    id: int
    code: str
    title: str
    problem_statement: str
    category: str
    location: str
    desired_outcomes: str
    required_skills: Optional[str] = None
    status: str
    is_demo: bool
    created_at: datetime
    proposals_count: int = 0

    class Config:
        from_attributes = True

class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = None
    assigned_to: Optional[str] = None
    due_date: Optional[str] = None

class TaskResponse(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    assigned_to: Optional[str] = None
    status: str
    due_date: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class MilestoneCreate(BaseModel):
    title: str
    description: Optional[str] = None
    target_date: Optional[str] = None

class MilestoneResponse(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    target_date: Optional[str] = None
    is_completed: bool
    created_at: datetime

    class Config:
        from_attributes = True

class ProposalCreate(BaseModel):
    challenge_id: int
    team_name: str
    university_name: str
    title: str
    approach: str
    tech_stack: str
    expected_impact: str
    timeline_weeks: int = 8
    prototype_url: Optional[str] = None

class ProposalResponse(BaseModel):
    id: int
    challenge_id: int
    challenge_title: Optional[str] = None
    team_name: str
    university_name: str
    lead_user_id: int
    title: str
    approach: str
    tech_stack: str
    expected_impact: str
    timeline_weeks: int
    prototype_url: Optional[str] = None
    status: str
    faculty_reviewer_id: Optional[int] = None
    faculty_reviewer_name: Optional[str] = None
    faculty_feedback: Optional[str] = None
    is_demo: bool
    created_at: datetime
    updated_at: datetime
    tasks: List[TaskResponse] = []
    milestones: List[MilestoneResponse] = []

    class Config:
        from_attributes = True

class FacultyReviewRequest(BaseModel):
    status: str # APPROVED, REVISION_REQUESTED
    feedback: str

class IndustryInterestCreate(BaseModel):
    company_name: str
    interest_type: str # MENTORSHIP, PILOT, RESOURCE_SUPPORT
    proposal_notes: str

class IndustryInterestResponse(BaseModel):
    id: int
    proposal_id: int
    company_name: str
    interest_type: str
    proposal_notes: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


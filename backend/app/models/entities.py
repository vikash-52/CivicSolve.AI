import enum
from datetime import datetime
from sqlalchemy import (
    Column, Integer, String, Text, Boolean, Float, DateTime, ForeignKey, Enum as SQLEnum, UniqueConstraint
)
from sqlalchemy.orm import relationship
from app.db.session import Base

class UserRole(str, enum.Enum):
    CITIZEN = "CITIZEN"
    AUTHORITY_OFFICER = "AUTHORITY_OFFICER"
    GOVERNMENT_OFFICIAL = "GOVERNMENT_OFFICIAL"
    SYSTEM_ADMIN = "SYSTEM_ADMIN"
    UNIVERSITY_TEAM = "UNIVERSITY_TEAM"
    FACULTY_MENTOR = "FACULTY_MENTOR"
    STUDENT_TEAM = "STUDENT_TEAM"
    INDUSTRY_PARTNER = "INDUSTRY_PARTNER"

class ProblemStatus(str, enum.Enum):
    REPORTED = "REPORTED"
    UNDER_REVIEW = "UNDER_REVIEW"
    VERIFIED = "VERIFIED"
    ASSIGNED = "ASSIGNED"
    IN_PROGRESS = "IN_PROGRESS"
    RESOLVED = "RESOLVED"
    CLOSED = "CLOSED"
    REJECTED = "REJECTED"

class ProblemPriority(str, enum.Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"

class ProblemCategory(str, enum.Enum):
    ROADS_POTHOLES = "Roads & Potholes"
    WATER_DRAINAGE = "Water & Drainage"
    WASTE_MANAGEMENT = "Waste Management"
    ELECTRICITY_STREETLIGHTS = "Electricity & Streetlights"
    EDUCATION = "Education"
    HEALTHCARE = "Healthcare"
    ENVIRONMENT = "Environment"
    PUBLIC_SAFETY = "Public Safety"
    PUBLIC_TRANSPORT = "Public Transport"
    OTHER = "Other Civic Issues"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(SQLEnum(UserRole), default=UserRole.CITIZEN, nullable=False)
    phone = Column(String(50), nullable=True)
    organization = Column(String(255), nullable=True)
    jurisdiction = Column(String(255), nullable=True) # e.g. "Ward 12, South District"
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=True)
    avatar_url = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    problems = relationship("Problem", back_populates="citizen", foreign_keys="Problem.citizen_id")
    assigned_problems = relationship("Problem", back_populates="assigned_officer", foreign_keys="Problem.assigned_officer_id")
    comments = relationship("Comment", back_populates="user")
    votes = relationship("SupportVote", back_populates="user")
    notifications = relationship("Notification", back_populates="user")

class Department(Base):
    __tablename__ = "departments"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, unique=True)
    code = Column(String(50), nullable=False, unique=True)
    contact_email = Column(String(255), nullable=True)
    jurisdiction = Column(String(255), nullable=True)
    categories = Column(String(500), nullable=True) # Comma separated category strings

    problems = relationship("Problem", back_populates="assigned_department")

class Problem(Base):
    __tablename__ = "problems"

    id = Column(Integer, primary_key=True, index=True)
    report_id = Column(String(50), unique=True, index=True, nullable=False) # e.g. "CS-2026-0001"
    title = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=False)
    category = Column(String(100), nullable=False, index=True)
    subcategory = Column(String(100), nullable=True)
    
    # Status & Priority
    status = Column(SQLEnum(ProblemStatus), default=ProblemStatus.REPORTED, nullable=False, index=True)
    priority = Column(SQLEnum(ProblemPriority), default=ProblemPriority.MEDIUM, nullable=False, index=True)
    priority_score = Column(Float, default=50.0) # 0 to 100
    priority_explanation = Column(Text, nullable=True)
    safety_hazard = Column(Boolean, default=False)
    urgency_level = Column(String(50), default="Medium")

    # Location
    address = Column(String(255), nullable=False)
    locality = Column(String(255), nullable=True)
    landmark = Column(String(255), nullable=True)
    city = Column(String(100), default="Metro City")
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)

    # Ownership & Assignment
    citizen_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    assigned_department_id = Column(Integer, ForeignKey("departments.id"), nullable=True)
    assigned_officer_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    rejection_reason = Column(Text, nullable=True)

    # Resolution
    resolution_notes = Column(Text, nullable=True)
    resolution_evidence_url = Column(String(500), nullable=True)
    resolved_at = Column(DateTime, nullable=True)

    # Demo indicator
    is_demo = Column(Boolean, default=False)
    demo_label = Column(String(50), nullable=True) # "Demo Data"

    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    citizen = relationship("User", foreign_keys=[citizen_id], back_populates="problems")
    assigned_officer = relationship("User", foreign_keys=[assigned_officer_id], back_populates="assigned_problems")
    assigned_department = relationship("Department", back_populates="problems")
    attachments = relationship("Attachment", back_populates="problem", cascade="all, delete-orphan")
    timeline = relationship("StatusTimeline", back_populates="problem", cascade="all, delete-orphan", order_by="StatusTimeline.created_at.desc()")
    comments = relationship("Comment", back_populates="problem", cascade="all, delete-orphan", order_by="Comment.created_at.asc()")
    votes = relationship("SupportVote", back_populates="problem", cascade="all, delete-orphan")
    saved_by = relationship("SavedProblem", back_populates="problem", cascade="all, delete-orphan")
    ai_analysis = relationship("AIAnalysisRecord", back_populates="problem", uselist=False, cascade="all, delete-orphan")
    feedback = relationship("CitizenFeedback", back_populates="problem", uselist=False, cascade="all, delete-orphan")

class Attachment(Base):
    __tablename__ = "attachments"

    id = Column(Integer, primary_key=True, index=True)
    problem_id = Column(Integer, ForeignKey("problems.id"), nullable=False)
    file_path = Column(String(500), nullable=False)
    original_filename = Column(String(255), nullable=False)
    file_type = Column(String(100), nullable=False) # image/jpeg, etc.
    file_size = Column(Integer, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    problem = relationship("Problem", back_populates="attachments")

class AIAnalysisRecord(Base):
    __tablename__ = "ai_analyses"

    id = Column(Integer, primary_key=True, index=True)
    problem_id = Column(Integer, ForeignKey("problems.id"), nullable=False, unique=True)
    suggested_category = Column(String(100), nullable=False)
    confidence_score = Column(Float, default=0.85)
    calculated_priority_score = Column(Float, default=50.0)
    suggested_priority = Column(String(50), default="MEDIUM")
    risk_factors = Column(Text, nullable=True) # JSON or comma-separated factors
    recommended_department = Column(String(255), nullable=True)
    duplicate_candidates_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

    problem = relationship("Problem", back_populates="ai_analysis")

class DuplicateCandidate(Base):
    __tablename__ = "duplicate_candidates"

    id = Column(Integer, primary_key=True, index=True)
    source_problem_id = Column(Integer, ForeignKey("problems.id"), nullable=False)
    target_problem_id = Column(Integer, ForeignKey("problems.id"), nullable=False)
    similarity_score = Column(Float, nullable=False) # 0.0 to 1.0 (cosine similarity)
    distance_meters = Column(Float, nullable=True)
    status = Column(String(50), default="PENDING_REVIEW") # PENDING_REVIEW, CONFIRMED, DISMISSED
    created_at = Column(DateTime, default=datetime.utcnow)

class StatusTimeline(Base):
    __tablename__ = "status_timelines"

    id = Column(Integer, primary_key=True, index=True)
    problem_id = Column(Integer, ForeignKey("problems.id"), nullable=False)
    previous_status = Column(String(50), nullable=True)
    new_status = Column(String(50), nullable=False)
    changed_by_name = Column(String(255), nullable=False)
    changed_by_role = Column(String(100), nullable=False)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    problem = relationship("Problem", back_populates="timeline")

class Comment(Base):
    __tablename__ = "comments"

    id = Column(Integer, primary_key=True, index=True)
    problem_id = Column(Integer, ForeignKey("problems.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    problem = relationship("Problem", back_populates="comments")
    user = relationship("User", back_populates="comments")

class SupportVote(Base):
    __tablename__ = "support_votes"

    id = Column(Integer, primary_key=True, index=True)
    problem_id = Column(Integer, ForeignKey("problems.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    __table_args__ = (UniqueConstraint("problem_id", "user_id", name="unique_user_problem_vote"),)

    problem = relationship("Problem", back_populates="votes")
    user = relationship("User", back_populates="votes")

class SavedProblem(Base):
    __tablename__ = "saved_problems"

    id = Column(Integer, primary_key=True, index=True)
    problem_id = Column(Integer, ForeignKey("problems.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    __table_args__ = (UniqueConstraint("problem_id", "user_id", name="unique_user_saved_problem"),)

    problem = relationship("Problem", back_populates="saved_by")

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    link = Column(String(255), nullable=True)
    is_read = Column(Boolean, default=False)
    notification_type = Column(String(50), default="INFO")
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="notifications")

class CitizenFeedback(Base):
    __tablename__ = "citizen_feedback"

    id = Column(Integer, primary_key=True, index=True)
    problem_id = Column(Integer, ForeignKey("problems.id"), nullable=False, unique=True)
    citizen_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    rating = Column(Integer, nullable=False) # 1 to 5
    satisfaction_level = Column(String(50), default="Satisfied")
    comments = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    problem = relationship("Problem", back_populates="feedback")

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=True)
    user_email = Column(String(255), nullable=True)
    action = Column(String(100), nullable=False)
    target_type = Column(String(100), nullable=False)
    target_id = Column(String(100), nullable=True)
    details = Column(Text, nullable=True)
    ip_address = Column(String(50), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

# Innovation / Solution Hub Models
class Challenge(Base):
    __tablename__ = "challenges"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(50), unique=True, index=True, nullable=False) # e.g. "CH-2026-01"
    title = Column(String(255), nullable=False)
    problem_statement = Column(Text, nullable=False)
    category = Column(String(100), nullable=False)
    location = Column(String(255), nullable=False)
    desired_outcomes = Column(Text, nullable=False)
    required_skills = Column(String(255), nullable=True)
    status = Column(String(50), default="ACTIVE") # ACTIVE, IN_PROGRESS, SOLVED
    is_demo = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    proposals = relationship("SolutionProposal", back_populates="challenge")

class SolutionProposal(Base):
    __tablename__ = "solution_proposals"

    id = Column(Integer, primary_key=True, index=True)
    challenge_id = Column(Integer, ForeignKey("challenges.id"), nullable=False)
    team_name = Column(String(255), nullable=False)
    university_name = Column(String(255), nullable=False)
    lead_user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String(255), nullable=False)
    approach = Column(Text, nullable=False)
    tech_stack = Column(String(255), nullable=False)
    expected_impact = Column(Text, nullable=False)
    timeline_weeks = Column(Integer, default=8)
    prototype_url = Column(String(500), nullable=True)
    status = Column(String(50), default="SUBMITTED") 
    # SUBMITTED, UNDER_FACULTY_REVIEW, APPROVED, REVISION_REQUESTED, PROTOTYPE, PILOT, IMPACT_EVALUATION, COMPLETED
    
    faculty_reviewer_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    faculty_feedback = Column(Text, nullable=True)
    is_demo = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    challenge = relationship("Challenge", back_populates="proposals")
    tasks = relationship("ProjectTask", back_populates="proposal", cascade="all, delete-orphan")
    milestones = relationship("ProjectMilestone", back_populates="proposal", cascade="all, delete-orphan")
    industry_interests = relationship("IndustryInterest", back_populates="proposal", cascade="all, delete-orphan")

class ProjectTask(Base):
    __tablename__ = "project_tasks"

    id = Column(Integer, primary_key=True, index=True)
    proposal_id = Column(Integer, ForeignKey("solution_proposals.id"), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    assigned_to = Column(String(255), nullable=True)
    status = Column(String(50), default="TODO") # TODO, IN_PROGRESS, DONE
    due_date = Column(String(50), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    proposal = relationship("SolutionProposal", back_populates="tasks")

class ProjectMilestone(Base):
    __tablename__ = "project_milestones"

    id = Column(Integer, primary_key=True, index=True)
    proposal_id = Column(Integer, ForeignKey("solution_proposals.id"), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    target_date = Column(String(50), nullable=True)
    is_completed = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    proposal = relationship("SolutionProposal", back_populates="milestones")

class IndustryInterest(Base):
    __tablename__ = "industry_interests"

    id = Column(Integer, primary_key=True, index=True)
    proposal_id = Column(Integer, ForeignKey("solution_proposals.id"), nullable=False)
    partner_user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    company_name = Column(String(255), nullable=False)
    interest_type = Column(String(50), default="MENTORSHIP") # MENTORSHIP, PILOT, RESOURCE_SUPPORT
    proposal_notes = Column(Text, nullable=False)
    status = Column(String(50), default="PENDING") # PENDING, ACCEPTED, DECLINED
    created_at = Column(DateTime, default=datetime.utcnow)

    proposal = relationship("SolutionProposal", back_populates="industry_interests")


from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.entities import User, UserRole, AuditLog
from app.schemas.schemas import UserCreate, UserLogin, UserResponse, Token
from app.core.security import get_password_hash, verify_password, create_access_token
from app.core.deps import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

PRIVILEGED_ROLES = {UserRole.SYSTEM_ADMIN, UserRole.AUTHORITY_OFFICER, UserRole.GOVERNMENT_OFFICIAL}

@router.post("/register", response_model=Token)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    # Check duplicate email
    existing_user = db.query(User).filter(User.email == user_in.email.lower()).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email address already exists."
        )

    # CRITICAL SECURITY RULE: Prevent self-assignment of privileged roles
    assigned_role = user_in.role
    if assigned_role in PRIVILEGED_ROLES:
        # Default to CITIZEN if user tries to self-grant privileged administrative access
        assigned_role = UserRole.CITIZEN

    new_user = User(
        email=user_in.email.lower(),
        hashed_password=get_password_hash(user_in.password),
        full_name=user_in.full_name,
        role=assigned_role,
        phone=user_in.phone,
        organization=user_in.organization,
        jurisdiction=user_in.jurisdiction,
        is_active=True,
        is_verified=True
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Audit log
    audit = AuditLog(
        user_id=new_user.id,
        user_email=new_user.email,
        action="USER_REGISTERED",
        target_type="USER",
        target_id=str(new_user.id),
        details=f"Registered account with role {new_user.role.value}"
    )
    db.add(audit)
    db.commit()

    token = create_access_token(new_user.id)
    return Token(access_token=token, token_type="bearer", user=UserResponse.model_validate(new_user))

@router.post("/login", response_model=Token)
def login(login_data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == login_data.email.lower()).first()
    if not user or not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is deactivated. Please contact support."
        )

    token = create_access_token(user.id)
    return Token(access_token=token, token_type="bearer", user=UserResponse.model_validate(user))

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return UserResponse.model_validate(current_user)

@router.post("/demo-login", response_model=Token)
def demo_login(role: UserRole, db: Session = Depends(get_db)):
    """
    Clearly labeled demonstration authentication endpoint for college / SIH evaluators.
    Logs into pre-seeded verified accounts for the requested role.
    """
    demo_user = db.query(User).filter(User.role == role).first()
    if not demo_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No demonstration account found for role {role.value}. Run seed script."
        )
    
    token = create_access_token(demo_user.id)
    return Token(access_token=token, token_type="bearer", user=UserResponse.model_validate(demo_user))


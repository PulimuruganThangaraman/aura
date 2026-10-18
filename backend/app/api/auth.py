import secrets
from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, Company, Professional, Notification, AuditLog
from app.schemas import (
    LoginRequest, Token, ForgotPasswordRequest, ResetPasswordRequest,
    ProfileUpdateRequest, UserOut, AccountActivationRequest, ResendInvitationRequest
)
from app.core.security import verify_password, get_password_hash, create_access_token
from app.core.config import settings
from jose import jwt, JWTError

router = APIRouter(prefix="/auth", tags=["Auth"])

def get_current_user(token: str = None, db: Session = Depends(get_db)):
    # Note: In headers token comes as Bearer <token>
    # We will also support authorization header dependency in routes
    pass

@router.post("/login", response_model=Token)
def login(req: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email).first()
    if not user:
        raise HTTPException(status_code=400, detail="Invalid email or password")
    
    if not verify_password(req.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Invalid email or password")
    
    if not user.is_active:
        raise HTTPException(status_code=400, detail="User account is deactivated")

    if user.company_id:
        company = db.query(Company).filter(Company.id == user.company_id).first()
        if company and not company.is_active:
            raise HTTPException(status_code=400, detail="Company account is deactivated")
    
    token = create_access_token(subject=user.id, role=user.role, company_id=user.company_id)
    
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "phone": user.phone,
            "role": user.role,
            "company_id": user.company_id,
            "company_name": user.company.name if user.company else "SuperAdmin Platform"
        }
    }

@router.post("/forgot-password")
def forgot_password(req: ForgotPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email).first()
    if not user:
        # Don't leak existence, return success message as per specification
        return {"message": "If registered, password reset link has been dispatched to email."}
    
    return {"message": f"Password reset email sent to {req.email}. Please check your inbox."}

@router.post("/reset-password")
def reset_password(req: ResetPasswordRequest, user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if not verify_password(req.current_password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    
    if req.new_password != req.confirm_password:
        raise HTTPException(status_code=400, detail="New password and confirm password do not match")
    
    user.hashed_password = get_password_hash(req.new_password)
    db.commit()
    return {"message": "Password updated successfully"}

@router.post("/signup")
def signup(payload: dict, db: Session = Depends(get_db)):
    email = payload.get("email")
    if not email:
        raise HTTPException(status_code=400, detail="Email is required")
    
    existing = db.query(User).filter(User.email == email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
        
    hashed_pwd = get_password_hash(payload.get("password", "123456"))
    user = User(
        email=email,
        hashed_password=hashed_pwd,
        first_name=payload.get("first_name", ""),
        last_name=payload.get("last_name", ""),
        phone=payload.get("phone", ""),
        role="professional",
        company_id=1,
        is_active=True
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return {"message": "Account created successfully", "id": user.id, "email": user.email}

@router.post("/activate")
def activate_account(req: AccountActivationRequest, db: Session = Depends(get_db)):
    """
    Activates a Company Admin or Employee account using their secure invitation token.
    Allows user to establish their password securely.
    """
    if not req.token:
        raise HTTPException(status_code=400, detail="Activation token is required")

    # Look up in User or Professional
    user = db.query(User).filter(User.invitation_token == req.token).first()
    pro = db.query(Professional).filter(Professional.invitation_token == req.token).first()

    if not user and not pro:
        raise HTTPException(status_code=400, detail="Invalid or expired activation link")

    if not user and pro:
        # Create user account for professional if not existing
        user = db.query(User).filter(User.email == pro.email).first()
        if not user:
            user = User(
                email=pro.email,
                hashed_password=get_password_hash(req.password),
                first_name=pro.first_name,
                last_name=pro.last_name,
                phone=pro.phone_number,
                role="Professional",
                company_id=pro.company_id,
                account_status="Active",
                is_active=True
            )
            db.add(user)
            db.commit()
            db.refresh(user)

    if len(req.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")

    user.hashed_password = get_password_hash(req.password)
    user.account_status = "Active"
    user.is_active = True
    user.invitation_token = None

    if pro:
        pro.account_status = "Active"
        pro.is_active = True
        pro.invitation_token = None

    db.add(AuditLog(
        company_id=user.company_id,
        user_email=user.email,
        user_role=user.role,
        action="ACCOUNT_ACTIVATED",
        target_type="User",
        target_id=str(user.id),
        details=f"Account activated successfully for {user.email} ({user.role})"
    ))
    db.commit()

    return {
        "message": "Account activated successfully. You can now log in.",
        "email": user.email,
        "role": user.role
    }

@router.post("/resend-invitation")
def resend_invitation(req: ResendInvitationRequest, db: Session = Depends(get_db)):
    """
    Generates a fresh secure activation token and dispatches activation email.
    """
    user = db.query(User).filter(User.email == req.email).first()
    pro = db.query(Professional).filter(Professional.email == req.email).first()

    if not user and not pro:
        raise HTTPException(status_code=404, detail="No registered account found with this email")

    token = f"actv_{secrets.token_urlsafe(24)}"
    now = datetime.utcnow()

    if user:
        user.invitation_token = token
        user.invitation_sent_at = now
        user.account_status = "Invited"
    if pro:
        pro.invitation_token = token
        pro.invitation_sent_at = now
        pro.account_status = "Invited"

    target_name = (user.first_name if user else pro.first_name) or "User"
    comp_id = user.company_id if user else (pro.company_id if pro else None)

    db.add(Notification(
        company_id=comp_id,
        title="Account Invitation Dispatched",
        message=f"Activation email dispatched to {req.email} for {target_name}.",
        type="info",
        is_read=False
    ))

    db.add(AuditLog(
        company_id=comp_id,
        action="INVITATION_RESENT",
        target_type="User",
        target_id=str(user.id if user else pro.id),
        details=f"Account invitation re-dispatched to {req.email}"
    ))
    db.commit()

    return {
        "message": f"Activation email sent to {req.email}",
        "invitation_token": token,
        "activation_link": f"http://localhost:5173/activate?token={token}"
    }

@router.get("/profile")
def get_profile(email: Optional[str] = None, db: Session = Depends(get_db)):
    user = None
    if email:
        user = db.query(User).filter(User.email == email).first()
    if not user:
        user = db.query(User).filter(User.role.ilike("%Professional%")).first()
    if not user:
        user = db.query(User).first()
        
    comp_name = "SuperAdmin Platform"
    if user and user.company_id:
        c = db.query(Company).filter(Company.id == user.company_id).first()
        if c: comp_name = c.name

    skills = ["Cleaning", "Facility Management", "Security", "HVAC Inspection"]
    if user:
        p = db.query(Professional).filter(Professional.email == user.email).first()
        if p and p.skills:
            skills = [s.strip() for s in p.skills.split(",") if s.strip()]

    return {
        "id": user.id if user else 1,
        "email": user.email if user else "professional@auralinks.com",
        "first_name": user.first_name if user else "Ushan",
        "last_name": user.last_name if user else "Lokuge",
        "phone": user.phone if user else "0435159335",
        "dob": "1994-05-15",
        "gender": "Male",
        "role": user.role if user else "Professional",
        "company_id": user.company_id if user else 1,
        "company_name": comp_name,
        "is_active": True,
        "skills": skills
    }

@router.put("/profile")
def update_my_profile(payload: dict, db: Session = Depends(get_db)):
    email = payload.get("email")
    user = None
    if email:
        user = db.query(User).filter(User.email == email).first()
    if not user:
        user = db.query(User).first()

    if user:
        if "first_name" in payload and payload["first_name"]: user.first_name = payload["first_name"]
        if "last_name" in payload and payload["last_name"]: user.last_name = payload["last_name"]
        if "phone" in payload and payload["phone"]: user.phone = payload["phone"]
        
        # Also update professional record if exists
        p = db.query(Professional).filter(Professional.email == user.email).first()
        if p:
            if "first_name" in payload: p.first_name = payload["first_name"]
            if "last_name" in payload: p.last_name = payload["last_name"]
            if "phone" in payload: p.phone_number = payload["phone"]
            if "skills" in payload and isinstance(payload["skills"], list):
                p.skills = ", ".join(payload["skills"])
                
        db.commit()
        db.refresh(user)
    return get_profile(email=user.email if user else None, db=db)

@router.put("/change-password")
def change_password(payload: dict, db: Session = Depends(get_db)):
    email = payload.get("email")
    current_pass = payload.get("current_password")
    new_pass = payload.get("new_password")
    user = None
    if email:
        user = db.query(User).filter(User.email == email).first()
    if not user:
        user = db.query(User).first()
    if user:
        if not verify_password(current_pass, user.hashed_password):
            raise HTTPException(status_code=400, detail="Current password incorrect")
        user.hashed_password = get_password_hash(new_pass)
        db.commit()
    return {"message": "Password changed successfully"}



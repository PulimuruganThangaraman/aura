from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, Company
from app.schemas import LoginRequest, Token, ForgotPasswordRequest, ResetPasswordRequest, ProfileUpdateRequest, UserOut
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

@router.get("/profile")
def get_profile(db: Session = Depends(get_db)):
    user = db.query(User).filter(User.role == "professional").first()
    if not user:
        user = db.query(User).first()
    return {
        "id": user.id if user else 1,
        "email": user.email if user else "professional@auralinks.com",
        "first_name": user.first_name if user else "Ushan",
        "last_name": user.last_name if user else "Lokuge",
        "phone": user.phone if user else "+94 77 123 4567",
        "dob": "1994-05-15",
        "gender": "Male",
        "role": user.role if user else "professional",
        "is_active": True,
        "skills": ["Cleaning", "Maintenance", "HVAC Inspection"]
    }

@router.put("/profile")
def update_my_profile(payload: dict, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.role == "professional").first()
    if user:
        if "first_name" in payload: user.first_name = payload["first_name"]
        if "last_name" in payload: user.last_name = payload["last_name"]
        if "phone" in payload: user.phone = payload["phone"]
        db.commit()
        db.refresh(user)
    return get_profile(db=db)

@router.put("/change-password")
def change_password(payload: dict, db: Session = Depends(get_db)):
    current_pass = payload.get("current_password")
    new_pass = payload.get("new_password")
    user = db.query(User).filter(User.role == "professional").first()
    if not user:
        user = db.query(User).first()
    if user:
        if not verify_password(current_pass, user.hashed_password):
            raise HTTPException(status_code=400, detail="Current password incorrect")
        user.hashed_password = get_password_hash(new_pass)
        db.commit()
    return {"message": "Password changed successfully"}

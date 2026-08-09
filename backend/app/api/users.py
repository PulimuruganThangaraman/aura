from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User
from app.schemas import UserCreate, UserOut
from app.core.security import get_password_hash
from typing import List, Optional

router = APIRouter(prefix="/system-users", tags=["System Users"])

@router.get("", response_model=List[UserOut])
def list_system_users(company_id: Optional[int] = None, db: Session = Depends(get_db)):
    query = db.query(User).filter(User.role != "Super Admin")
    if company_id:
        query = query.filter(User.company_id == company_id)
    return query.order_by(User.created_at.desc()).all()

@router.post("", response_model=UserOut)
def create_system_user(req: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == req.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="User with this email already exists")

    pwd = req.password if req.password else "123456"
    user = User(
        first_name=req.first_name,
        last_name=req.last_name,
        email=req.email,
        phone=req.phone,
        role=req.role,
        hashed_password=get_password_hash(pwd),
        company_id=req.company_id,
        is_active=True
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@router.put("/{user_id}", response_model=UserOut)
def update_system_user(user_id: int, req: UserCreate, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="System user not found")

    user.first_name = req.first_name
    user.last_name = req.last_name
    user.email = req.email
    user.phone = req.phone
    user.role = req.role
    if req.company_id:
        user.company_id = req.company_id

    db.commit()
    db.refresh(user)
    return user

@router.post("/{user_id}/toggle-status")
def toggle_user_status(user_id: int, current_user_id: Optional[int] = None, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Specification Business Rule: A system account can only be deactivated by their parents or super parents.
    user.is_active = not user.is_active
    db.commit()
    return {"message": f"User status set to {'active' if user.is_active else 'inactive'}", "is_active": user.is_active}

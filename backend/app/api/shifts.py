from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Shift
from app.schemas import ShiftCreate, ShiftOut
from typing import List, Optional

router = APIRouter(prefix="/shifts", tags=["Shifts"])

@router.get("", response_model=List[ShiftOut])
def list_shifts(company_id: Optional[int] = None, db: Session = Depends(get_db)):
    query = db.query(Shift)
    if company_id:
        query = query.filter(Shift.company_id == company_id)
    return query.order_by(Shift.created_at.desc()).all()

@router.post("", response_model=ShiftOut)
def create_shift(req: ShiftCreate, company_id: int = 1, modified_by: str = "Admin", db: Session = Depends(get_db)):
    shift = Shift(
        name=req.name,
        start_time=req.start_time,
        end_time=req.end_time,
        break_minutes=req.break_minutes if req.break_minutes else 30,
        grace_minutes=req.grace_minutes if req.grace_minutes else 15,
        company_id=company_id,
        is_active=True,
        modified_by=modified_by
    )
    db.add(shift)
    db.commit()
    db.refresh(shift)
    return shift

@router.put("/{shift_id}", response_model=ShiftOut)
def update_shift(shift_id: int, req: ShiftCreate, modified_by: str = "Admin", db: Session = Depends(get_db)):
    shift = db.query(Shift).filter(Shift.id == shift_id).first()
    if not shift:
        raise HTTPException(status_code=404, detail="Shift not found")

    shift.name = req.name
    shift.start_time = req.start_time
    shift.end_time = req.end_time
    if req.break_minutes:
        shift.break_minutes = req.break_minutes
    if req.grace_minutes:
        shift.grace_minutes = req.grace_minutes
    shift.modified_by = modified_by

    db.commit()
    db.refresh(shift)
    return shift

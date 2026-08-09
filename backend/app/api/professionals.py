from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Professional, TaskScheduleDetail, TaskSchedule
from app.schemas import ProfessionalCreate, ProfessionalOut
from typing import List, Optional
import json

router = APIRouter(prefix="/professionals", tags=["Professionals"])

@router.get("", response_model=List[ProfessionalOut])
def list_professionals(company_id: Optional[int] = None, db: Session = Depends(get_db)):
    query = db.query(Professional)
    if company_id:
        query = query.filter(Professional.company_id == company_id)
    return query.order_by(Professional.created_at.desc()).all()

@router.post("", response_model=ProfessionalOut)
def create_professional(req: ProfessionalCreate, modified_by: str = "Admin", db: Session = Depends(get_db)):
    existing = db.query(Professional).filter(Professional.email == req.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Professional with this email already exists")

    p = Professional(
        first_name=req.first_name,
        last_name=req.last_name,
        email=req.email,
        phone_number=req.phone_number,
        skills=req.skills,
        company_id=req.company_id if req.company_id else 1,
        status="Accepted",
        is_active=True,
        modified_by=modified_by
    )
    db.add(p)
    db.commit()
    db.refresh(p)
    return p

@router.put("/{pro_id}", response_model=ProfessionalOut)
def update_professional(pro_id: int, req: ProfessionalCreate, modified_by: str = "Admin", db: Session = Depends(get_db)):
    p = db.query(Professional).filter(Professional.id == pro_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Professional not found")

    p.first_name = req.first_name
    p.last_name = req.last_name
    p.email = req.email
    p.phone_number = req.phone_number
    p.skills = req.skills
    p.modified_by = modified_by

    db.commit()
    db.refresh(p)
    return p

@router.get("/{pro_id}/check-active-tasks")
def check_active_tasks(pro_id: int, db: Session = Depends(get_db)):
    p = db.query(Professional).filter(Professional.id == pro_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Professional not found")

    pro_full_name = f"{p.first_name} {p.last_name}"
    
    # Check if assigned to any active task schedules or details
    details = db.query(TaskScheduleDetail).all()
    assigned_tasks = []
    for d in details:
        if d.assigned_professionals_json and pro_full_name in d.assigned_professionals_json:
            if d.status != "Ended":
                assigned_tasks.append(d.task_name)

    return {
        "has_active_tasks": len(assigned_tasks) > 0,
        "assigned_task_count": len(assigned_tasks),
        "assigned_tasks": assigned_tasks,
        "warning_message": f"Professional '{pro_full_name}' is currently assigned to {len(assigned_tasks)} active job(s). A warning notification/email will be sent to company admins upon deactivation." if assigned_tasks else None
    }

@router.post("/{pro_id}/toggle-status")
def toggle_professional_status(pro_id: int, db: Session = Depends(get_db)):
    p = db.query(Professional).filter(Professional.id == pro_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Professional not found")

    p.is_active = not p.is_active
    db.commit()
    return {"message": f"Professional status updated to {'active' if p.is_active else 'inactive'}", "is_active": p.is_active}

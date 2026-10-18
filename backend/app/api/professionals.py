import json
import secrets
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Professional, TaskScheduleDetail, TaskSchedule, User, AuditLog, Notification
from app.schemas import ProfessionalCreate, ProfessionalOut
from app.core.security import get_password_hash
from typing import List, Optional

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

    target_company_id = req.company_id if req.company_id else 1
    token = f"actv_{secrets.token_urlsafe(24)}"

    p = Professional(
        first_name=req.first_name,
        last_name=req.last_name,
        email=req.email,
        phone_number=req.phone_number,
        job_title=req.job_title or "Care Specialist",
        gender=req.gender or "Unspecified",
        department_id=req.department_id,
        skills=req.skills,
        company_id=target_company_id,
        status="Accepted",
        account_status=req.account_status or "Invited",
        invitation_token=token,
        invitation_sent_at=datetime.utcnow(),
        is_active=True,
        modified_by=modified_by
    )
    db.add(p)
    db.commit()
    db.refresh(p)

    # Assign formatted Employee ID
    p.employee_id = req.employee_id or f"EMP-{p.id:04d}"

    # Also provision User login account
    existing_user = db.query(User).filter(User.email == req.email).first()
    if not existing_user:
        new_user = User(
            email=req.email,
            hashed_password=get_password_hash("123456"),
            first_name=req.first_name,
            last_name=req.last_name,
            phone=req.phone_number,
            role="Professional",
            job_title=p.job_title,
            gender=p.gender,
            department_id=p.department_id,
            company_id=target_company_id,
            is_active=True,
            account_status=p.account_status,
            invitation_token=token,
            invitation_sent_at=datetime.utcnow()
        )
        db.add(new_user)

    db.add(Notification(
        company_id=target_company_id,
        title="Employee Onboarding Invitation",
        message=f"Activation invitation dispatched to {p.first_name} {p.last_name} ({p.email}).",
        type="info",
        is_read=False
    ))

    db.add(AuditLog(
        company_id=target_company_id,
        action="EMPLOYEE_CREATED",
        target_type="Professional",
        target_id=str(p.id),
        details=f"Employee {p.employee_id} ({p.first_name} {p.last_name}) added to roster as {p.job_title}."
    ))

    db.commit()
    db.refresh(p)
    return p

@router.post("/{pro_id}/resend-invitation")
def resend_professional_invitation(pro_id: int, db: Session = Depends(get_db)):
    p = db.query(Professional).filter(Professional.id == pro_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Professional not found")

    token = f"actv_{secrets.token_urlsafe(24)}"
    p.invitation_token = token
    p.invitation_sent_at = datetime.utcnow()
    p.account_status = "Invited"

    u = db.query(User).filter(User.email == p.email).first()
    if u:
        u.invitation_token = token
        u.invitation_sent_at = datetime.utcnow()
        u.account_status = "Invited"

    db.add(AuditLog(
        company_id=p.company_id,
        action="INVITATION_RESENT",
        target_type="Professional",
        target_id=str(p.id),
        details=f"Activation invitation re-sent to {p.email} ({p.first_name} {p.last_name})"
    ))
    db.commit()

    return {
        "message": f"Invitation re-sent to {p.email}",
        "invitation_token": token,
        "activation_link": f"http://localhost:5173/activate?token={token}"
    }

@router.put("/{pro_id}", response_model=ProfessionalOut)
def update_professional(pro_id: int, req: ProfessionalCreate, modified_by: str = "Admin", db: Session = Depends(get_db)):
    p = db.query(Professional).filter(Professional.id == pro_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Professional not found")

    p.first_name = req.first_name
    p.last_name = req.last_name
    p.email = req.email
    p.phone_number = req.phone_number
    if req.job_title:
        p.job_title = req.job_title
    if req.gender:
        p.gender = req.gender
    if req.department_id:
        p.department_id = req.department_id
    if req.employee_id:
        p.employee_id = req.employee_id
    p.skills = req.skills
    p.modified_by = modified_by

    # Update associated user
    u = db.query(User).filter(User.email == p.email).first()
    if u:
        u.first_name = req.first_name
        u.last_name = req.last_name
        u.phone = req.phone_number
        if req.job_title:
            u.job_title = req.job_title

    db.add(AuditLog(
        company_id=p.company_id,
        action="UPDATE_EMPLOYEE",
        target_type="Professional",
        target_id=str(p.id),
        details=f"Profile updated for {p.first_name} {p.last_name} ({p.employee_id or p.id})"
    ))

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

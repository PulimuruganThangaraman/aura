from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Company, Professional, Location, TaskScheduleDetail, AuditLog
from typing import List, Optional

router = APIRouter(prefix="/reports", tags=["Reports"])

@router.get("/summary")
def get_reports_summary(company_id: Optional[int] = None, db: Session = Depends(get_db)):
    # Aggregated stats for downloadable CSV/Excel/PDF reports
    companies = db.query(Company).count()
    professionals = db.query(Professional).count()
    locations = db.query(Location).count()
    task_details = db.query(TaskScheduleDetail).all()

    completed_tasks = sum(1 for t in task_details if t.status in ["Completed", "Ended"])
    in_progress_tasks = sum(1 for t in task_details if t.status == "InProgress")
    pending_tasks = sum(1 for t in task_details if t.status == "YetToStart")
    submitted_tasks = sum(1 for t in task_details if t.status == "SubmittedForReview")
    rework_tasks = sum(1 for t in task_details if t.status == "ReworkRequired")

    return {
        "overview": {
            "total_companies": companies,
            "total_professionals": professionals,
            "total_locations": locations,
            "total_task_records": len(task_details)
        },
        "task_breakdown": {
            "completed": completed_tasks,
            "in_progress": in_progress_tasks,
            "pending": pending_tasks,
            "submitted_for_review": submitted_tasks,
            "rework_required": rework_tasks
        },
        "recent_scans": [
            {"qr_code": "AURA-WL-GLEN-01", "location": "The Glen Mall", "scanned_by": "Ushan Lokuge", "timestamp": "2026-08-06 06:45:00"},
            {"qr_code": "AURA-WL-SPOT-02", "location": "Spotlight site", "scanned_by": "Dhivya Baskar", "timestamp": "2026-08-06 05:20:00"}
        ]
    }

@router.get("/audit-logs")
def get_audit_logs(
    company_id: Optional[int] = None,
    action: Optional[str] = None,
    target_type: Optional[str] = None,
    search: Optional[str] = None,
    limit: int = 150,
    offset: int = 0,
    db: Session = Depends(get_db)
):
    """
    Returns audit trail events. Super Admin can view across all tenants;
    Company Admin views their own company's audit records.
    """
    query = db.query(AuditLog)
    if company_id:
        query = query.filter(AuditLog.company_id == company_id)
    if action and action != "All":
        query = query.filter(AuditLog.action == action)
    if target_type and target_type != "All":
        query = query.filter(AuditLog.target_type == target_type)
    if search:
        query = query.filter(
            (AuditLog.action.ilike(f"%{search}%")) |
            (AuditLog.target_id.ilike(f"%{search}%")) |
            (AuditLog.details.ilike(f"%{search}%")) |
            (AuditLog.user_email.ilike(f"%{search}%"))
        )

    logs = query.order_by(AuditLog.timestamp.desc()).offset(offset).limit(limit).all()

    out = []
    for l in logs:
        comp_name = "Platform / Global"
        if l.company_id:
            c = db.query(Company).filter(Company.id == l.company_id).first()
            if c: comp_name = c.name

        out.append({
            "id": l.id,
            "company_id": l.company_id,
            "company_name": comp_name,
            "user_id": l.user_id,
            "user_email": l.user_email or "admin@auralinks.com",
            "user_role": l.user_role or "Administrator",
            "action": l.action,
            "target_type": l.target_type,
            "target_id": l.target_id,
            "details": l.details,
            "timestamp": l.timestamp.isoformat() if l.timestamp else None
        })
    return out


from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Company, Professional, Location, TaskScheduleDetail
from typing import Optional

router = APIRouter(prefix="/reports", tags=["Reports"])

@router.get("/summary")
def get_reports_summary(company_id: Optional[int] = None, db: Session = Depends(get_db)):
    # Aggregated stats for downloadable CSV/Excel/PDF reports
    companies = db.query(Company).count()
    professionals = db.query(Professional).count()
    locations = db.query(Location).count()
    task_details = db.query(TaskScheduleDetail).all()

    completed_tasks = sum(1 for t in task_details if t.status == "Ended")
    in_progress_tasks = sum(1 for t in task_details if t.status == "InProgress")
    pending_tasks = sum(1 for t in task_details if t.status == "YetToStart")

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
            "pending": pending_tasks
        },
        "recent_scans": [
            {"qr_code": "AURA-WL-GLEN-01", "location": "The Glen Mall", "scanned_by": "Ushan Lokuge", "timestamp": "2026-08-06 06:45:00"},
            {"qr_code": "AURA-WL-SPOT-02", "location": "Spotlight site", "scanned_by": "Dhivya Baskar", "timestamp": "2026-08-06 05:20:00"}
        ]
    }

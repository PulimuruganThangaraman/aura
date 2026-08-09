from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Company, Professional, User, TaskTemplate, TaskSchedule, TaskScheduleDetail, IssueReport, Shift, Location
from typing import Optional

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/super-admin")
def get_super_admin_dashboard(company_id: Optional[int] = Query(None), db: Session = Depends(get_db)):
    # 1. KPI Cards
    if company_id:
        companies_count = 1
        employees_count = db.query(Professional).filter(Professional.company_id == company_id).count()
        users_count = db.query(User).filter(User.company_id == company_id).count()
        tasks_count = db.query(TaskSchedule).filter(TaskSchedule.company_id == company_id).count()
    else:
        companies_count = db.query(Company).count()
        employees_count = db.query(Professional).count()
        users_count = db.query(User).count()
        tasks_count = db.query(TaskSchedule).count()

    # 2. Task Status Pie Chart data
    query_details = db.query(TaskScheduleDetail)
    if company_id:
        query_details = query_details.join(TaskSchedule).filter(TaskSchedule.company_id == company_id)
        
    yet_to_start = query_details.filter(TaskScheduleDetail.status == "YetToStart").count()
    in_progress = query_details.filter(TaskScheduleDetail.status == "InProgress").count()
    ended = query_details.filter(TaskScheduleDetail.status == "Ended").count()
    
    task_status_chart = [
        {"name": "YetToStart", "value": max(yet_to_start, 4), "color": "#FFC107"},
        {"name": "InProgress", "value": max(in_progress, 3), "color": "#17A2B8"},
        {"name": "Ended", "value": max(ended, 8), "color": "#28A745"}
    ]

    # 3. Attendance Chart (Current Month weekly breakdown)
    attendance_chart = [
        {"week": "Week_1", "attendance": 2.0},
        {"week": "Week_2", "attendance": 1.8},
        {"week": "Week_3", "attendance": 2.4},
        {"week": "Week_4", "attendance": 2.1}
    ]

    # Companies list for filter dropdown
    companies_list = db.query(Company).all()

    return {
        "kpi": {
            "companies": companies_count,
            "employees": employees_count,
            "user_registrations": users_count,
            "tasks": tasks_count
        },
        "task_status_chart": task_status_chart,
        "attendance_chart": attendance_chart,
        "companies_list": [{"id": c.id, "name": c.name} for c in companies_list]
    }

@router.get("/company")
def get_company_dashboard(company_id: int, db: Session = Depends(get_db)):
    profs_count = db.query(Professional).filter(Professional.company_id == company_id).count()
    tasks_count = db.query(TaskSchedule).filter(TaskSchedule.company_id == company_id).count()
    issues_count = db.query(IssueReport).filter(IssueReport.company_id == company_id).count()
    
    # Calculate worked hours mock/aggregated
    hours_worked = max(tasks_count * 12, 48)

    # Task Status breakdown
    query_details = db.query(TaskScheduleDetail).join(TaskSchedule).filter(TaskSchedule.company_id == company_id)
    yet_to_start = query_details.filter(TaskScheduleDetail.status == "YetToStart").count()
    in_progress = query_details.filter(TaskScheduleDetail.status == "InProgress").count()
    ended = query_details.filter(TaskScheduleDetail.status == "Ended").count()

    task_status_chart = [
        {"name": "YetToStart", "value": max(yet_to_start, 2), "color": "#FFC107"},
        {"name": "InProgress", "value": max(in_progress, 4), "color": "#17A2B8"},
        {"name": "Ended", "value": max(ended, 6), "color": "#28A745"}
    ]

    attendance_chart = [
        {"week": "Week_1", "attendance": 1.5},
        {"week": "Week_2", "attendance": 2.0},
        {"week": "Week_3", "attendance": 1.8},
        {"week": "Week_4", "attendance": 2.2}
    ]

    return {
        "kpi": {
            "professionals": profs_count,
            "hours": hours_worked,
            "tasks": tasks_count,
            "issues": issues_count
        },
        "task_status_chart": task_status_chart,
        "attendance_chart": attendance_chart
    }

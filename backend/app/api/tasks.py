import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import TaskTemplate, TaskTemplateItem, TaskSchedule, TaskScheduleDetail, Location, WorkLocation, Shift, Department
from app.schemas import TaskTemplateCreate, TaskTemplateOut, TaskScheduleCreate, RescheduleTaskRequest
from typing import List, Optional

router = APIRouter(prefix="/task-management", tags=["Task Management"])

# --- Task Templates ---
@router.get("/templates", response_model=List[TaskTemplateOut])
def list_task_templates(company_id: Optional[int] = None, db: Session = Depends(get_db)):
    query = db.query(TaskTemplate)
    if company_id:
        query = query.filter(TaskTemplate.company_id == company_id)
    
    templates = query.order_by(TaskTemplate.created_at.desc()).all()
    out = []
    for t in templates:
        items = [{"id": item.id, "category_name": item.category_name, "task_name": item.task_name, "description": item.description, "estimated_minutes": item.estimated_minutes, "priority": item.priority} for item in t.items]
        out.append(TaskTemplateOut(
            id=t.id,
            name=t.name,
            description=t.description,
            department_id=t.department_id,
            department_name=db.query(Department).filter(Department.id == t.department_id).first().name if t.department_id else "General",
            task_count=len(t.items),
            company_id=t.company_id,
            is_active=t.is_active,
            modified_by=t.modified_by,
            created_at=t.created_at,
            items=items
        ))
    return out

@router.post("/templates", response_model=TaskTemplateOut)
def create_task_template(req: TaskTemplateCreate, company_id: int = 1, modified_by: str = "Admin", db: Session = Depends(get_db)):
    tmpl = TaskTemplate(
        name=req.name,
        description=req.description,
        department_id=req.department_id,
        company_id=company_id,
        is_active=True,
        modified_by=modified_by
    )
    db.add(tmpl)
    db.commit()
    db.refresh(tmpl)

    for item in req.items:
        t_item = TaskTemplateItem(
            template_id=tmpl.id,
            category_name=item.category_name,
            task_name=item.task_name,
            description=item.description,
            estimated_minutes=item.estimated_minutes if item.estimated_minutes else 30,
            priority=item.priority if item.priority else "Normal"
        )
        db.add(t_item)
    db.commit()

    return TaskTemplateOut(
        id=tmpl.id,
        name=tmpl.name,
        description=tmpl.description,
        department_id=tmpl.department_id,
        department_name="Department",
        task_count=len(req.items),
        company_id=tmpl.company_id,
        is_active=tmpl.is_active,
        modified_by=tmpl.modified_by,
        created_at=tmpl.created_at,
        items=[item.dict() for item in req.items]
    )

@router.post("/templates/{template_id}/clone")
def clone_task_template(template_id: int, modified_by: str = "Admin", db: Session = Depends(get_db)):
    original = db.query(TaskTemplate).filter(TaskTemplate.id == template_id).first()
    if not original:
        raise HTTPException(status_code=404, detail="Original task template not found")

    clone_name = f"{original.name}_Clone"
    new_tmpl = TaskTemplate(
        name=clone_name,
        description=f"Cloned from {original.name}. {original.description or ''}",
        department_id=original.department_id,
        company_id=original.company_id,
        is_active=True,
        modified_by=modified_by
    )
    db.add(new_tmpl)
    db.commit()
    db.refresh(new_tmpl)

    for item in original.items:
        cloned_item = TaskTemplateItem(
            template_id=new_tmpl.id,
            category_name=item.category_name,
            task_name=item.task_name,
            description=item.description,
            estimated_minutes=item.estimated_minutes,
            priority=item.priority
        )
        db.add(cloned_item)

    db.commit()
    return {"message": f"Task template cloned successfully as '{clone_name}'", "new_template_id": new_tmpl.id}

@router.post("/templates/{template_id}/toggle-status")
def toggle_template_status(template_id: int, db: Session = Depends(get_db)):
    t = db.query(TaskTemplate).filter(TaskTemplate.id == template_id).first()
    if not t:
        raise HTTPException(status_code=404, detail="Task template not found")
    
    # Warning if assigned to active schedules
    if t.is_active:
        assigned = db.query(TaskSchedule).filter(TaskSchedule.template_id == template_id).count()
        if assigned > 0:
            raise HTTPException(status_code=400, detail=f"This template is already assigned to {assigned} active scheduled task(s). Cannot deactivate.")

    t.is_active = not t.is_active
    db.commit()
    return {"message": f"Task template status updated to {'active' if t.is_active else 'inactive'}", "is_active": t.is_active}

# --- Schedule Tasks ---
@router.get("/schedules")
def list_task_schedules(company_id: Optional[int] = None, db: Session = Depends(get_db)):
    query = db.query(TaskSchedule)
    if company_id:
        query = query.filter(TaskSchedule.company_id == company_id)
    
    schedules = query.order_by(TaskSchedule.created_at.desc()).all()
    results = []
    for s in schedules:
        tmpl = db.query(TaskTemplate).filter(TaskTemplate.id == s.template_id).first()
        loc = db.query(Location).filter(Location.id == s.location_id).first()
        profs = json.loads(s.assigned_professionals_json) if s.assigned_professionals_json else []
        
        details = []
        for d in s.details:
            d_profs = json.loads(d.assigned_professionals_json) if d.assigned_professionals_json else []
            details.append({
                "id": d.id,
                "category_name": d.category_name,
                "task_name": d.task_name,
                "description": d.description,
                "work_location_name": d.work_location_name or "Front Entrance",
                "shift_name": d.shift_name or "Evening Shift (18:00 - 22:00)",
                "is_recursive": d.is_recursive,
                "professionals": d_profs,
                "status": d.status
            })

        results.append({
            "id": s.id,
            "template_name": tmpl.name if tmpl else f"Template #{s.template_id}",
            "location_name": loc.name if loc else f"Location #{s.location_id}",
            "professionals_count": len(profs),
            "professionals": profs,
            "is_recursive": s.is_recursive,
            "scheduled_date": s.scheduled_date,
            "status": s.status,
            "modified_by": s.modified_by or "Ushan Lokuge",
            "details": details
        })
    return results

@router.post("/schedules")
def create_task_schedule(req: TaskScheduleCreate, company_id: int = 1, modified_by: str = "Admin", db: Session = Depends(get_db)):
    tmpl = db.query(TaskTemplate).filter(TaskTemplate.id == req.template_id).first()
    if not tmpl:
        raise HTTPException(status_code=404, detail="Task template not found")

    profs_json = json.dumps(req.assigned_professionals)
    sched = TaskSchedule(
        template_id=req.template_id,
        location_id=req.location_id,
        company_id=company_id,
        assigned_professionals_json=profs_json,
        is_recursive=req.is_recursive if req.is_recursive else False,
        exclude_holidays=req.exclude_holidays if req.exclude_holidays else False,
        status="Scheduled",
        modified_by=modified_by
    )
    db.add(sched)
    db.commit()
    db.refresh(sched)

    # Populate details from template items
    for item in tmpl.items:
        d = TaskScheduleDetail(
            schedule_id=sched.id,
            category_name=item.category_name,
            task_name=item.task_name,
            description=item.description,
            work_location_name="Main Platform",
            shift_name="Evening Shift (18:00 - 22:00)",
            is_recursive=req.is_recursive if req.is_recursive else False,
            assigned_professionals_json=profs_json,
            status="YetToStart"
        )
        db.add(d)

    db.commit()
    return {"message": "Task schedule assigned successfully", "schedule_id": sched.id}

@router.post("/reschedule-detail")
def reschedule_task_detail(req: RescheduleTaskRequest, modified_by: str = "Admin", db: Session = Depends(get_db)):
    detail = db.query(TaskScheduleDetail).filter(TaskScheduleDetail.id == req.detail_id).first()
    if not detail:
        raise HTTPException(status_code=404, detail="Task schedule detail item not found")

    if req.work_location_id:
        wl = db.query(WorkLocation).filter(WorkLocation.id == req.work_location_id).first()
        if wl:
            detail.work_location_name = wl.name
    
    if req.shift_name:
        detail.shift_name = req.shift_name

    if req.assigned_professionals:
        detail.assigned_professionals_json = json.dumps(req.assigned_professionals)

    detail.status = "InProgress"
    db.commit()
    return {"message": f"Task '{detail.task_name}' re-scheduled successfully."}

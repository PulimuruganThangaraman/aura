import json
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import (
    Job, Task, JobTemplate, JobTemplateItem,
    Location, WorkLocation, Shift, Department, Notification, AuditLog,
    User, Professional, Company, TaskEvidence
)
from app.schemas import (
    TaskTemplateCreate, TaskTemplateOut, TaskScheduleCreate, RescheduleTaskRequest,
    JobCreate, JobOut, TaskCreate, TaskOut, TaskEvidenceCreate, TaskEvidenceOut,
    TaskReviewRequest, TaskSubmitRequest
)
from typing import List, Optional

router = APIRouter(prefix="/task-management", tags=["Job & Task Management"])

# ==========================================
# 1. Job Templates (Company Admin created)
# ==========================================

@router.get("/templates", response_model=List[TaskTemplateOut])
@router.get("/job-templates", response_model=List[TaskTemplateOut])
def list_job_templates(company_id: Optional[int] = None, db: Session = Depends(get_db)):
    """Returns reusable Job Templates with their predefined tasks and default time windows."""
    query = db.query(JobTemplate)
    if company_id:
        query = query.filter(JobTemplate.company_id == company_id)
    
    templates = query.order_by(JobTemplate.created_at.desc()).all()
    out = []
    for t in templates:
        items = [{
            "id": item.id,
            "category_name": item.category_name,
            "task_name": item.task_name,
            "description": item.description,
            "estimated_minutes": item.estimated_minutes,
            "priority": item.priority
        } for item in t.items]
        
        dept_name = "General"
        if t.department_id:
            d = db.query(Department).filter(Department.id == t.department_id).first()
            if d:
                dept_name = d.name

        out.append(TaskTemplateOut(
            id=t.id,
            name=t.name,
            description=t.description,
            department_id=t.department_id,
            department_name=dept_name,
            default_start_time=t.default_start_time or "09:00",
            default_end_time=t.default_end_time or "11:00",
            task_count=len(t.items),
            company_id=t.company_id,
            is_active=t.is_active,
            modified_by=t.modified_by,
            created_at=t.created_at,
            items=items
        ))
    return out

@router.post("/templates", response_model=TaskTemplateOut)
@router.post("/job-templates", response_model=TaskTemplateOut)
def create_job_template(
    req: TaskTemplateCreate,
    company_id: int = 1,
    modified_by: str = "Company Admin",
    db: Session = Depends(get_db)
):
    """Company Admin creates a Job Template with default times and task items."""
    tmpl = JobTemplate(
        name=req.name,
        description=req.description,
        department_id=req.department_id,
        default_start_time=req.default_start_time or "09:00",
        default_end_time=req.default_end_time or "11:00",
        company_id=company_id,
        modified_by=modified_by
    )
    db.add(tmpl)
    db.commit()
    db.refresh(tmpl)

    for item in req.items:
        t_item = JobTemplateItem(
            template_id=tmpl.id,
            category_name=item.category_name,
            task_name=item.task_name,
            description=item.description,
            estimated_minutes=item.estimated_minutes or 30,
            priority=item.priority or "Normal"
        )
        db.add(t_item)
    
    db.commit()
    db.refresh(tmpl)

    # Return structured output
    dept_name = "General"
    if tmpl.department_id:
        d = db.query(Department).filter(Department.id == tmpl.department_id).first()
        if d:
            dept_name = d.name

    items = [{
        "id": item.id,
        "category_name": item.category_name,
        "task_name": item.task_name,
        "description": item.description,
        "estimated_minutes": item.estimated_minutes,
        "priority": item.priority
    } for item in tmpl.items]

    return TaskTemplateOut(
        id=tmpl.id,
        name=tmpl.name,
        description=tmpl.description,
        department_id=tmpl.department_id,
        department_name=dept_name,
        default_start_time=tmpl.default_start_time,
        default_end_time=tmpl.default_end_time,
        task_count=len(items),
        company_id=tmpl.company_id,
        is_active=tmpl.is_active,
        modified_by=tmpl.modified_by,
        created_at=tmpl.created_at,
        items=items
    )

@router.put("/templates/{template_id}")
@router.put("/job-templates/{template_id}")
def update_job_template(
    template_id: int,
    req: TaskTemplateCreate,
    modified_by: str = "Company Admin",
    db: Session = Depends(get_db)
):
    tmpl = db.query(JobTemplate).filter(JobTemplate.id == template_id).first()
    if not tmpl:
        raise HTTPException(status_code=404, detail="Job template not found")

    tmpl.name = req.name
    tmpl.description = req.description
    tmpl.department_id = req.department_id
    if req.default_start_time:
        tmpl.default_start_time = req.default_start_time
    if req.default_end_time:
        tmpl.default_end_time = req.default_end_time
    tmpl.modified_by = modified_by

    # Replace items
    db.query(JobTemplateItem).filter(JobTemplateItem.template_id == template_id).delete()
    for item in req.items:
        t_item = JobTemplateItem(
            template_id=tmpl.id,
            category_name=item.category_name,
            task_name=item.task_name,
            description=item.description,
            estimated_minutes=item.estimated_minutes or 30,
            priority=item.priority or "Normal"
        )
        db.add(t_item)

    db.commit()
    return {"message": "Job template updated successfully"}

@router.delete("/templates/{template_id}")
@router.delete("/job-templates/{template_id}")
def delete_job_template(template_id: int, db: Session = Depends(get_db)):
    tmpl = db.query(JobTemplate).filter(JobTemplate.id == template_id).first()
    if not tmpl:
        raise HTTPException(status_code=404, detail="Job template not found")
    
    active_jobs = db.query(Job).filter(Job.template_id == template_id).count()
    if active_jobs > 0:
        raise HTTPException(status_code=400, detail=f"Cannot delete template because it is linked to {active_jobs} active job(s).")

    db.delete(tmpl)
    db.commit()
    return {"message": "Job template deleted successfully"}

@router.post("/templates/{template_id}/clone")
@router.post("/job-templates/{template_id}/clone")
def clone_job_template(template_id: int, modified_by: str = "Company Admin", db: Session = Depends(get_db)):
    original = db.query(JobTemplate).filter(JobTemplate.id == template_id).first()
    if not original:
        raise HTTPException(status_code=404, detail="Original job template not found")

    clone_name = f"{original.name}_Copy"
    new_tmpl = JobTemplate(
        name=clone_name,
        description=f"Cloned from {original.name}. {original.description or ''}",
        department_id=original.department_id,
        default_start_time=original.default_start_time or "09:00",
        default_end_time=original.default_end_time or "11:00",
        company_id=original.company_id,
        is_active=True,
        modified_by=modified_by
    )
    db.add(new_tmpl)
    db.commit()
    db.refresh(new_tmpl)

    for item in original.items:
        cloned_item = JobTemplateItem(
            template_id=new_tmpl.id,
            category_name=item.category_name,
            task_name=item.task_name,
            description=item.description,
            estimated_minutes=item.estimated_minutes,
            priority=item.priority
        )
        db.add(cloned_item)

    db.commit()
    return {"message": f"Job template cloned successfully as '{clone_name}'", "new_template_id": new_tmpl.id}


# ==========================================
# 2. Jobs & Tasks Management (First-Class)
# ==========================================

@router.get("/jobs")
@router.get("/schedules")
def list_jobs(
    company_id: Optional[int] = None,
    professional: Optional[str] = None,
    user_email: Optional[str] = None,
    user_id: Optional[int] = None,
    role: Optional[str] = None,
    scheduled_date: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Returns Jobs with their tasks.
    Role Scoping Rules:
    - Company Admin: Sees all jobs & tasks under their company.
    - Professional: Sees ONLY their own assigned jobs and tasks.
    """
    query = db.query(Job)
    
    # Resolve user if email or id passed
    current_user = None
    if user_email:
        current_user = db.query(User).filter(User.email == user_email.strip()).first()
    elif user_id:
        current_user = db.query(User).filter(User.id == user_id).first()

    effective_role = role
    if current_user and not effective_role:
        effective_role = current_user.role

    # Professional scoping: ONLY see jobs assigned to them
    if effective_role == "Professional":
        target_name = professional
        if not target_name and current_user:
            target_name = f"{current_user.first_name} {current_user.last_name}".strip()
        
        if target_name:
            query = query.filter(Job.assigned_professionals_json.ilike(f"%{target_name}%"))
        elif current_user:
            query = query.filter(Job.assigned_professional_id == current_user.id)
            
        if current_user and current_user.company_id and not company_id:
            company_id = current_user.company_id
    elif company_id:
        query = query.filter(Job.company_id == company_id)

    if scheduled_date:
        query = query.filter(Job.scheduled_date == scheduled_date)
        
    if status and status != "All":
        query = query.filter(Job.status == status)

    jobs = query.order_by(Job.scheduled_date.desc(), Job.start_time.asc()).all()

    results = []
    for j in jobs:
        tmpl = db.query(JobTemplate).filter(JobTemplate.id == j.template_id).first() if j.template_id else None
        loc = db.query(Location).filter(Location.id == j.location_id).first()
        comp = db.query(Company).filter(Company.id == j.company_id).first()
        profs = json.loads(j.assigned_professionals_json) if j.assigned_professionals_json else []
        
        # Ensure job has a clean Job ID
        formatted_job_id = j.job_id or f"JOB-{j.id:04d}"
        if not j.job_id:
            j.job_id = formatted_job_id
            db.commit()

        tasks_list = []
        for d in j.details:
            formatted_task_id = d.task_id or f"TSK-{d.id:04d}"
            if not d.task_id:
                d.task_id = formatted_task_id
                db.commit()

            d_profs = json.loads(d.assigned_professionals_json) if d.assigned_professionals_json else profs
            
            ev_list = []
            if hasattr(d, 'evidences') and d.evidences:
                for ev in d.evidences:
                    ev_list.append({
                        "id": ev.id,
                        "file_name": ev.file_name,
                        "file_type": ev.file_type,
                        "file_data": ev.file_data,
                        "notes": ev.notes,
                        "uploaded_by": ev.uploaded_by,
                        "submission_version": ev.submission_version,
                        "review_status": ev.review_status,
                        "review_comments": ev.review_comments,
                        "created_at": ev.created_at.isoformat() if ev.created_at else None
                    })

            tasks_list.append({
                "id": d.id,
                "task_id": formatted_task_id,
                "schedule_id": j.id,
                "job_id": formatted_job_id,
                "category_name": d.category_name,
                "task_name": d.task_name,
                "description": d.description,
                "work_location_name": d.work_location_name or j.work_location_name or "Standard Unit",
                "shift_name": d.shift_name or f"{j.start_time or '09:00'} - {j.end_time or '11:00'}",
                "estimated_minutes": d.estimated_minutes or 30,
                "priority": d.priority or "Normal",
                "is_recursive": d.is_recursive,
                "assigned_professional_name": d.assigned_professional_name or (d_profs[0] if d_profs else None),
                "assigned_professionals": d_profs,
                "professionals": d_profs,
                "evidence_required": d.evidence_required or False,
                "evidence_type": d.evidence_type or "photo",
                "status": d.status,
                "notes": d.notes,
                "submitted_at": d.submitted_at.isoformat() if d.submitted_at else None,
                "reviewed_at": d.reviewed_at.isoformat() if d.reviewed_at else None,
                "reviewed_by": d.reviewed_by,
                "rejection_reason": d.rejection_reason,
                "checklist_data": d.checklist_data,
                "completed_at": d.completed_at.isoformat() if d.completed_at else None,
                "evidences": ev_list
            })

        results.append({
            "id": j.id,
            "job_id": formatted_job_id,
            "title": j.title or (tmpl.name if tmpl else f"Job #{j.id}"),
            "template_id": j.template_id,
            "template_name": tmpl.name if tmpl else None,
            "location_id": j.location_id,
            "location_name": loc.name if loc else f"Location #{j.location_id}",
            "work_location_name": j.work_location_name or "Main Platform",
            "company_id": j.company_id,
            "company_name": comp.name if comp else None,
            "scheduled_date": j.scheduled_date or datetime.now().strftime("%Y-%m-%d"),
            "start_time": j.start_time or "09:00",
            "end_time": j.end_time or "11:00",
            "time_window": f"{j.start_time or '09:00'} - {j.end_time or '11:00'}",
            "assigned_professionals": profs,
            "professionals_count": len(profs),
            "status": j.status,
            "modified_by": j.modified_by or "Company Admin",
            "created_at": j.created_at.isoformat() if j.created_at else None,
            "tasks_count": len(tasks_list),
            "tasks": tasks_list,
            # Backward compatibility fields:
            "details": tasks_list,
            "professionals": profs
        })

    return results

@router.post("/jobs")
@router.post("/schedules")
def create_job(
    req: TaskScheduleCreate,
    company_id: int = 1,
    modified_by: str = "Company Admin",
    db: Session = Depends(get_db)
):
    """
    Company Admin creates a Job with customized start_time and end_time (e.g. 09:00 - 11:00)
    and multiple Tasks under it. Assigns a unique Job ID and Task IDs.
    """
    loc = db.query(Location).filter(Location.id == req.location_id).first()
    target_company_id = loc.company_id if loc else company_id

    # Work Location name
    work_location_name = req.work_location_name
    if not work_location_name and req.work_location_id:
        wl = db.query(WorkLocation).filter(WorkLocation.id == req.work_location_id).first()
        if wl:
            work_location_name = wl.name
    if not work_location_name:
        wl = db.query(WorkLocation).filter(WorkLocation.location_id == req.location_id).first()
        work_location_name = wl.name if wl else "Main Entrance"

    scheduled_date = req.scheduled_date or datetime.now().strftime("%Y-%m-%d")
    profs_json = json.dumps(req.assigned_professionals)

    # Job title
    title = req.title
    tmpl = None
    if req.template_id:
        tmpl = db.query(JobTemplate).filter(JobTemplate.id == req.template_id).first()
        if not title and tmpl:
            title = tmpl.name

    if not title:
        title = f"Service Job at {loc.name if loc else 'Facility'}"

    # Customized Start & End times
    start_time = req.start_time or (tmpl.default_start_time if tmpl else "09:00") or "09:00"
    end_time = req.end_time or (tmpl.default_end_time if tmpl else "11:00") or "11:00"
    shift_display = req.shift_name or f"Job Window ({start_time} - {end_time})"

    # Primary professional resolution
    primary_pro_id = None
    primary_pro_name = None
    if req.assigned_professionals and len(req.assigned_professionals) > 0:
        primary_pro_name = req.assigned_professionals[0]
        # Match professional ID if exists
        p = db.query(Professional).filter(
            Professional.company_id == target_company_id,
            (Professional.first_name + " " + Professional.last_name).ilike(f"%{primary_pro_name}%")
        ).first()
        if p:
            primary_pro_id = p.id

    target_tmpl_id = req.template_id
    if not target_tmpl_id:
        first_tmpl = db.query(JobTemplate).filter(JobTemplate.company_id == target_company_id).first()
        if not first_tmpl:
            first_tmpl = db.query(JobTemplate).first()
        target_tmpl_id = first_tmpl.id if first_tmpl else 1

    # 1. Create Job record
    new_job = Job(
        title=title,
        template_id=target_tmpl_id,
        location_id=req.location_id,
        work_location_name=work_location_name,
        company_id=target_company_id,
        assigned_professional_id=primary_pro_id,
        assigned_professional_name=primary_pro_name,
        assigned_professionals_json=profs_json,
        scheduled_date=scheduled_date,
        start_time=start_time,
        end_time=end_time,
        shift_name=shift_display,
        is_recursive=req.is_recursive if req.is_recursive else False,
        exclude_holidays=req.exclude_holidays if req.exclude_holidays else False,
        status="Scheduled",
        modified_by=modified_by
    )
    db.add(new_job)
    db.commit()
    db.refresh(new_job)

    # Assign formatted Job ID
    new_job.job_id = f"JOB-{new_job.id:04d}"
    db.commit()

    # 2. Populate Tasks under this Job
    tasks_to_add = []
    
    # If custom tasks array provided in request:
    if req.tasks and len(req.tasks) > 0:
        for t_req in req.tasks:
            t_profs = t_req.assigned_professionals if t_req.assigned_professionals else (
                [t_req.assigned_professional_name] if t_req.assigned_professional_name else req.assigned_professionals
            )
            tasks_to_add.append({
                "task_name": t_req.task_name,
                "category_name": t_req.category_name or "General",
                "description": t_req.description or f"Perform {t_req.task_name}",
                "estimated_minutes": t_req.estimated_minutes or 30,
                "priority": t_req.priority or "Normal",
                "work_location_name": t_req.work_location_name or work_location_name,
                "assigned_professional_name": t_req.assigned_professional_name or (t_profs[0] if t_profs else None),
                "assigned_professionals": t_profs,
                "evidence_required": getattr(t_req, 'evidence_required', False) or False,
                "evidence_type": getattr(t_req, 'evidence_type', 'photo') or 'photo'
            })
    elif tmpl and tmpl.items:
        for item in tmpl.items:
            tasks_to_add.append({
                "task_name": item.task_name,
                "category_name": item.category_name,
                "description": item.description,
                "estimated_minutes": item.estimated_minutes or 30,
                "priority": item.priority or "Normal",
                "work_location_name": work_location_name,
                "assigned_professional_name": primary_pro_name,
                "assigned_professionals": req.assigned_professionals,
                "evidence_required": False,
                "evidence_type": "photo"
            })
    else:
        # Default single general task if none specified
        tasks_to_add.append({
            "task_name": "Standard Inspection & Service",
            "category_name": "Operations",
            "description": f"Carry out assigned service tasks during scheduled time window ({start_time} - {end_time})",
            "estimated_minutes": 60,
            "priority": "Normal",
            "work_location_name": work_location_name,
            "assigned_professional_name": primary_pro_name,
            "assigned_professionals": req.assigned_professionals,
            "evidence_required": False,
            "evidence_type": "photo"
        })

    created_tasks = []
    for t_data in tasks_to_add:
        t_profs_list = t_data.get("assigned_professionals") or req.assigned_professionals or []
        t = Task(
            schedule_id=new_job.id,
            category_name=t_data["category_name"],
            task_name=t_data["task_name"],
            description=t_data.get("description"),
            work_location_name=t_data.get("work_location_name") or work_location_name,
            shift_name=shift_display,
            estimated_minutes=t_data.get("estimated_minutes", 30),
            priority=t_data.get("priority", "Normal"),
            is_recursive=new_job.is_recursive,
            assigned_professional_name=t_data.get("assigned_professional_name"),
            assigned_professionals_json=json.dumps(t_profs_list),
            evidence_required=t_data.get("evidence_required", False),
            evidence_type=t_data.get("evidence_type", "photo"),
            status="YetToStart"
        )
        db.add(t)
        db.commit()
        db.refresh(t)
        
        t.task_id = f"TSK-{t.id:04d}"
        db.commit()
        created_tasks.append(t.task_id)

    # 3. Notification for Carers
    profs_display = ", ".join(req.assigned_professionals) if req.assigned_professionals else "Unassigned"
    notif = Notification(
        title=f"New Job Assigned: {new_job.job_id} ({title})",
        message=f"Scheduled on {scheduled_date} from {start_time} to {end_time} at {loc.name if loc else 'Site'}. Tasks: {len(created_tasks)}. Assigned: {profs_display}.",
        type="task_assigned",
        is_read=False
    )
    db.add(notif)

    # 4. Audit Log
    db.add(AuditLog(
        action="CREATE_JOB",
        target_type="Job",
        target_id=new_job.job_id,
        details=f"Created Job {new_job.job_id} ({title}) for {scheduled_date} {start_time}-{end_time} with {len(created_tasks)} tasks assigned to {profs_display}"
    ))
    db.commit()

    return {
        "message": "Job created successfully",
        "job_id": new_job.job_id,
        "schedule_id": new_job.id,
        "tasks_count": len(created_tasks),
        "task_ids": created_tasks
    }

@router.put("/jobs/{job_id}")
def update_job(
    job_id: int,
    req: dict,
    modified_by: str = "Company Admin",
    db: Session = Depends(get_db)
):
    """Company Admin customizes job times (start_time, end_time), status, or assigned staff."""
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    if "title" in req:
        job.title = req["title"]
    if "start_time" in req:
        job.start_time = req["start_time"]
    if "end_time" in req:
        job.end_time = req["end_time"]
    if "scheduled_date" in req:
        job.scheduled_date = req["scheduled_date"]
    if "status" in req:
        job.status = req["status"]
    if "work_location_name" in req:
        job.work_location_name = req["work_location_name"]
    if "assigned_professionals" in req:
        job.assigned_professionals_json = json.dumps(req["assigned_professionals"])
        if req["assigned_professionals"]:
            job.assigned_professional_name = req["assigned_professionals"][0]

    job.modified_by = modified_by
    db.commit()
    return {"message": f"Job {job.job_id or job.id} updated successfully"}

@router.delete("/jobs/{job_id}")
def delete_job(job_id: int, db: Session = Depends(get_db)):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    db.delete(job)
    db.commit()
    return {"message": "Job and all associated tasks deleted successfully"}

@router.post("/jobs/{job_id}/tasks")
def add_task_to_job(
    job_id: int,
    req: TaskCreate,
    db: Session = Depends(get_db)
):
    """Adds a task under an existing Job with a unique Task ID."""
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    profs = req.assigned_professionals if req.assigned_professionals else (
        json.loads(job.assigned_professionals_json) if job.assigned_professionals_json else []
    )

    t = Task(
        schedule_id=job.id,
        category_name=req.category_name or "General",
        task_name=req.task_name,
        description=req.description,
        work_location_name=req.work_location_name or job.work_location_name,
        shift_name=f"{job.start_time} - {job.end_time}",
        estimated_minutes=req.estimated_minutes or 30,
        priority=req.priority or "Normal",
        is_recursive=job.is_recursive,
        assigned_professionals_json=json.dumps(profs),
        status="YetToStart"
    )
    db.add(t)
    db.commit()
    db.refresh(t)

    t.task_id = f"TSK-{t.id:04d}"
    db.commit()

    return {
        "message": "Task added to job successfully",
        "task_id": t.task_id,
        "id": t.id
    }

@router.put("/tasks/{task_id}/status")
def update_task_status(
    task_id: str,
    req: dict,
    db: Session = Depends(get_db)
):
    """Updates the status of a specific task (YetToStart, InProgress, Completed)."""
    # Accept either integer ID or formatted code like 'TSK-1001'
    t = None
    if task_id.isdigit():
        t = db.query(Task).filter(Task.id == int(task_id)).first()
    if not t:
        t = db.query(Task).filter(Task.task_id == task_id).first()

    if not t:
        raise HTTPException(status_code=404, detail="Task not found")

    new_status = req.get("status", "InProgress")
    t.status = new_status
    if "notes" in req:
        t.notes = req["notes"]
    if new_status in ["Completed", "Ended"]:
        t.completed_at = datetime.utcnow()

    # If all tasks in job are completed, update job status
    job = t.schedule
    if job:
        all_completed = all(item.status in ["Completed", "Ended"] for item in job.details)
        if all_completed:
            job.status = "Completed"
        elif any(item.status == "InProgress" for item in job.details):
            job.status = "InProgress"

    db.commit()
    return {
        "message": f"Task '{t.task_name}' status updated to {new_status}",
        "task_id": t.task_id,
        "status": t.status
    }

@router.post("/reschedule-detail")
def reschedule_task_detail(req: RescheduleTaskRequest, modified_by: str = "Admin", db: Session = Depends(get_db)):
    detail = db.query(Task).filter(Task.id == req.detail_id).first()
    if not detail:
        raise HTTPException(status_code=404, detail="Task item not found")

    if req.work_location_id:
        wl = db.query(WorkLocation).filter(WorkLocation.id == req.work_location_id).first()
        if wl:
            detail.work_location_name = wl.name
    
    if req.shift_name:
        detail.shift_name = req.shift_name

    if req.assigned_professionals:
        detail.assigned_professionals_json = json.dumps(req.assigned_professionals)

    if req.notes:
        detail.notes = req.notes

    detail.status = "InProgress"
    db.commit()
    return {"message": f"Task '{detail.task_name}' re-scheduled successfully."}

def _resolve_task(task_id: str, db: Session):
    t = None
    if str(task_id).isdigit():
        t = db.query(Task).filter(Task.id == int(task_id)).first()
    if not t:
        t = db.query(Task).filter(Task.task_id == str(task_id)).first()
    return t

@router.put("/tasks/{task_id}")
def update_task_item(
    task_id: str,
    req: dict,
    modified_by: str = "Company Admin",
    db: Session = Depends(get_db)
):
    """Company Admin edits individual task parameters, re-assigns staff, or alters evidence requirement."""
    t = _resolve_task(task_id, db)
    if not t:
        raise HTTPException(status_code=404, detail="Task not found")

    if "task_name" in req:
        t.task_name = req["task_name"]
    if "category_name" in req:
        t.category_name = req["category_name"]
    if "description" in req:
        t.description = req["description"]
    if "priority" in req:
        t.priority = req["priority"]
    if "estimated_minutes" in req:
        t.estimated_minutes = req["estimated_minutes"]
    if "work_location_name" in req:
        t.work_location_name = req["work_location_name"]
    if "evidence_required" in req:
        t.evidence_required = req["evidence_required"]
    if "evidence_type" in req:
        t.evidence_type = req["evidence_type"]
    if "assigned_professional_name" in req:
        t.assigned_professional_name = req["assigned_professional_name"]
        if req["assigned_professional_name"]:
            t.assigned_professionals_json = json.dumps([req["assigned_professional_name"]])
    if "assigned_professionals" in req:
        t.assigned_professionals_json = json.dumps(req["assigned_professionals"])
        if req["assigned_professionals"]:
            t.assigned_professional_name = req["assigned_professionals"][0]

    comp_id = t.schedule.company_id if t.schedule else None
    db.add(AuditLog(
        company_id=comp_id,
        action="UPDATE_TASK",
        target_type="Task",
        target_id=t.task_id or str(t.id),
        details=f"Task {t.task_id or t.id} updated by {modified_by}"
    ))
    db.commit()
    return {"message": f"Task {t.task_id or t.id} updated successfully"}

@router.delete("/tasks/{task_id}")
def delete_task_item(task_id: str, db: Session = Depends(get_db)):
    """Deletes an individual task from a job."""
    t = _resolve_task(task_id, db)
    if not t:
        raise HTTPException(status_code=404, detail="Task not found")

    job_id = t.schedule.job_id if t.schedule else "Job"
    comp_id = t.schedule.company_id if t.schedule else None
    task_name = t.task_name
    db.delete(t)
    db.add(AuditLog(
        company_id=comp_id,
        action="DELETE_TASK",
        target_type="Task",
        target_id=str(task_id),
        details=f"Task '{task_name}' removed from {job_id}"
    ))
    db.commit()
    return {"message": "Task deleted successfully"}

@router.post("/tasks/{task_id}/start")
def start_task(task_id: str, db: Session = Depends(get_db)):
    """Professional marks a task as InProgress."""
    t = _resolve_task(task_id, db)
    if not t:
        raise HTTPException(status_code=404, detail="Task not found")

    t.status = "InProgress"
    if t.schedule and t.schedule.status == "Scheduled":
        t.schedule.status = "InProgress"

    db.add(AuditLog(
        company_id=t.schedule.company_id if t.schedule else None,
        action="TASK_STARTED",
        target_type="Task",
        target_id=t.task_id or str(t.id),
        details=f"Task '{t.task_name}' marked InProgress"
    ))
    db.commit()
    return {"message": f"Task {t.task_id or t.id} is now InProgress", "status": "InProgress"}

@router.post("/tasks/{task_id}/submit")
def submit_task_for_review(
    task_id: str,
    req: TaskSubmitRequest,
    db: Session = Depends(get_db)
):
    """
    Employee completes the work and submits the task along with evidence / completion notes.
    Transitions task status to 'SubmittedForReview'. Dispatches a notification to Company Admin.
    """
    t = _resolve_task(task_id, db)
    if not t:
        raise HTTPException(status_code=404, detail="Task not found")

    current_version = len(t.evidences) + 1 if hasattr(t, 'evidences') and t.evidences else 1

    # If evidence file or data provided, record TaskEvidence
    if req.file_name or req.file_data or req.notes:
        evidence = TaskEvidence(
            schedule_id=t.schedule_id,
            task_detail_id=t.id,
            uploaded_by=req.submitted_by or t.assigned_professional_name or "Employee",
            file_name=req.file_name or f"Evidence_V{current_version}.jpg",
            file_type=req.file_type or "photo",
            file_data=req.file_data,
            notes=req.notes,
            submission_version=current_version,
            review_status="Pending"
        )
        db.add(evidence)

    t.status = "SubmittedForReview"
    t.submitted_at = datetime.utcnow()
    if req.notes:
        t.notes = req.notes
    if req.checklist_data:
        t.checklist_data = req.checklist_data

    # Send Notification to Company Admin
    comp_id = t.schedule.company_id if t.schedule else 1
    job_code = t.schedule.job_id if t.schedule else "Job"
    notif = Notification(
        company_id=comp_id,
        title=f"Task Submitted for Review: {t.task_id or t.task_name}",
        message=f"{t.assigned_professional_name or 'Employee'} submitted {t.task_name} under {job_code} with evidence. Review required.",
        type="task_review",
        is_read=False
    )
    db.add(notif)

    db.add(AuditLog(
        company_id=comp_id,
        user_email=req.submitted_by or t.assigned_professional_name,
        action="TASK_SUBMITTED",
        target_type="Task",
        target_id=t.task_id or str(t.id),
        details=f"Task '{t.task_name}' submitted for review (version {current_version})"
    ))

    db.commit()
    return {
        "message": f"Task '{t.task_name}' successfully submitted for review.",
        "status": "SubmittedForReview",
        "task_id": t.task_id or str(t.id),
        "version": current_version
    }

@router.post("/tasks/{task_id}/evidence")
def upload_task_evidence(
    task_id: str,
    req: TaskEvidenceCreate,
    uploaded_by: str = "Employee",
    db: Session = Depends(get_db)
):
    """Uploads evidence artifact to a task."""
    t = _resolve_task(task_id, db)
    if not t:
        raise HTTPException(status_code=404, detail="Task not found")

    version = len(t.evidences) + 1 if hasattr(t, 'evidences') and t.evidences else 1
    ev = TaskEvidence(
        schedule_id=t.schedule_id,
        task_detail_id=t.id,
        uploaded_by=uploaded_by,
        file_name=req.file_name,
        file_type=req.file_type,
        file_data=req.file_data,
        notes=req.notes,
        submission_version=version,
        review_status="Pending"
    )
    db.add(ev)
    db.commit()
    db.refresh(ev)
    return {"message": "Evidence uploaded successfully", "evidence_id": ev.id, "version": version}

@router.get("/tasks/{task_id}/evidence")
def get_task_evidences(task_id: str, db: Session = Depends(get_db)):
    t = _resolve_task(task_id, db)
    if not t:
        raise HTTPException(status_code=404, detail="Task not found")

    evs = db.query(TaskEvidence).filter(TaskEvidence.task_detail_id == t.id).order_by(TaskEvidence.created_at.desc()).all()
    return [{
        "id": e.id,
        "file_name": e.file_name,
        "file_type": e.file_type,
        "file_data": e.file_data,
        "notes": e.notes,
        "uploaded_by": e.uploaded_by,
        "submission_version": e.submission_version,
        "review_status": e.review_status,
        "review_comments": e.review_comments,
        "created_at": e.created_at.isoformat() if e.created_at else None
    } for e in evs]

@router.post("/tasks/{task_id}/review")
def review_task_submission(
    task_id: str,
    req: TaskReviewRequest,
    db: Session = Depends(get_db)
):
    """
    Company Admin reviews submitted work:
    - If Approve: status becomes 'Completed'. Automatically checks if entire Job is eligible for completion.
    - If Reject / Rework: status becomes 'ReworkRequired', saves comments as rejection_reason, notifies employee.
    """
    t = _resolve_task(task_id, db)
    if not t:
        raise HTTPException(status_code=404, detail="Task not found")

    decision = req.decision.strip().lower()
    reviewer = req.reviewer_name or "Company Admin"
    comp_id = t.schedule.company_id if t.schedule else None

    # Latest evidence if any
    latest_ev = db.query(TaskEvidence).filter(TaskEvidence.task_detail_id == t.id).order_by(TaskEvidence.submission_version.desc()).first()

    if decision in ["approve", "approved", "accept", "completed"]:
        t.status = "Completed"
        t.completed_at = datetime.utcnow()
        t.reviewed_at = datetime.utcnow()
        t.reviewed_by = reviewer
        t.rejection_reason = None
        if latest_ev:
            latest_ev.review_status = "Approved"
            latest_ev.review_comments = req.comments or "Approved as compliant."

        # Check entire Job completion
        job = t.schedule
        job_completed = False
        if job:
            all_done = all(item.status in ["Completed", "Ended"] for item in job.details)
            if all_done:
                job.status = "Completed"
                job_completed = True

        # Notification for Employee
        notif = Notification(
            company_id=comp_id,
            title=f"Task Approved: {t.task_name}",
            message=f"Your submitted work for '{t.task_name}' in {job.job_id if job else 'Job'} has been approved by {reviewer}.",
            type="success",
            is_read=False
        )
        db.add(notif)

        db.add(AuditLog(
            company_id=comp_id,
            action="TASK_APPROVED",
            target_type="Task",
            target_id=t.task_id or str(t.id),
            details=f"Task '{t.task_name}' approved by {reviewer}. Comments: {req.comments or 'Compliant'}"
        ))

        db.commit()
        return {
            "message": f"Task '{t.task_name}' approved successfully.",
            "status": "Completed",
            "job_status": job.status if job else "N/A",
            "job_completed": job_completed
        }

    else: # Reject / Rework Required
        t.status = "ReworkRequired"
        t.reviewed_at = datetime.utcnow()
        t.reviewed_by = reviewer
        t.rejection_reason = req.comments or "Corrections required before approval."
        if latest_ev:
            latest_ev.review_status = "Rejected"
            latest_ev.review_comments = t.rejection_reason

        # Notification for Employee
        notif = Notification(
            company_id=comp_id,
            title=f"Rework Required: {t.task_name}",
            message=f"Corrections requested for '{t.task_name}'. Reason: {t.rejection_reason}",
            type="warning",
            is_read=False
        )
        db.add(notif)

        db.add(AuditLog(
            company_id=comp_id,
            action="TASK_REWORK_REQUESTED",
            target_type="Task",
            target_id=t.task_id or str(t.id),
            details=f"Rework requested for Task '{t.task_name}' by {reviewer}. Reason: {t.rejection_reason}"
        ))

        db.commit()
        return {
            "message": f"Rework requested for task '{t.task_name}'.",
            "status": "ReworkRequired",
            "rejection_reason": t.rejection_reason
        }

@router.get("/submissions")
def list_task_submissions(
    company_id: Optional[int] = None,
    status: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Returns submitted tasks for Company Admin review portal with uploaded evidence and status.
    """
    query = db.query(Task).join(Job)
    if company_id:
        query = query.filter(Job.company_id == company_id)

    if status and status != "All":
        query = query.filter(Task.status == status)
    else:
        # Default shows actionable items: SubmittedForReview and ReworkRequired
        query = query.filter(Task.status.in_(["SubmittedForReview", "ReworkRequired", "Completed"]))

    if search:
        query = query.filter(
            (Task.task_name.ilike(f"%{search}%")) |
            (Task.task_id.ilike(f"%{search}%")) |
            (Job.job_id.ilike(f"%{search}%")) |
            (Task.assigned_professional_name.ilike(f"%{search}%"))
        )

    tasks = query.order_by(Task.submitted_at.desc(), Task.id.desc()).all()

    out = []
    for t in tasks:
        job = t.schedule
        ev_list = []
        if hasattr(t, 'evidences') and t.evidences:
            for ev in t.evidences:
                ev_list.append({
                    "id": ev.id,
                    "file_name": ev.file_name,
                    "file_type": ev.file_type,
                    "file_data": ev.file_data,
                    "notes": ev.notes,
                    "uploaded_by": ev.uploaded_by,
                    "submission_version": ev.submission_version,
                    "review_status": ev.review_status,
                    "review_comments": ev.review_comments,
                    "created_at": ev.created_at.isoformat() if ev.created_at else None
                })

        out.append({
            "id": t.id,
            "task_id": t.task_id or f"TSK-{t.id:04d}",
            "schedule_id": t.schedule_id,
            "job_id": job.job_id if job else f"JOB-{t.schedule_id:04d}",
            "job_title": job.title if job else "Service Job",
            "location_name": job.location.name if job and job.location else "Main Site",
            "work_location_name": t.work_location_name or (job.work_location_name if job else "Site"),
            "category_name": t.category_name,
            "task_name": t.task_name,
            "description": t.description,
            "priority": t.priority,
            "status": t.status,
            "assigned_professional_name": t.assigned_professional_name or "Assigned Staff",
            "evidence_required": t.evidence_required,
            "evidence_type": t.evidence_type,
            "notes": t.notes,
            "rejection_reason": t.rejection_reason,
            "submitted_at": t.submitted_at.isoformat() if t.submitted_at else None,
            "reviewed_at": t.reviewed_at.isoformat() if t.reviewed_at else None,
            "reviewed_by": t.reviewed_by,
            "evidences": ev_list
        })

    return out

import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import WorkLocation, Location, TaskScheduleDetail
from app.schemas import WorkLocationCreate, WorkLocationOut
from typing import List, Optional

router = APIRouter(prefix="/work-locations", tags=["Work Locations"])

@router.get("", response_model=List[WorkLocationOut])
def list_work_locations(location_id: Optional[int] = None, db: Session = Depends(get_db)):
    query = db.query(WorkLocation)
    if location_id:
        query = query.filter(WorkLocation.location_id == location_id)
    
    results = []
    for wl in query.order_by(WorkLocation.created_at.desc()).all():
        results.append(WorkLocationOut(
            id=wl.id,
            location_id=wl.location_id,
            location_name=wl.location.name if wl.location else None,
            name=wl.name,
            description=wl.description,
            latitude=wl.latitude,
            longitude=wl.longitude,
            qr_code_data=wl.qr_code_data,
            is_active=wl.is_active,
            modified_by=wl.modified_by,
            created_at=wl.created_at
        ))
    return results

@router.post("", response_model=WorkLocationOut)
def create_work_location(req: WorkLocationCreate, modified_by: str = "Admin", db: Session = Depends(get_db)):
    loc = db.query(Location).filter(Location.id == req.location_id).first()
    if not loc:
        raise HTTPException(status_code=404, detail="Parent location not found")

    qr_code = f"AURA-WL-{uuid.uuid4().hex[:8].upper()}"
    wl = WorkLocation(
        location_id=req.location_id,
        name=req.name,
        description=req.description,
        latitude=req.latitude,
        longitude=req.longitude,
        qr_code_data=qr_code,
        is_active=True,
        modified_by=modified_by
    )
    db.add(wl)
    db.commit()
    db.refresh(wl)
    
    return WorkLocationOut(
        id=wl.id,
        location_id=wl.location_id,
        location_name=loc.name,
        name=wl.name,
        description=wl.description,
        latitude=wl.latitude,
        longitude=wl.longitude,
        qr_code_data=wl.qr_code_data,
        is_active=wl.is_active,
        modified_by=wl.modified_by,
        created_at=wl.created_at
    )

@router.put("/{wl_id}", response_model=WorkLocationOut)
def update_work_location(wl_id: int, req: WorkLocationCreate, modified_by: str = "Admin", db: Session = Depends(get_db)):
    wl = db.query(WorkLocation).filter(WorkLocation.id == wl_id).first()
    if not wl:
        raise HTTPException(status_code=404, detail="Work location not found")

    wl.location_id = req.location_id
    wl.name = req.name
    wl.description = req.description
    wl.latitude = req.latitude
    wl.longitude = req.longitude
    wl.modified_by = modified_by

    db.commit()
    db.refresh(wl)
    
    return WorkLocationOut(
        id=wl.id,
        location_id=wl.location_id,
        location_name=wl.location.name if wl.location else None,
        name=wl.name,
        description=wl.description,
        latitude=wl.latitude,
        longitude=wl.longitude,
        qr_code_data=wl.qr_code_data,
        is_active=wl.is_active,
        modified_by=wl.modified_by,
        created_at=wl.created_at
    )

@router.post("/{wl_id}/toggle-status")
def toggle_work_location_status(wl_id: int, db: Session = Depends(get_db)):
    wl = db.query(WorkLocation).filter(WorkLocation.id == wl_id).first()
    if not wl:
        raise HTTPException(status_code=404, detail="Work location not found")

    # Specification Business Rule: Cannot deactivate work location which is already assigned to some tasks
    if wl.is_active:
        assigned = db.query(TaskScheduleDetail).filter(TaskScheduleDetail.work_location_name == wl.name).count()
        if assigned > 0:
            raise HTTPException(status_code=400, detail=f"Cannot deactivate work location '{wl.name}' because it is assigned to {assigned} active scheduled tasks.")

    wl.is_active = not wl.is_active
    db.commit()
    return {"message": f"Work location status updated to {'active' if wl.is_active else 'inactive'}", "is_active": wl.is_active}

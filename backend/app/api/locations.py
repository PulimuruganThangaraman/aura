from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Location, WorkLocation, TaskSchedule
from app.schemas import LocationCreate, LocationOut
from typing import List, Optional

router = APIRouter(prefix="/locations", tags=["Locations"])

@router.get("", response_model=List[LocationOut])
def list_locations(company_id: Optional[int] = None, db: Session = Depends(get_db)):
    query = db.query(Location)
    if company_id:
        query = query.filter(Location.company_id == company_id)
    return query.order_by(Location.created_at.desc()).all()

@router.post("", response_model=LocationOut)
def create_location(req: LocationCreate, company_id: int = 1, modified_by: str = "Admin", db: Session = Depends(get_db)):
    loc = Location(
        name=req.name,
        description=req.description,
        contact_person=req.contact_person,
        contact_email=req.contact_email,
        contact_phone=req.contact_phone,
        city=req.city,
        state=req.state,
        zip_code=req.zip_code,
        latitude=req.latitude,
        longitude=req.longitude,
        company_id=company_id,
        is_active=True,
        modified_by=modified_by
    )
    db.add(loc)
    db.commit()
    db.refresh(loc)
    return loc

@router.put("/{loc_id}", response_model=LocationOut)
def update_location(loc_id: int, req: LocationCreate, modified_by: str = "Admin", db: Session = Depends(get_db)):
    loc = db.query(Location).filter(Location.id == loc_id).first()
    if not loc:
        raise HTTPException(status_code=404, detail="Location not found")

    loc.name = req.name
    loc.description = req.description
    loc.contact_person = req.contact_person
    loc.contact_email = req.contact_email
    loc.contact_phone = req.contact_phone
    loc.city = req.city
    loc.state = req.state
    loc.zip_code = req.zip_code
    loc.latitude = req.latitude
    loc.longitude = req.longitude
    loc.modified_by = modified_by

    db.commit()
    db.refresh(loc)
    return loc

@router.post("/{loc_id}/toggle-status")
def toggle_location_status(loc_id: int, db: Session = Depends(get_db)):
    loc = db.query(Location).filter(Location.id == loc_id).first()
    if not loc:
        raise HTTPException(status_code=404, detail="Location not found")

    # Specification Business Rule: Cannot deactivate location if assigned to active tasks
    if loc.is_active:
        assigned_tasks = db.query(TaskSchedule).filter(TaskSchedule.location_id == loc_id).count()
        if assigned_tasks > 0:
            raise HTTPException(status_code=400, detail="Cannot deactivate location because it is currently assigned to active task schedules.")

    loc.is_active = not loc.is_active
    
    # Cascade deactivation to work locations
    if not loc.is_active:
        db.query(WorkLocation).filter(WorkLocation.location_id == loc_id).update({"is_active": False})

    db.commit()
    return {
        "message": f"Location {'activated' if loc.is_active else 'deactivated'} successfully",
        "is_active": loc.is_active
    }

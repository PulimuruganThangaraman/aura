from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Department
from app.schemas import DepartmentCreate, DepartmentOut
from typing import List, Optional

router = APIRouter(prefix="/departments", tags=["Departments"])

@router.get("", response_model=List[DepartmentOut])
def list_departments(company_id: Optional[int] = None, db: Session = Depends(get_db)):
    query = db.query(Department)
    if company_id:
        query = query.filter(Department.company_id == company_id)
    return query.order_by(Department.created_at.desc()).all()

@router.post("", response_model=DepartmentOut)
def create_department(req: DepartmentCreate, company_id: int = 1, modified_by: str = "Admin", db: Session = Depends(get_db)):
    dept = Department(
        name=req.name,
        description=req.description,
        parent_id=req.parent_id,
        company_id=company_id,
        is_active=True,
        modified_by=modified_by
    )
    db.add(dept)
    db.commit()
    db.refresh(dept)
    return dept

@router.put("/{dept_id}", response_model=DepartmentOut)
def update_department(dept_id: int, req: DepartmentCreate, modified_by: str = "Admin", db: Session = Depends(get_db)):
    dept = db.query(Department).filter(Department.id == dept_id).first()
    if not dept:
        raise HTTPException(status_code=404, detail="Department not found")

    dept.name = req.name
    dept.description = req.description
    dept.parent_id = req.parent_id
    dept.modified_by = modified_by

    db.commit()
    db.refresh(dept)
    return dept

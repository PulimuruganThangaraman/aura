import random
import string
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Company, User
from app.schemas import CompanyCreate, CompanyOut
from app.core.security import get_password_hash
from typing import List, Optional

router = APIRouter(prefix="/companies", tags=["Companies"])

def generate_company_code():
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))

@router.get("", response_model=List[CompanyOut])
def list_companies(db: Session = Depends(get_db)):
    return db.query(Company).order_by(Company.created_at.desc()).all()

@router.get("/{company_id}", response_model=CompanyOut)
def get_company(company_id: int, db: Session = Depends(get_db)):
    c = db.query(Company).filter(Company.id == company_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Company not found")
    return c

@router.post("", response_model=CompanyOut)
def create_company(req: CompanyCreate, db: Session = Depends(get_db)):
    code = req.company_code if req.company_code else generate_company_code()
    
    company = Company(
        name=req.name,
        code=code,
        industry_type=req.industry_type,
        contact_name=req.contact_name,
        contact_email=req.contact_email,
        phone_number=req.phone_number,
        website=req.website,
        billing_address1=req.billing_address1,
        billing_address2=req.billing_address2,
        billing_city=req.billing_city,
        billing_state=req.billing_state,
        billing_zipcode=req.billing_zipcode,
        shipping_address1=req.shipping_address1,
        shipping_address2=req.shipping_address2,
        shipping_city=req.shipping_city,
        shipping_state=req.shipping_state,
        shipping_zipcode=req.shipping_zipcode,
        is_active=True
    )
    db.add(company)
    db.commit()
    db.refresh(company)

    # Business Rule: Automatically create a Company Admin user when a new company is created
    if req.contact_email:
        admin_email = req.contact_email
        existing_user = db.query(User).filter(User.email == admin_email).first()
        if not existing_user:
            first = req.contact_name.split()[0] if req.contact_name else "Admin"
            last = req.contact_name.split()[-1] if req.contact_name and len(req.contact_name.split()) > 1 else "User"
            company_admin = User(
                email=admin_email,
                hashed_password=get_password_hash("123456"), # Default temporary password
                first_name=first,
                last_name=last,
                phone=req.phone_number,
                role="Company Admin",
                is_active=True,
                company_id=company.id
            )
            db.add(company_admin)
            db.commit()

    return company

@router.put("/{company_id}", response_model=CompanyOut)
def update_company(company_id: int, req: CompanyCreate, db: Session = Depends(get_db)):
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")

    company.name = req.name
    if req.company_code:
        company.code = req.company_code
    company.industry_type = req.industry_type
    company.contact_name = req.contact_name
    company.contact_email = req.contact_email
    company.phone_number = req.phone_number
    company.website = req.website
    company.billing_address1 = req.billing_address1
    company.billing_address2 = req.billing_address2
    company.billing_city = req.billing_city
    company.billing_state = req.billing_state
    company.billing_zipcode = req.billing_zipcode
    company.shipping_address1 = req.shipping_address1
    company.shipping_address2 = req.shipping_address2
    company.shipping_city = req.shipping_city
    company.shipping_state = req.shipping_state
    company.shipping_zipcode = req.shipping_zipcode
    
    db.commit()
    db.refresh(company)
    return company

@router.post("/{company_id}/toggle-status")
def toggle_company_status(company_id: int, db: Session = Depends(get_db)):
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")

    company.is_active = not company.is_active
    db.commit()
    return {"message": f"Company {'activated' if company.is_active else 'deactivated'} successfully", "is_active": company.is_active}

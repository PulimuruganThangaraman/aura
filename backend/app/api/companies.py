import random
import string
import secrets
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Company, User, AuditLog, Notification
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

    # Automatically create a Company Admin user when a new company is created
    if req.contact_email:
        admin_email = req.contact_email
        existing_user = db.query(User).filter(User.email == admin_email).first()
        if not existing_user:
            first = req.contact_name.split()[0] if req.contact_name else "Admin"
            last = req.contact_name.split()[-1] if req.contact_name and len(req.contact_name.split()) > 1 else "User"
            token = f"actv_{secrets.token_urlsafe(24)}"
            company_admin = User(
                email=admin_email,
                hashed_password=get_password_hash("123456"),
                first_name=first,
                last_name=last,
                phone=req.phone_number,
                role="Company Admin",
                is_active=True,
                account_status="Invited",
                invitation_token=token,
                invitation_sent_at=datetime.utcnow(),
                company_id=company.id
            )
            db.add(company_admin)
            db.commit()

    db.add(AuditLog(
        company_id=company.id,
        action="COMPANY_CREATED",
        target_type="Company",
        target_id=str(company.id),
        details=f"Tenant company '{company.name}' ({company.code}) registered."
    ))
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

@router.get("/overview/stats")
def get_companies_with_stats(db: Session = Depends(get_db)):
    """Returns all companies along with their Company Admin details, professional count, job count, and task count."""
    companies = db.query(Company).order_by(Company.name.asc()).all()
    out = []
    for c in companies:
        admin_user = db.query(User).filter(User.company_id == c.id, User.role == "Company Admin").first()
        from app.models import Professional, Job, Task
        profs_count = db.query(Professional).filter(Professional.company_id == c.id).count()
        jobs_count = db.query(Job).filter(Job.company_id == c.id).count()
        tasks_count = db.query(Task).join(Job).filter(Job.company_id == c.id).count()
        
        out.append({
            "id": c.id,
            "name": c.name,
            "code": c.code,
            "industry_type": c.industry_type,
            "contact_name": c.contact_name,
            "contact_email": c.contact_email,
            "phone_number": c.phone_number,
            "website": c.website,
            "admin_name": f"{admin_user.first_name} {admin_user.last_name}" if admin_user else (c.contact_name or "Unassigned"),
            "admin_email": admin_user.email if admin_user else (c.contact_email or "N/A"),
            "admin_phone": admin_user.phone if admin_user else (c.phone_number or "N/A"),
            "admin_id": admin_user.id if admin_user else None,
            "admin_account_status": getattr(admin_user, 'account_status', 'Active') if admin_user else "Unassigned",
            "invitation_token": getattr(admin_user, 'invitation_token', None) if admin_user else None,
            "professionals_count": profs_count,
            "jobs_count": jobs_count,
            "tasks_count": tasks_count,
            "is_active": c.is_active,
            "created_at": c.created_at
        })
    return out

@router.get("/{company_id}/admin")
def get_company_admin(company_id: int, db: Session = Depends(get_db)):
    admin = db.query(User).filter(User.company_id == company_id, User.role == "Company Admin").first()
    if not admin:
        return {"admin": None}
    return {
        "admin": {
            "id": admin.id,
            "first_name": admin.first_name,
            "last_name": admin.last_name,
            "email": admin.email,
            "phone": admin.phone,
            "role": admin.role,
            "account_status": admin.account_status,
            "invitation_token": admin.invitation_token,
            "is_active": admin.is_active
        }
    }

@router.post("/{company_id}/admin")
def create_or_update_company_admin(company_id: int, req: dict, db: Session = Depends(get_db)):
    """
    Allows Super Admin to create or invite the Company Admin for a specific company.
    Supports secure activation link generation and email dispatch.
    """
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")

    email = req.get("email")
    if not email:
        raise HTTPException(status_code=400, detail="Email is required for Company Admin")

    existing_admin = db.query(User).filter(User.company_id == company_id, User.role == "Company Admin").first()
    
    first_name = req.get("first_name", "Admin")
    last_name = req.get("last_name", "Manager")
    phone = req.get("phone", company.phone_number)
    password = req.get("password")
    
    token = f"actv_{secrets.token_urlsafe(24)}"
    activation_link = f"http://localhost:5173/activate?token={token}"

    if existing_admin:
        # Update existing
        existing_admin.first_name = first_name
        existing_admin.last_name = last_name
        existing_admin.phone = phone
        existing_admin.email = email
        if password and len(password) >= 6:
            existing_admin.hashed_password = get_password_hash(password)
            existing_admin.account_status = "Active"
            existing_admin.invitation_token = None
        else:
            existing_admin.invitation_token = token
            existing_admin.invitation_sent_at = datetime.utcnow()
            existing_admin.account_status = "Invited"

        db.add(AuditLog(
            company_id=company_id,
            action="UPDATE_COMPANY_ADMIN",
            target_type="User",
            target_id=str(existing_admin.id),
            details=f"Company Admin updated for {company.name} ({email})"
        ))
        db.commit()
        db.refresh(existing_admin)
        return {
            "message": "Company Admin updated successfully",
            "admin_id": existing_admin.id,
            "account_status": existing_admin.account_status,
            "invitation_token": existing_admin.invitation_token,
            "activation_link": activation_link if existing_admin.invitation_token else None
        }
    else:
        # Check if email taken by another user
        taken = db.query(User).filter(User.email == email).first()
        if taken:
            taken.company_id = company_id
            taken.role = "Company Admin"
            taken.first_name = first_name
            taken.last_name = last_name
            taken.phone = phone
            if password and len(password) >= 6:
                taken.hashed_password = get_password_hash(password)
                taken.account_status = "Active"
            else:
                taken.invitation_token = token
                taken.invitation_sent_at = datetime.utcnow()
                taken.account_status = "Invited"

            db.add(AuditLog(
                company_id=company_id,
                action="ASSIGN_COMPANY_ADMIN",
                target_type="User",
                target_id=str(taken.id),
                details=f"User {email} assigned as Company Admin for {company.name}"
            ))
            db.commit()
            return {
                "message": "User assigned as Company Admin successfully",
                "admin_id": taken.id,
                "account_status": taken.account_status,
                "invitation_token": taken.invitation_token,
                "activation_link": activation_link if taken.invitation_token else None
            }
        else:
            new_admin = User(
                email=email,
                hashed_password=get_password_hash(password or "123456"),
                first_name=first_name,
                last_name=last_name,
                phone=phone,
                role="Company Admin",
                company_id=company_id,
                is_active=True,
                account_status="Active" if password and len(password) >= 6 else "Invited",
                invitation_token=None if password and len(password) >= 6 else token,
                invitation_sent_at=datetime.utcnow()
            )
            db.add(new_admin)
            db.commit()
            db.refresh(new_admin)

            db.add(AuditLog(
                company_id=company_id,
                action="CREATE_COMPANY_ADMIN",
                target_type="User",
                target_id=str(new_admin.id),
                details=f"New Company Admin {email} invited for {company.name}"
            ))
            db.commit()

            return {
                "message": "Company Admin invited successfully",
                "admin_id": new_admin.id,
                "account_status": new_admin.account_status,
                "invitation_token": new_admin.invitation_token,
                "activation_link": activation_link if new_admin.invitation_token else None
            }

@router.post("/{company_id}/toggle-status")
def toggle_company_status(company_id: int, db: Session = Depends(get_db)):
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")

    company.is_active = not company.is_active
    db.commit()
    return {"message": f"Company {'activated' if company.is_active else 'deactivated'} successfully", "is_active": company.is_active}


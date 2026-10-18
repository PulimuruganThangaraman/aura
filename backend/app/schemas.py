from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

# Token Schemas
class Token(BaseModel):
    access_token: str
    token_type: str
    user: dict

class TokenData(BaseModel):
    user_id: Optional[str] = None
    role: Optional[str] = None
    company_id: Optional[int] = None

# User Schemas
class LoginRequest(BaseModel):
    email: str
    password: str

class ForgotPasswordRequest(BaseModel):
    email: str

class ResetPasswordRequest(BaseModel):
    current_password: str
    new_password: str
    confirm_password: str

class ProfileUpdateRequest(BaseModel):
    first_name: str
    last_name: str
    phone: str

class UserCreate(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    phone: Optional[str] = None
    role: str # Company Admin, Client Admin, Location Manager, Supervisor
    password: Optional[str] = "123456"
    company_id: Optional[int] = None

class UserOut(BaseModel):
    id: int
    first_name: str
    last_name: str
    email: str
    phone: Optional[str] = None
    role: str
    is_active: bool
    company_id: Optional[int] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

# Company Schemas
class CompanyCreate(BaseModel):
    name: str
    company_code: Optional[str] = None
    industry_type: Optional[str] = None
    contact_name: Optional[str] = None
    contact_email: Optional[str] = None
    phone_number: Optional[str] = None
    website: Optional[str] = None
    
    billing_address1: Optional[str] = None
    billing_address2: Optional[str] = None
    billing_city: Optional[str] = None
    billing_state: Optional[str] = None
    billing_zipcode: Optional[str] = None
    
    shipping_address1: Optional[str] = None
    shipping_address2: Optional[str] = None
    shipping_city: Optional[str] = None
    shipping_state: Optional[str] = None
    shipping_zipcode: Optional[str] = None

class CompanyOut(BaseModel):
    id: int
    name: str
    code: str
    industry_type: Optional[str] = None
    contact_name: Optional[str] = None
    contact_email: Optional[str] = None
    phone_number: Optional[str] = None
    website: Optional[str] = None
    
    billing_address1: Optional[str] = None
    billing_address2: Optional[str] = None
    billing_city: Optional[str] = None
    billing_state: Optional[str] = None
    billing_zipcode: Optional[str] = None
    
    shipping_address1: Optional[str] = None
    shipping_address2: Optional[str] = None
    shipping_city: Optional[str] = None
    shipping_state: Optional[str] = None
    shipping_zipcode: Optional[str] = None
    
    company_logo: Optional[str] = None
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

# Professional Schemas
class ProfessionalCreate(BaseModel):
    employee_id: Optional[str] = None
    first_name: str
    last_name: str
    email: EmailStr
    phone_number: Optional[str] = None
    job_title: Optional[str] = "Care Specialist"
    gender: Optional[str] = None
    department_id: Optional[int] = None
    skills: Optional[str] = None
    company_id: Optional[int] = None
    account_status: Optional[str] = "Active"

class ProfessionalOut(BaseModel):
    id: int
    employee_id: Optional[str] = None
    first_name: str
    last_name: str
    email: str
    phone_number: Optional[str] = None
    job_title: Optional[str] = None
    gender: Optional[str] = None
    department_id: Optional[int] = None
    skills: Optional[str] = None
    status: str
    account_status: Optional[str] = "Active"
    invitation_token: Optional[str] = None
    company_id: int
    is_active: bool
    modified_by: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

# Department Schemas
class DepartmentCreate(BaseModel):
    name: str
    description: Optional[str] = None
    parent_id: Optional[int] = None

class DepartmentOut(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    parent_id: Optional[int] = None
    company_id: int
    is_active: bool
    modified_by: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

# Location Schemas
class LocationCreate(BaseModel):
    name: str
    description: Optional[str] = None
    contact_person: Optional[str] = None
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    zip_code: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class LocationOut(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    contact_person: Optional[str] = None
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    zip_code: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    company_id: int
    is_active: bool
    modified_by: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

# WorkLocation Schemas
class WorkLocationCreate(BaseModel):
    location_id: int
    name: str
    description: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class WorkLocationOut(BaseModel):
    id: int
    location_id: int
    location_name: Optional[str] = None
    name: str
    description: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    qr_code_data: Optional[str] = None
    is_active: bool
    modified_by: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

# Shift Schemas
class ShiftCreate(BaseModel):
    name: str
    start_time: str
    end_time: str
    break_minutes: Optional[int] = 30
    grace_minutes: Optional[int] = 15

class ShiftOut(BaseModel):
    id: int
    name: str
    start_time: str
    end_time: str
    break_minutes: int
    grace_minutes: int
    company_id: int
    is_active: bool
    modified_by: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

# TaskTemplate Schemas
class TaskTemplateItemCreate(BaseModel):
    category_name: str
    task_name: str
    description: Optional[str] = None
    estimated_minutes: Optional[int] = 30
    priority: Optional[str] = "Normal"

class TaskTemplateCreate(BaseModel):
    name: str
    description: Optional[str] = None
    department_id: Optional[int] = None
    default_start_time: Optional[str] = "09:00"
    default_end_time: Optional[str] = "11:00"
    items: List[TaskTemplateItemCreate] = []

class TaskTemplateOut(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    department_id: Optional[int] = None
    department_name: Optional[str] = None
    default_start_time: Optional[str] = "09:00"
    default_end_time: Optional[str] = "11:00"
    task_count: Optional[int] = 0
    company_id: int
    is_active: bool
    modified_by: Optional[str] = None
    created_at: datetime
    items: List[dict] = []
    
    class Config:
        from_attributes = True

# First-Class Job & Task Schemas
class TaskEvidenceCreate(BaseModel):
    file_name: str
    file_type: str # image/jpeg, image/png, application/pdf, checklist, notes
    file_data: Optional[str] = None
    notes: Optional[str] = None

class TaskEvidenceOut(BaseModel):
    id: int
    schedule_id: int
    task_detail_id: int
    uploaded_by: str
    file_name: str
    file_type: str
    file_data: Optional[str] = None
    notes: Optional[str] = None
    submission_version: int
    review_status: str
    review_comments: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

class TaskReviewRequest(BaseModel):
    decision: str # "Approve" or "Reject" / "Rework"
    comments: Optional[str] = None
    reviewer_name: Optional[str] = "Company Admin"

class TaskSubmitRequest(BaseModel):
    notes: Optional[str] = None
    file_name: Optional[str] = None
    file_type: Optional[str] = "photo"
    file_data: Optional[str] = None
    checklist_data: Optional[str] = None
    submitted_by: Optional[str] = None

class TaskCreate(BaseModel):
    task_name: str
    category_name: Optional[str] = "General"
    description: Optional[str] = None
    estimated_minutes: Optional[int] = 30
    priority: Optional[str] = "Normal"
    assigned_professional_name: Optional[str] = None
    assigned_professionals: Optional[List[str]] = []
    work_location_name: Optional[str] = None
    evidence_required: Optional[bool] = False
    evidence_type: Optional[str] = "photo"

class TaskOut(BaseModel):
    id: int
    task_id: str
    schedule_id: int
    category_name: str
    task_name: str
    description: Optional[str] = None
    work_location_name: Optional[str] = None
    shift_name: Optional[str] = None
    estimated_minutes: int
    priority: str
    status: str
    is_recursive: bool
    assigned_professional_id: Optional[int] = None
    assigned_professional_name: Optional[str] = None
    assigned_professionals: List[str] = []
    evidence_required: bool = False
    evidence_type: Optional[str] = "photo"
    submitted_at: Optional[datetime] = None
    reviewed_at: Optional[datetime] = None
    reviewed_by: Optional[str] = None
    rejection_reason: Optional[str] = None
    checklist_data: Optional[str] = None
    completed_at: Optional[datetime] = None
    notes: Optional[str] = None
    evidences: List[TaskEvidenceOut] = []

    class Config:
        from_attributes = True

class JobCreate(BaseModel):
    title: Optional[str] = None
    template_id: Optional[int] = None
    location_id: int
    work_location_name: Optional[str] = None
    work_location_id: Optional[int] = None
    scheduled_date: str # "YYYY-MM-DD"
    start_time: str # "09:00"
    end_time: str # "11:00"
    assigned_professional_id: Optional[int] = None
    assigned_professionals: List[str] = []
    is_recursive: Optional[bool] = False
    tasks: Optional[List[TaskCreate]] = []

class JobOut(BaseModel):
    id: int
    job_id: str
    title: str
    location_id: int
    location_name: Optional[str] = None
    work_location_name: Optional[str] = None
    company_id: int
    company_name: Optional[str] = None
    scheduled_date: str
    start_time: str
    end_time: str
    status: str
    assigned_professional_name: Optional[str] = None
    assigned_professionals: List[str] = []
    tasks_count: int = 0
    tasks: List[TaskOut] = []
    created_at: datetime

# Company Admin & Super Admin Schemas
class CompanyAdminCreate(BaseModel):
    email: EmailStr
    first_name: str
    last_name: str
    phone: Optional[str] = None
    password: Optional[str] = "123456"

class CompanyStatsOut(BaseModel):
    id: int
    name: str
    code: str
    industry_type: Optional[str] = None
    contact_name: Optional[str] = None
    contact_email: Optional[str] = None
    phone_number: Optional[str] = None
    admin_name: Optional[str] = None
    admin_email: Optional[str] = None
    professionals_count: int
    jobs_count: int
    tasks_count: int
    is_active: bool

# Backward Compatible Schemas
class TaskScheduleCreate(BaseModel):
    template_id: Optional[int] = None
    title: Optional[str] = None
    location_id: int
    assigned_professionals: List[str] = []
    is_recursive: Optional[bool] = False
    exclude_holidays: Optional[bool] = False
    scheduled_date: Optional[str] = None
    shift_name: Optional[str] = None
    start_time: Optional[str] = "09:00"
    end_time: Optional[str] = "11:00"
    work_location_id: Optional[int] = None
    work_location_name: Optional[str] = None
    tasks: Optional[List[TaskCreate]] = []

class RescheduleTaskRequest(BaseModel):
    detail_id: int
    work_location_id: Optional[int] = None
    shift_name: Optional[str] = None
    date: Optional[str] = None
    assigned_professionals: List[str] = []
    notes: Optional[str] = None

class AccountActivationRequest(BaseModel):
    token: str
    password: str

class ResendInvitationRequest(BaseModel):
    email: str

class AuditLogOut(BaseModel):
    id: int
    company_id: Optional[int] = None
    user_id: Optional[int] = None
    user_email: Optional[str] = None
    user_role: Optional[str] = None
    action: str
    target_type: str
    target_id: Optional[str] = None
    details: Optional[str] = None
    timestamp: datetime
    
    class Config:
        from_attributes = True


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
    first_name: str
    last_name: str
    email: EmailStr
    phone_number: Optional[str] = None
    skills: Optional[str] = None
    company_id: Optional[int] = None

class ProfessionalOut(BaseModel):
    id: int
    first_name: str
    last_name: str
    email: str
    phone_number: Optional[str] = None
    skills: Optional[str] = None
    status: str
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
    items: List[TaskTemplateItemCreate] = []

class TaskTemplateOut(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    department_id: Optional[int] = None
    department_name: Optional[str] = None
    task_count: Optional[int] = 0
    company_id: int
    is_active: bool
    modified_by: Optional[str] = None
    created_at: datetime
    items: List[dict] = []
    
    class Config:
        from_attributes = True

# Task Schedule Schemas
class TaskScheduleCreate(BaseModel):
    template_id: int
    location_id: int
    assigned_professionals: List[str] = []
    is_recursive: Optional[bool] = False
    exclude_holidays: Optional[bool] = False

class RescheduleTaskRequest(BaseModel):
    detail_id: int
    work_location_id: Optional[int] = None
    shift_name: Optional[str] = None
    date: Optional[str] = None
    assigned_professionals: List[str] = []
    notes: Optional[str] = None

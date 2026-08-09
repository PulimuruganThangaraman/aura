from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text, Float
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    phone = Column(String, nullable=True)
    role = Column(String, nullable=False, default="Company Admin") # Super Admin, Company Admin, Client Admin, Location Manager, Supervisor, Professional
    is_active = Column(Boolean, default=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=True)
    parent_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    company = relationship("Company", back_populates="users")

class Company(Base):
    __tablename__ = "companies"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    code = Column(String, unique=True, index=True, nullable=False)
    industry_type = Column(String, nullable=True)
    contact_name = Column(String, nullable=True)
    contact_email = Column(String, nullable=True)
    phone_number = Column(String, nullable=True)
    website = Column(String, nullable=True)
    
    billing_address1 = Column(String, nullable=True)
    billing_address2 = Column(String, nullable=True)
    billing_city = Column(String, nullable=True)
    billing_state = Column(String, nullable=True)
    billing_zipcode = Column(String, nullable=True)
    
    shipping_address1 = Column(String, nullable=True)
    shipping_address2 = Column(String, nullable=True)
    shipping_city = Column(String, nullable=True)
    shipping_state = Column(String, nullable=True)
    shipping_zipcode = Column(String, nullable=True)
    
    company_logo = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    users = relationship("User", back_populates="company")
    professionals = relationship("Professional", back_populates="company")
    departments = relationship("Department", back_populates="company")
    locations = relationship("Location", back_populates="company")

class Professional(Base):
    __tablename__ = "professionals"
    
    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    email = Column(String, index=True, nullable=False)
    phone_number = Column(String, nullable=True)
    skills = Column(String, nullable=True) # Comma-separated or JSON e.g. "Security, Cleaning"
    status = Column(String, default="Accepted") # Pending, Accepted, Rejected
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    is_active = Column(Boolean, default=True)
    modified_by = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    company = relationship("Company", back_populates="professionals")

class Department(Base):
    __tablename__ = "departments"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    parent_id = Column(Integer, ForeignKey("departments.id"), nullable=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    is_active = Column(Boolean, default=True)
    modified_by = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    company = relationship("Company", back_populates="departments")

class Location(Base):
    __tablename__ = "locations"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    contact_person = Column(String, nullable=True)
    contact_email = Column(String, nullable=True)
    contact_phone = Column(String, nullable=True)
    city = Column(String, nullable=True)
    state = Column(String, nullable=True)
    zip_code = Column(String, nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    is_active = Column(Boolean, default=True)
    modified_by = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    company = relationship("Company", back_populates="locations")
    work_locations = relationship("WorkLocation", back_populates="location", cascade="all, delete-orphan")

class WorkLocation(Base):
    __tablename__ = "work_locations"
    
    id = Column(Integer, primary_key=True, index=True)
    location_id = Column(Integer, ForeignKey("locations.id"), nullable=False)
    name = Column(String, nullable=False) # e.g. "First Floor Restroom"
    description = Column(Text, nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    qr_code_data = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)
    modified_by = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    location = relationship("Location", back_populates="work_locations")

class Shift(Base):
    __tablename__ = "shifts"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False) # Morning Shift, Noon Shift, Evening Shift
    start_time = Column(String, nullable=False) # "09:00"
    end_time = Column(String, nullable=False) # "17:00"
    break_minutes = Column(Integer, default=30)
    grace_minutes = Column(Integer, default=15)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    is_active = Column(Boolean, default=True)
    modified_by = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class TaskCategory(Base):
    __tablename__ = "task_categories"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class TaskTemplate(Base):
    __tablename__ = "task_templates"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    is_active = Column(Boolean, default=True)
    modified_by = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    items = relationship("TaskTemplateItem", back_populates="template", cascade="all, delete-orphan")

class TaskTemplateItem(Base):
    __tablename__ = "task_template_items"
    
    id = Column(Integer, primary_key=True, index=True)
    template_id = Column(Integer, ForeignKey("task_templates.id"), nullable=False)
    category_name = Column(String, nullable=False)
    task_name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    estimated_minutes = Column(Integer, default=30)
    priority = Column(String, default="Normal")
    
    template = relationship("TaskTemplate", back_populates="items")

class TaskSchedule(Base):
    __tablename__ = "task_schedules"
    
    id = Column(Integer, primary_key=True, index=True)
    template_id = Column(Integer, ForeignKey("task_templates.id"), nullable=False)
    location_id = Column(Integer, ForeignKey("locations.id"), nullable=False)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    assigned_professionals_json = Column(Text, nullable=True) # JSON list of names/ids
    is_recursive = Column(Boolean, default=False)
    exclude_holidays = Column(Boolean, default=False)
    scheduled_date = Column(String, nullable=True)
    status = Column(String, default="Scheduled") # Scheduled, In Progress, Completed
    modified_by = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    details = relationship("TaskScheduleDetail", back_populates="schedule", cascade="all, delete-orphan")

class TaskScheduleDetail(Base):
    __tablename__ = "task_schedule_details"
    
    id = Column(Integer, primary_key=True, index=True)
    schedule_id = Column(Integer, ForeignKey("task_schedules.id"), nullable=False)
    category_name = Column(String, nullable=False)
    task_name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    work_location_name = Column(String, nullable=True)
    shift_name = Column(String, nullable=True)
    is_recursive = Column(Boolean, default=False)
    assigned_professionals_json = Column(Text, nullable=True)
    status = Column(String, default="YetToStart") # YetToStart, InProgress, Ended
    
    schedule = relationship("TaskSchedule", back_populates="details")

class Notification(Base):
    __tablename__ = "notifications"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    title = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    type = Column(String, default="info") # info, warning, success
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class AuditLog(Base):
    __tablename__ = "audit_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=True)
    user_email = Column(String, nullable=True)
    action = Column(String, nullable=False)
    target_type = Column(String, nullable=False)
    target_id = Column(String, nullable=True)
    details = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)

class IssueReport(Base):
    __tablename__ = "issue_reports"
    
    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    location_id = Column(Integer, nullable=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    priority = Column(String, default="Medium") # Low, Medium, High, Critical
    status = Column(String, default="Open") # Open, In Progress, Resolved
    created_at = Column(DateTime, default=datetime.utcnow)

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
    account_status = Column(String, default="Active") # Invited, Active, Suspended
    invitation_token = Column(String, unique=True, index=True, nullable=True)
    invitation_sent_at = Column(DateTime, nullable=True)
    job_title = Column(String, nullable=True)
    gender = Column(String, nullable=True)
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=True)
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
    jobs = relationship("TaskSchedule", back_populates="company")

class Professional(Base):
    __tablename__ = "professionals"
    
    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(String, unique=True, index=True, nullable=True) # e.g. "EMP-1001"
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    email = Column(String, index=True, nullable=False)
    phone_number = Column(String, nullable=True)
    job_title = Column(String, nullable=True) # e.g. "Cleaner", "Care Specialist"
    gender = Column(String, nullable=True)
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=True)
    skills = Column(String, nullable=True) # Comma-separated or JSON e.g. "Security, Cleaning"
    status = Column(String, default="Accepted") # Pending, Accepted, Rejected
    account_status = Column(String, default="Active") # Invited, Active, Suspended
    invitation_token = Column(String, nullable=True)
    invitation_sent_at = Column(DateTime, nullable=True)
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
    default_start_time = Column(String, default="09:00")
    default_end_time = Column(String, default="11:00")
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    is_active = Column(Boolean, default=True)
    modified_by = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    items = relationship("TaskTemplateItem", back_populates="template", cascade="all, delete-orphan")

    @property
    def tasks(self):
        return self.items

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
    job_id = Column(String, index=True, nullable=True) # Formatted ID e.g. "JOB-1001"
    title = Column(String, nullable=True) # Job title / Service description
    template_id = Column(Integer, ForeignKey("task_templates.id"), nullable=True)
    location_id = Column(Integer, ForeignKey("locations.id"), nullable=False)
    work_location_name = Column(String, nullable=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    assigned_professional_id = Column(Integer, ForeignKey("professionals.id"), nullable=True)
    assigned_professional_name = Column(String, nullable=True)
    assigned_professionals_json = Column(Text, nullable=True) # JSON list of names/ids
    scheduled_date = Column(String, nullable=True)
    start_time = Column(String, default="09:00") # Custom start time e.g. "09:00"
    end_time = Column(String, default="11:00") # Custom end time e.g. "11:00"
    shift_name = Column(String, nullable=True)
    is_recursive = Column(Boolean, default=False)
    exclude_holidays = Column(Boolean, default=False)
    status = Column(String, default="Scheduled") # Draft, Scheduled, InProgress, Completed, Cancelled
    modified_by = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    details = relationship("TaskScheduleDetail", back_populates="schedule", cascade="all, delete-orphan")
    company = relationship("Company", back_populates="jobs")

    @property
    def tasks(self):
        return self.details

class TaskScheduleDetail(Base):
    __tablename__ = "task_schedule_details"
    
    id = Column(Integer, primary_key=True, index=True)
    task_id = Column(String, index=True, nullable=True) # Formatted ID e.g. "TSK-2001"
    schedule_id = Column(Integer, ForeignKey("task_schedules.id"), nullable=False)
    category_name = Column(String, nullable=False)
    task_name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    work_location_name = Column(String, nullable=True)
    shift_name = Column(String, nullable=True)
    estimated_minutes = Column(Integer, default=30)
    priority = Column(String, default="Normal") # Normal, High, Critical
    is_recursive = Column(Boolean, default=False)
    assigned_professional_id = Column(Integer, ForeignKey("professionals.id"), nullable=True)
    assigned_professional_name = Column(String, nullable=True)
    assigned_professionals_json = Column(Text, nullable=True)
    evidence_required = Column(Boolean, default=False)
    evidence_type = Column(String, default="photo") # photo, document, checklist, notes
    status = Column(String, default="YetToStart") # YetToStart, InProgress, SubmittedForReview, ReworkRequired, Completed, Cancelled
    completed_at = Column(DateTime, nullable=True)
    submitted_at = Column(DateTime, nullable=True)
    reviewed_at = Column(DateTime, nullable=True)
    reviewed_by = Column(String, nullable=True)
    rejection_reason = Column(Text, nullable=True)
    checklist_data = Column(Text, nullable=True) # JSON checklist answers
    notes = Column(Text, nullable=True)
    
    schedule = relationship("TaskSchedule", back_populates="details")
    evidences = relationship("TaskEvidence", back_populates="task", cascade="all, delete-orphan")

    @property
    def job(self):
        return self.schedule

class TaskEvidence(Base):
    __tablename__ = "task_evidences"
    
    id = Column(Integer, primary_key=True, index=True)
    schedule_id = Column(Integer, ForeignKey("task_schedules.id"), nullable=False)
    task_detail_id = Column(Integer, ForeignKey("task_schedule_details.id"), nullable=False)
    uploaded_by = Column(String, nullable=False)
    file_name = Column(String, nullable=False)
    file_type = Column(String, nullable=False) # image/jpeg, image/png, application/pdf, checklist, notes
    file_data = Column(Text, nullable=True)
    notes = Column(Text, nullable=True)
    submission_version = Column(Integer, default=1)
    review_status = Column(String, default="Pending") # Pending, Approved, Rejected
    review_comments = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    task = relationship("TaskScheduleDetail", back_populates="evidences")

# Domain Model Aliases for First-Class Job & Task Architecture
Job = TaskSchedule
Task = TaskScheduleDetail
JobTemplate = TaskTemplate
JobTemplateItem = TaskTemplateItem

class Notification(Base):
    __tablename__ = "notifications"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=True)
    title = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    type = Column(String, default="info") # info, warning, success, task_review, task_assigned
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class AuditLog(Base):
    __tablename__ = "audit_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=True)
    user_id = Column(Integer, nullable=True)
    user_email = Column(String, nullable=True)
    user_role = Column(String, nullable=True)
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

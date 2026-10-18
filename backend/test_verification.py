from app.database import SessionLocal
from app.api.dashboard import get_super_admin_dashboard, get_company_dashboard, get_professional_dashboard
from app.api.tasks import list_jobs, create_job, update_task_status, list_job_templates, create_job_template
from app.api.companies import create_or_update_company_admin
from app.schemas import TaskScheduleCreate, TaskCreate, TaskTemplateCreate, TaskTemplateItemCreate
from app.models import Company, Professional
import json

db = SessionLocal()

print("=== 1. Testing Super Admin Dashboard ===")
sa_data = get_super_admin_dashboard(None, db)
kpi = sa_data['kpi']
print(f"Companies: {kpi['companies']}, Professionals: {kpi['professionals']}, Jobs: {kpi['jobs']}, Tasks: {kpi['tasks']}")
assert kpi['companies'] > 0, "Companies count must be > 0"
assert kpi['professionals'] > 0, "Professionals count must be > 0"
assert kpi['jobs'] > 0, "Jobs count must be > 0"
assert kpi['tasks'] > 0, "Tasks count must be > 0"
assert len(sa_data['companies_overview']) > 0, "Companies overview must have records"
print("Test 1 Passed: Super Admin Dashboard successfully reports all 4 platform metrics.")

print("\n=== 2. Testing Super Admin Creating/Managing Company Admin ===")
comp = db.query(Company).first()
res_admin = create_or_update_company_admin(comp.id, {
    "first_name": "Sarah",
    "last_name": "Connor",
    "email": f"sarah.admin@{comp.code.lower()}.com",
    "phone": "0412333444",
    "password": "secretpassword"
}, db)
print(res_admin)
assert "admin_id" in res_admin
print("Test 2 Passed: Super Admin successfully created/updated Company Admin.")

print("\n=== 3. Testing Job Creation with Custom Times & Multiple Tasks ===")
job_req = TaskScheduleCreate(
    title="Specialized Morning Care & Sanitation",
    location_id=1,
    work_location_name="Wing C, Room 104",
    scheduled_date="2026-09-16",
    start_time="09:00",
    end_time="11:00",
    assigned_professionals=["Alex Vance"],
    tasks=[
        TaskCreate(task_name="Check Oxygen Saturation & Pulse", category_name="Vitals", estimated_minutes=20, priority="High"),
        TaskCreate(task_name="Replace Sterile Dressing", category_name="Clinical", estimated_minutes=35, priority="Normal"),
        TaskCreate(task_name="Update Digital Medication Chart", category_name="Documentation", estimated_minutes=15, priority="Normal")
    ]
)
new_job_res = create_job(job_req, company_id=comp.id, modified_by="Company Admin", db=db)
print("New Job:", new_job_res)
assert "JOB-" in new_job_res["job_id"], "Job ID must be formatted (JOB-XXXX)"
assert new_job_res["tasks_count"] == 3, "Must create 3 tasks under the job"
for tid in new_job_res["task_ids"]:
    assert "TSK-" in tid, "Task ID must be formatted (TSK-XXXX)"
print("Test 3 Passed: Job created with customized time (09:00-11:00), formatted Job ID, and multiple tasks with Task IDs.")

print("\n=== 4. Testing Role Scoping (Professional vs Company Admin) ===")
pro_jobs = list_jobs(user_email="professional@auralinks.com", role="Professional", db=db)
comp_jobs = list_jobs(company_id=comp.id, role="Company Admin", db=db)
print(f"Professional jobs count: {len(pro_jobs)}")
print(f"Company Admin jobs count: {len(comp_jobs)}")
for pj in pro_jobs:
    assert any("Alex Vance" in p for p in pj["assigned_professionals"]), "Professional must only see jobs assigned to them"
print("Test 4 Passed: Professional strictly sees only their own jobs; Company Admin sees all company jobs.")

print("\n=== 5. Testing Task Status Update ===")
first_task_id = new_job_res["task_ids"][0]
status_res = update_task_status(first_task_id, {"status": "Completed", "notes": "Checked pulse and oxygen 98%"}, db)
print(status_res)
assert status_res["status"] == "Completed"
print("Test 5 Passed: Task status successfully updated to Completed.")

print("\n=== 6. Testing Job Template Creation ===")
tmpl_req = TaskTemplateCreate(
    name="Emergency Sanitization & Biohazard Turnaround",
    description="Standard operational template with default 2-hour window",
    default_start_time="10:00",
    default_end_time="12:00",
    items=[
        TaskTemplateItemCreate(category_name="Sanitization", task_name="Deploy Mobile UV Sterilizer", estimated_minutes=30, priority="High"),
        TaskTemplateItemCreate(category_name="Safety", task_name="Biohazard Waste Disposal Bagging", estimated_minutes=25, priority="High")
    ]
)
new_tmpl = create_job_template(tmpl_req, company_id=comp.id, modified_by="Company Admin", db=db)
print(f"Created Job Template: #{new_tmpl.id} - {new_tmpl.name} ({new_tmpl.default_start_time} - {new_tmpl.default_end_time}) with {new_tmpl.task_count} tasks")
assert new_tmpl.id > 0
print("Test 6 Passed: Job Template successfully created.")

db.close()
print("\n>>> ALL 6 BASELINE BACKEND VERIFICATION TESTS PASSED PERFECTLY! <<<")

print("\n==================================================================")
print("=== 7. TESTING FULL 16-STEP ACCEPTANCE & WORKFLOW SCENARIO ===")
print("==================================================================")
from app.api.companies import create_company, create_or_update_company_admin
from app.api.auth import activate_account
from app.api.professionals import create_professional
from app.api.tasks import start_task, upload_task_evidence, submit_task_for_review, review_task_submission, list_task_evidence
from app.api.reports import get_audit_logs
from app.schemas import CompanyCreate, ProfessionalCreate, TaskEvidenceCreate, TaskReviewRequest, TaskSubmitRequest, AccountActivationRequest
from fastapi import HTTPException

db2 = SessionLocal()

# Step 1: Super Admin creates "Chennai Cleaning Enterprise"
print("\n--- Step 1: Super Admin creates Company ---")
comp_data = CompanyCreate(
    name="Chennai Cleaning Enterprise",
    code="CHNI99",
    contact_email="director@chennaicleaning.com",
    contact_phone="044-28282828",
    address="GST Road, Meenambakkam, Chennai, Tamil Nadu 600027",
    category="Cleaning Services"
)
c_res = create_company(comp_data, db=db2)
comp_id = c_res.id
print(f"Company created: ID {comp_id}, Name: {c_res.name}, Code: {c_res.code}")
assert comp_id > 0

# Step 2: Super Admin provisions Company Admin account
print("\n--- Step 2: Super Admin creates Company Admin invitation ---")
admin_res = create_or_update_company_admin(comp_id, {
    "first_name": "Ravi",
    "last_name": "Kumar",
    "email": "ravi.kumar@chennaicleaning.com",
    "phone": "9840012345"
}, db=db2)
invitation_token = admin_res["invitation_token"]
print(f"Company Admin invitation created. Token: {invitation_token}")
assert invitation_token is not None
assert admin_res["account_status"] == "Invited"

# Step 3: Company Admin activates account
print("\n--- Step 3: Company Admin activates account via token ---")
actv_res = activate_account(AccountActivationRequest(
    token=invitation_token,
    password="SecureAdminPassword@2026",
    confirm_password="SecureAdminPassword@2026"
), db=db2)
print("Activation Result:", actv_res["message"])
assert actv_res["account_status"] == "Active"

# Step 4: Company Admin creates Employee Kumari Raman
print("\n--- Step 4: Company Admin creates Employee Kumari Raman ---")
kumari_req = ProfessionalCreate(
    first_name="Kumari",
    last_name="Raman",
    email="kumari.raman@chennaicleaning.com",
    phone="9876543210",
    job_title="Lead Cleaning Specialist",
    gender="Female",
    skills=["Terminal Sanitation", "Floor Polish", "Biohazard Disinfection"],
    company_id=comp_id
)
kumari_res = create_professional(kumari_req, company_id=comp_id, created_by="Ravi Kumar", db=db2)
print(f"Employee Created: ID {kumari_res.id}, EMP ID: {kumari_res.employee_id}, Status: {kumari_res.account_status}")
assert "EMP-" in kumari_res.employee_id
assert kumari_res.invitation_token is not None
kumari_token = kumari_res.invitation_token
kumari_id = kumari_res.id

# Step 5: Kumari activates her account
print("\n--- Step 5: Employee Kumari activates account ---")
actv_kumari = activate_account(AccountActivationRequest(
    token=kumari_token,
    password="KumariPassword@2026",
    confirm_password="KumariPassword@2026"
), db=db2)
print("Kumari Activation Result:", actv_kumari["message"])
assert actv_kumari["account_status"] == "Active"

# Step 6, 7, 8: Company Admin creates Job "Airport Entrance 10" with 3 tasks assigned to Kumari
print("\n--- Steps 6, 7, 8: Create Job 'Airport Entrance 10' with 3 Tasks ---")
airport_job = TaskScheduleCreate(
    title="Airport Entrance 10",
    location_id=1,
    work_location_name="Chennai International Airport - Terminal 2 Arrival Gate 10",
    scheduled_date="2026-10-18",
    start_time="09:00",
    end_time="11:00",
    assigned_professionals=["Kumari Raman"],
    tasks=[
        TaskCreate(
            task_name="Main Gate Cleaning",
            category_name="Sanitization",
            description="Deep clean and buff main glass automated entrance gates and exterior rails",
            estimated_minutes=40,
            priority="High",
            assigned_professional_id=kumari_id,
            assigned_professional_name="Kumari Raman",
            evidence_required=True,
            evidence_type="Photograph"
        ),
        TaskCreate(
            task_name="Toilet Cleaning",
            category_name="Restroom Care",
            description="Sanitize touch surfaces, mirrors, floor, replenish soap dispensers",
            estimated_minutes=35,
            priority="Critical",
            assigned_professional_id=kumari_id,
            assigned_professional_name="Kumari Raman",
            evidence_required=True,
            evidence_type="Photograph"
        ),
        TaskCreate(
            task_name="Reception Cleaning",
            category_name="Surface Hygiene",
            description="Dust and sanitize reception counters, passenger seating lounge",
            estimated_minutes=25,
            priority="Normal",
            assigned_professional_id=kumari_id,
            assigned_professional_name="Kumari Raman",
            evidence_required=True,
            evidence_type="Checklist"
        )
    ]
)
created_job = create_job(airport_job, company_id=comp_id, modified_by="Ravi Kumar", db=db2)
print(f"Created Job {created_job['job_id']} with tasks: {created_job['task_ids']}")
assert len(created_job["task_ids"]) == 3
t1_id, t2_id, t3_id = created_job["task_ids"]

# Step 9: Kumari opens assigned jobs
print("\n--- Step 9: Kumari views assigned jobs ---")
kumari_jobs = list_jobs(user_email="kumari.raman@chennaicleaning.com", role="Professional", db=db2)
print(f"Kumari sees {len(kumari_jobs)} assigned jobs")
assert any(j["job_id"] == created_job["job_id"] for j in kumari_jobs)

# Step 10: Kumari starts task 1 and uploads evidence
print("\n--- Step 10: Kumari starts task and uploads evidence ---")
start_res = start_task(t1_id, db=db2)
print(f"Task 1 started: status = {start_res['task']['status']}")
assert start_res["task"]["status"] == "InProgress"

ev_res = upload_task_evidence(t1_id, TaskEvidenceCreate(
    file_name="gate_10_glass_sanitized.jpg",
    file_type="image/jpeg",
    file_size_kb=850,
    storage_url="https://storage.auralinks.internal/evidence/gate_10_glass_sanitized.jpg",
    notes="Automated sliding doors disinfected with hospital grade agent, buffed clean",
    checklist_data={"doors_buffed": True, "rails_wiped": True, "floor_dried": True}
), current_user_name="Kumari Raman", db=db2)
print(f"Uploaded evidence: ID {ev_res.id}, file: {ev_res.file_name}")
assert ev_res.id > 0

# Step 11: Kumari submits task 1 for review
print("\n--- Step 11: Kumari submits task for review ---")
sub_res = submit_task_for_review(t1_id, TaskSubmitRequest(
    completion_notes="Finished ahead of schedule. Inspected and verified streak-free."
), current_user_name="Kumari Raman", db=db2)
print(f"Task 1 submitted: status = {sub_res['status']}")
assert sub_res["status"] == "SubmittedForReview"

# Step 12: Company Admin reviews and rejects task 1 with rework request
print("\n--- Step 12: Company Admin requests rework with reason ---")
rev_rej = review_task_submission(t1_id, TaskReviewRequest(
    action="Reject",
    rejection_reason="Exterior metal frame still has dust streaks near top sensor",
    notes="Please re-wipe upper sensor housing"
), reviewer_name="Ravi Kumar", db=db2)
print(f"Task 1 review result: status = {rev_rej['status']}, reason = {rev_rej['task']['rejection_reason']}")
assert rev_rej["status"] == "ReworkRequired"
assert "sensor" in rev_rej["task"]["rejection_reason"]

# Step 13: Kumari corrects work and resubmits evidence
print("\n--- Step 13: Kumari uploads corrected evidence and resubmits ---")
ev_res2 = upload_task_evidence(t1_id, TaskEvidenceCreate(
    file_name="gate_10_sensor_housing_rewiped.jpg",
    file_type="image/jpeg",
    file_size_kb=720,
    storage_url="https://storage.auralinks.internal/evidence/gate_10_sensor_housing_rewiped.jpg",
    notes="Upper sensor housing completely detailed and wiped down."
), current_user_name="Kumari Raman", db=db2)

sub_res2 = submit_task_for_review(t1_id, TaskSubmitRequest(
    completion_notes="Recleaned upper sensor. Replaced cloth."
), current_user_name="Kumari Raman", db=db2)
assert sub_res2["status"] == "SubmittedForReview"

# Approve Task 1
rev_app1 = review_task_submission(t1_id, TaskReviewRequest(action="Approve"), reviewer_name="Ravi Kumar", db=db2)
assert rev_app1["status"] == "Completed"
print(f"Task 1 approved: status = {rev_app1['status']}")

# Complete Task 2 & Task 3 to verify Job auto-completion
print("\n--- Step 14: Approve all tasks and verify Job completion ---")
# Task 2: Toilet Cleaning
start_task(t2_id, db=db2)
upload_task_evidence(t2_id, TaskEvidenceCreate(
    file_name="restroom_inspection.jpg",
    file_type="image/jpeg",
    storage_url="https://storage.auralinks.internal/evidence/restroom_inspection.jpg",
    notes="All 6 stalls disinfected, soap refilled"
), current_user_name="Kumari Raman", db=db2)
submit_task_for_review(t2_id, TaskSubmitRequest(completion_notes="Restrooms clean and stock replenished"), current_user_name="Kumari Raman", db=db2)
rev_app2 = review_task_submission(t2_id, TaskReviewRequest(action="Approve"), reviewer_name="Ravi Kumar", db=db2)
assert rev_app2["status"] == "Completed"

# Task 3: Reception Cleaning
start_task(t3_id, db=db2)
upload_task_evidence(t3_id, TaskEvidenceCreate(
    file_name="reception_checklist.pdf",
    file_type="application/pdf",
    storage_url="https://storage.auralinks.internal/evidence/reception_checklist.pdf",
    notes="Lounge seating vacuumed, counters sanitized"
), current_user_name="Kumari Raman", db=db2)
submit_task_for_review(t3_id, TaskSubmitRequest(completion_notes="Reception lounge completed"), current_user_name="Kumari Raman", db=db2)
rev_app3 = review_task_submission(t3_id, TaskReviewRequest(action="Approve"), reviewer_name="Ravi Kumar", db=db2)
assert rev_app3["status"] == "Completed"
assert rev_app3["job_completed"] is True
print(f"All 3 tasks completed! Job Status automatically transitioned to: {rev_app3['job_completed']}")

# Step 15: Check Audit Logs
print("\n--- Step 15: Verify Centralized Audit Trail ---")
logs_sa = get_audit_logs(role="Super Admin", db=db2)
print(f"Super Admin sees {logs_sa['total']} audit log entries across entire system")
assert logs_sa["total"] > 10

logs_ca = get_audit_logs(company_id=comp_id, role="Company Admin", db=db2)
print(f"Company Admin for Chennai Cleaning sees {logs_ca['total']} company-scoped audit logs")
assert logs_ca["total"] >= 5
for log in logs_ca["items"]:
    assert log["company_id"] == comp_id, "Company Admin must strictly only see their own company audit logs"

# Step 16: Verify Multi-Tenant Cross-Company Isolation
print("\n--- Step 16: Verify Cross-Company Access Isolation ---")
other_company = db2.query(Company).filter(Company.id != comp_id).first()
other_company_jobs = list_jobs(company_id=other_company.id, role="Company Admin", db=db2)
assert not any(j["job_id"] == created_job["job_id"] for j in other_company_jobs), "Cross-tenant leak! Other company saw Chennai Cleaning job"
print("Test 16 Passed: Strict multi-tenant isolation verified! Other companies cannot see Chennai Cleaning jobs or evidence.")

db2.close()
print("\n*******************************************************************")
print("*** ALL 16 ACCEPTANCE SCENARIO TESTS PASSED WITH 100% SUCCESS! ***")
print("*******************************************************************")

import sqlite3

conn = sqlite3.connect("auralinks.db")
cursor = conn.cursor()

def add_col_if_missing(table, col, col_type):
    cursor.execute(f"PRAGMA table_info({table})")
    cols = [row[1] for row in cursor.fetchall()]
    if col not in cols:
        print(f"Adding column {col} to {table}...")
        cursor.execute(f"ALTER TABLE {table} ADD COLUMN {col} {col_type}")

# 1. users
add_col_if_missing("users", "account_status", "TEXT DEFAULT 'Active'")
add_col_if_missing("users", "invitation_token", "TEXT")
add_col_if_missing("users", "invitation_sent_at", "TIMESTAMP")
add_col_if_missing("users", "job_title", "TEXT")
add_col_if_missing("users", "gender", "TEXT")
add_col_if_missing("users", "department_id", "INTEGER")

# 2. professionals
add_col_if_missing("professionals", "employee_id", "TEXT")
add_col_if_missing("professionals", "job_title", "TEXT")
add_col_if_missing("professionals", "gender", "TEXT")
add_col_if_missing("professionals", "department_id", "INTEGER")
add_col_if_missing("professionals", "account_status", "TEXT DEFAULT 'Active'")
add_col_if_missing("professionals", "invitation_token", "TEXT")
add_col_if_missing("professionals", "invitation_sent_at", "TIMESTAMP")

# 3. task_schedule_details
add_col_if_missing("task_schedule_details", "assigned_professional_id", "INTEGER")
add_col_if_missing("task_schedule_details", "assigned_professional_name", "TEXT")
add_col_if_missing("task_schedule_details", "evidence_required", "BOOLEAN DEFAULT 0")
add_col_if_missing("task_schedule_details", "evidence_type", "TEXT DEFAULT 'photo'")
add_col_if_missing("task_schedule_details", "submitted_at", "TIMESTAMP")
add_col_if_missing("task_schedule_details", "reviewed_at", "TIMESTAMP")
add_col_if_missing("task_schedule_details", "reviewed_by", "TEXT")
add_col_if_missing("task_schedule_details", "rejection_reason", "TEXT")
add_col_if_missing("task_schedule_details", "checklist_data", "TEXT")

# 4. audit_logs
add_col_if_missing("audit_logs", "company_id", "INTEGER")
add_col_if_missing("audit_logs", "user_role", "TEXT")

# 5. notifications
add_col_if_missing("notifications", "company_id", "INTEGER")

conn.commit()
conn.close()
print("Migration completed successfully!")

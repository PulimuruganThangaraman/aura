import json
from sqlalchemy.orm import Session
from app.models import (
    User, Company, Professional, Department, Location, WorkLocation, Shift,
    TaskCategory, TaskTemplate, TaskTemplateItem, TaskSchedule, TaskScheduleDetail, Notification
)
from app.core.security import get_password_hash

def seed_initial_data(db: Session):
    # Check if SuperAdmin exists
    super_admin = db.query(User).filter(User.email == "super.admin@auralinks.com").first()
    if super_admin:
        return # Data already seeded
    
    # 1. Create Companies
    c1 = Company(
        name="Cleaning Wizard Pty Ltd",
        code="P9SHD6",
        industry_type="Cleaning Services",
        contact_name="Don Ushan",
        contact_email="ushanlokuge@msn.com",
        phone_number="0435159335",
        website="www.cleaningwizard.com.au",
        billing_address1="57 Goulburn Street",
        billing_address2="Cranbourne East",
        billing_city="Cranbourne East",
        billing_state="VIC",
        billing_zipcode="3977",
        shipping_address1="57 Goulburn Street",
        shipping_address2="Cranbourne East",
        shipping_city="Cranbourne East",
        shipping_state="VIC",
        shipping_zipcode="3977",
        is_active=True
    )
    
    c2 = Company(
        name="Swift Way Victoria Dandenong South",
        code="2GQML0",
        industry_type="Security Service",
        contact_name="Demo Manager",
        contact_email="demo@swiftway.com",
        phone_number="09944453411",
        website="www.swiftway.com",
        billing_address1="1/42 Bajani kovil street",
        billing_address2="tamilnadu",
        billing_city="chennai56",
        billing_state="tamilnadu89",
        billing_zipcode="605301",
        is_active=True
    )

    c3 = Company(
        name="Spotlight Site Cranbourne",
        code="SPOT01",
        industry_type="Facility Management",
        contact_name="Nuwan",
        contact_email="nuwan@cleaningwizard.com.au",
        phone_number="435125",
        website="www.spotlight.com.au",
        billing_address1="Spotlight Plaza",
        billing_city="Cranbourne East",
        billing_state="VIC",
        billing_zipcode="3977",
        is_active=True
    )
    
    db.add_all([c1, c2, c3])
    db.commit()
    db.refresh(c1)
    db.refresh(c2)
    db.refresh(c3)

    # 2. Create Users
    sa = User(
        email="super.admin@auralinks.com",
        hashed_password=get_password_hash("123456"),
        first_name="Super",
        last_name="Admin",
        phone="0400000000",
        role="Super Admin",
        is_active=True,
        company_id=None
    )
    
    ca = User(
        email="ushanlokuge@msn.com",
        hashed_password=get_password_hash("123456"),
        first_name="Ushan",
        last_name="Lokuge",
        phone="0435159335",
        role="Company Admin",
        is_active=True,
        company_id=c1.id
    )

    cm = User(
        email="sidooaus@gmail.com",
        hashed_password=get_password_hash("123456"),
        first_name="Sid",
        last_name="Tamilselvan",
        phone="122222222",
        role="Client Location Manager",
        is_active=True,
        company_id=c1.id,
        parent_id=ca.id
    )
    
    db.add_all([sa, ca, cm])
    db.commit()
    
    # 3. Create Professionals
    profs = [
        Professional(first_name="Giri", last_name="waulite", email="vellingiri.d92@gmail.com", phone_number="123456789", skills="Security", status="Accepted", company_id=c1.id, modified_by="Ushan Lokuge"),
        Professional(first_name="Gertie", last_name="Sharen", email="gertie39girlz@gmail.com", phone_number="0432150445", skills="Cleaning", status="Accepted", company_id=c1.id, modified_by="Ushan Lokuge"),
        Professional(first_name="Two", last_name="auralinks", email="two.auralinks@gmail.com", phone_number="9894439709", skills="Plumbing, Security", status="Accepted", company_id=c1.id, modified_by="Sid Tamilselvan"),
        Professional(first_name="Dhivya", last_name="Baskar", email="dhivya.b@waulite.com", phone_number="1111", skills="Marphing, Security", status="Accepted", company_id=c1.id, modified_by="Ushan Lokuge"),
        Professional(first_name="Test", last_name="Employee", email="test@gmail.com", phone_number="111111", skills="Plumbing, Security, Marphing", status="Accepted", company_id=c1.id, modified_by="Ushan Lokuge"),
        Professional(first_name="Ushan", last_name="Lokuge", email="ushanlokuge@gmail.com", phone_number="0435159335", skills="Cleaning", status="Accepted", company_id=c1.id, modified_by="Ushan Lokuge"),
    ]
    db.add_all(profs)
    db.commit()

    # 4. Departments
    d_clean = Department(name="Cleaning", description="All cleaning employees and operations", company_id=c1.id, is_active=True, modified_by="Ushan Lokuge")
    d_sec = Department(name="Security", description="Security and patrol services", company_id=c1.id, parent_id=d_clean.id, is_active=True, modified_by="Ushan Lokuge")
    d_maint = Department(name="Maintenance", description="General facility maintenance", company_id=c1.id, parent_id=d_clean.id, is_active=True, modified_by="Ushan Lokuge")
    db.add_all([d_clean, d_sec, d_maint])
    db.commit()
    db.refresh(d_clean)

    # 5. Locations
    l1 = Location(name="The Glen Mall", description="d.com.au", contact_person="Sid Tamilselvan", contact_email="sid@theglen.com", contact_phone="0390001111", city="Melbourne", state="Victoria", zip_code="3150", latitude=-37.8765, longitude=145.1645, company_id=c1.id, is_active=True, modified_by="Sid Tamilselvan")
    l2 = Location(name="Spotlight site in Cranbourne east", description="This is the Spotlight site in Cranbourne east", contact_person="Ushan Lokuge", contact_email="nuwan@cleaningwizard.com.au", contact_phone="435125", city="Cranbourne East", state="Victoria", zip_code="3977", latitude=11.456789, longitude=79.698523, company_id=c1.id, is_active=True, modified_by="Ushan Lokuge")
    l3 = Location(name="Clayton Railway Station", description="Main station concourse", contact_person="Manager", contact_email="clayton@ptv.vic.gov.au", contact_phone="0391112222", city="clayton", state="vic", zip_code="3978", company_id=c1.id, is_active=True, modified_by="Ushan Lokuge")
    l4 = Location(name="IGA Cranbourne North", description="Retail supermarket site", contact_person="Manager", contact_email="iga@cranbournenorth.com", contact_phone="0393334444", city="Cranbourne North", state="Victoria", zip_code="3977", company_id=c1.id, is_active=True, modified_by="Ushan Lokuge")
    l5 = Location(name="IGA Cranbourne", description="Shopping Plaza site", contact_person="Store Manager", contact_email="store@igacranbourne.com", contact_phone="0395556666", city="Cranbourne", state="Victoria", zip_code="3977", company_id=c1.id, is_active=True, modified_by="Ushan Lokuge")
    
    db.add_all([l1, l2, l3, l4, l5])
    db.commit()
    db.refresh(l1)
    db.refresh(l2)
    db.refresh(l5)

    # 6. Work Locations
    wl1 = WorkLocation(location_id=l1.id, name="The Glen Entrance", description="Front entrance area", latitude=-37.8765, longitude=145.1645, qr_code_data="AURA-WL-GLEN-01", is_active=True, modified_by="Sid Tamilselvan")
    wl2 = WorkLocation(location_id=l2.id, name="New Work Location", description="Spotlight display floor", latitude=11.456789, longitude=79.698523, qr_code_data="AURA-WL-SPOT-02", is_active=True, modified_by="Ushan Lokuge")
    wl3 = WorkLocation(location_id=l5.id, name="Main Platform", description="Fruit & Veg aisle platform", latitude=-38.0987, longitude=145.2865, qr_code_data="AURA-WL-IGA-03", is_active=True, modified_by="Sid Tamilselvan")
    db.add_all([wl1, wl2, wl3])
    db.commit()

    # 7. Shifts
    s1 = Shift(name="Morning Second Shift", start_time="12:00", end_time="14:00", break_minutes=30, company_id=c1.id, is_active=True, modified_by="Ushan Lokuge")
    s2 = Shift(name="Noon Shift (2PM-6PM)", start_time="14:00", end_time="18:00", break_minutes=30, company_id=c1.id, is_active=True, modified_by="Sid Tamilselvan")
    s3 = Shift(name="Morning Shift (9AM-12PM)", start_time="09:00", end_time="12:00", break_minutes=15, company_id=c1.id, is_active=True, modified_by="Sid Tamilselvan")
    s4 = Shift(name="Evening Shift IGA", start_time="19:00", end_time="23:00", break_minutes=45, company_id=c1.id, is_active=True, modified_by="Ushan Lokuge")
    s5 = Shift(name="Evening Shift (18:00 - 22:00)", start_time="18:00", end_time="22:00", break_minutes=30, company_id=c1.id, is_active=True, modified_by="Ushan Lokuge")
    db.add_all([s1, s2, s3, s4, s5])
    db.commit()

    # 8. Task Templates
    tt1 = TaskTemplate(name="Central IGA Cleaning Service", description="Central IGA Cleaning Service", department_id=d_clean.id, company_id=c1.id, is_active=True, modified_by="Ushan Lokuge")
    tt2 = TaskTemplate(name="Central IGA Cleaning Service_Clone", description="Cloned cleaning template with extra checklist tasks", department_id=d_clean.id, company_id=c1.id, is_active=True, modified_by="Ushan Lokuge")
    db.add_all([tt1, tt2])
    db.commit()
    db.refresh(tt1)
    db.refresh(tt2)

    # Template Items
    cat_name = "Sales Floor, Fruit and Veg and Register"
    items = [
        TaskTemplateItem(template_id=tt2.id, category_name=cat_name, task_name="Thoroughly sweep sales floor to clean condition", description="Thoroughly sweep sales floor to clean condition", estimated_minutes=20, priority="Normal"),
        TaskTemplateItem(template_id=tt2.id, category_name=cat_name, task_name="Thoroughly scrub sales floor to clean condition", description="Thoroughly scrub sales floor to clean condition", estimated_minutes=30, priority="High"),
        TaskTemplateItem(template_id=tt2.id, category_name=cat_name, task_name="Thoroughly mop all edges, gondola feet, corners and scrubber", description="Thoroughly mop all edges, gondola feet...", estimated_minutes=25, priority="Normal"),
        TaskTemplateItem(template_id=tt2.id, category_name=cat_name, task_name="Buff the vinyl floor to high gloss and shine", description="Buff the vinyl sales floor to high gloss", estimated_minutes=35, priority="Normal"),
        TaskTemplateItem(template_id=tt2.id, category_name=cat_name, task_name="Detail all fixtures, fittings, edges, corners and gondolas feet to clean", description="Detail all fixtures, fittings, edges...", estimated_minutes=40, priority="Normal"),
        TaskTemplateItem(template_id=tt2.id, category_name=cat_name, task_name="Polish Chrome bollards with stainless steel cleaner", description="Polish chrome bollards with stainless steel", estimated_minutes=15, priority="Low"),
    ]
    db.add_all(items)
    db.commit()

    # 9. Schedule Tasks
    st1 = TaskSchedule(
        template_id=tt2.id,
        location_id=l5.id,
        company_id=c1.id,
        assigned_professionals_json=json.dumps(["Ushan Lokuge", "Dhivya Baskar"]),
        is_recursive=True,
        scheduled_date="2026-08-06",
        status="Scheduled",
        modified_by="Ushan Lokuge"
    )
    st2 = TaskSchedule(
        template_id=tt2.id,
        location_id=l1.id,
        company_id=c1.id,
        assigned_professionals_json=json.dumps(["Ushan Lokuge"]),
        is_recursive=False,
        scheduled_date="2026-08-06",
        status="In Progress",
        modified_by="Sid Tamilselvan"
    )
    db.add_all([st1, st2])
    db.commit()
    db.refresh(st1)
    db.refresh(st2)

    # Details for Schedule 1
    std1 = TaskScheduleDetail(
        schedule_id=st1.id,
        category_name="Sales Floor, Fruit and Veg and Register",
        task_name="Thoroughly sweep sales floor to clean condition",
        description="Thoroughly sweep sales floor to clean condition",
        work_location_name="The Glen Entrance",
        shift_name="Evening Shift (18:00 - 22:00)",
        is_recursive=True,
        assigned_professionals_json=json.dumps(["Ushan Lokuge"]),
        status="YetToStart"
    )
    std2 = TaskScheduleDetail(
        schedule_id=st1.id,
        category_name="Sales Floor, Fruit and Veg and Register",
        task_name="Thoroughly scrub sales floor to clean condition",
        description="Thoroughly scrub sales floor to clean condition",
        work_location_name="New Work Location",
        shift_name="Evening Shift (18:00 - 22:00)",
        is_recursive=True,
        assigned_professionals_json=json.dumps(["Ushan Lokuge", "Dhivya Baskar"]),
        status="InProgress"
    )
    std3 = TaskScheduleDetail(
        schedule_id=st1.id,
        category_name="Sales Floor, Fruit and Veg and Register",
        task_name="Buff the vinyl floor to high gloss and shine",
        description="Buff the vinyl floor to high gloss and shine",
        work_location_name="Main Platform",
        shift_name="Evening Shift (18:00 - 22:00)",
        is_recursive=False,
        assigned_professionals_json=json.dumps(["Dhivya Baskar"]),
        status="Ended"
    )
    db.add_all([std1, std2, std3])

    # 10. Initial Notifications
    n1 = Notification(user_id=ca.id, title="Welcome to AuraLinks", message="Your enterprise company dashboard is fully operational.", type="info")
    n2 = Notification(user_id=ca.id, title="New Shift Created", message="Evening Shift IGA (19:00 - 23:00) has been published.", type="success")
    db.add_all([n1, n2])
    db.commit()
    print("Database initial seed completed successfully!")

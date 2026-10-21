import json
import random
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.models import (
    User, Company, Professional, Department, Location, WorkLocation, Shift,
    TaskCategory, TaskTemplate, TaskTemplateItem, TaskSchedule, TaskScheduleDetail,
    Notification, AuditLog, TaskEvidence
)
from app.core.security import get_password_hash

# 26 Enterprise Companies across various industries
COMPANY_DATA = [
    {"name": "Cleaning Wizard Pty Ltd", "code": "CWIZ01", "industry": "Cleaning Services", "city": "Melbourne", "state": "VIC", "zip": "3000", "contact": "Don Ushan", "email": "ushanlokuge@msn.com", "phone": "0435159335", "web": "www.cleaningwizard.com.au"},
    {"name": "Swift Way Victoria Dandenong", "code": "SWFT02", "industry": "Security Service", "city": "Dandenong", "state": "VIC", "zip": "3175", "contact": "Demo Manager", "email": "demo@swiftway.com", "phone": "0394445341", "web": "www.swiftway.com"},
    {"name": "Spotlight Site Cranbourne", "code": "SPOT03", "industry": "Facility Management", "city": "Cranbourne East", "state": "VIC", "zip": "3977", "contact": "Nuwan Perera", "email": "nuwan@spotlight.com.au", "phone": "0435125890", "web": "www.spotlight.com.au"},
    {"name": "Apex Shield Security Australia", "code": "APEX04", "industry": "Security Service", "city": "Sydney", "state": "NSW", "zip": "2000", "contact": "Marcus Vance", "email": "m.vance@apexshield.com.au", "phone": "0298765432", "web": "www.apexshield.com.au"},
    {"name": "St. Jude Healthcare Logistics", "code": "SJHL05", "industry": "Healthcare & Sanitization", "city": "Brisbane", "state": "QLD", "zip": "4000", "contact": "Dr. Sarah Jenkins", "email": "admin@stjudehealth.com", "phone": "0734567890", "web": "www.stjudehealth.com"},
    {"name": "SkyPort Aviation Services", "code": "SKYP06", "industry": "Aviation Ground Services", "city": "Tullamarine", "state": "VIC", "zip": "3043", "contact": "James Murdoch", "email": "j.murdoch@skyport.aero", "phone": "0392345678", "web": "www.skyport.aero"},
    {"name": "Nexus High-Tech Facilities", "code": "NXUS07", "industry": "Data Center Operations", "city": "Sydney", "state": "NSW", "zip": "2060", "contact": "Elena Rostova", "email": "elena@nexusdc.io", "phone": "0281234567", "web": "www.nexusdc.io"},
    {"name": "Grand Horizon Hospitality Care", "code": "GHHC08", "industry": "Hospitality & Housekeeping", "city": "Gold Coast", "state": "QLD", "zip": "4217", "contact": "Liam Hemsworth", "email": "ops@grandhorizon.com.au", "phone": "0755512345", "web": "www.grandhorizon.com.au"},
    {"name": "Metro Transit Infrastructure", "code": "MTRO09", "industry": "Public Infrastructure", "city": "Melbourne", "state": "VIC", "zip": "3004", "contact": "Arthur Pendelton", "email": "admin@metroinfra.vic.gov.au", "phone": "0386543210", "web": "www.metroinfra.vic.gov.au"},
    {"name": "GreenLeaf Eco Building Care", "code": "GLEF10", "industry": "Commercial Cleaning", "city": "Adelaide", "state": "SA", "zip": "5000", "contact": "Chloe Bennett", "email": "info@greenleafeco.com.au", "phone": "0882345678", "web": "www.greenleafeco.com.au"},
    {"name": "Titan Mechanical & HVAC Group", "code": "TITN11", "industry": "HVAC & Engineering", "city": "Perth", "state": "WA", "zip": "6000", "contact": "David Sterling", "email": "d.sterling@titanhvac.com.au", "phone": "0893456789", "web": "www.titanhvac.com.au"},
    {"name": "Vanguard Retail Asset Services", "code": "VNGR12", "industry": "Retail Facility Services", "city": "Chadstone", "state": "VIC", "zip": "3148", "contact": "Rachel Adams", "email": "rachel@vanguardretail.com.au", "phone": "0395551234", "web": "www.vanguardretail.com.au"},
    {"name": "Oceanic Ports Logistics", "code": "OCNP13", "industry": "Maritime & Logistics", "city": "Fremantle", "state": "WA", "zip": "6160", "contact": "Captain Robert Hook", "email": "ops@oceanicports.com.au", "phone": "0894321098", "web": "www.oceanicports.com.au"},
    {"name": "Solaris Energy Operations", "code": "SOLR14", "industry": "Renewable Energy Maintenance", "city": "Canberra", "state": "ACT", "zip": "2600", "contact": "Fiona Gallagher", "email": "field@solarisenergy.com.au", "phone": "0261234567", "web": "www.solarisenergy.com.au"},
    {"name": "Precision Pest & Hygiene Solutions", "code": "PPHS15", "industry": "Hygiene & Sanitization", "city": "Newcastle", "state": "NSW", "zip": "2300", "contact": "Gary Cooper", "email": "gary@precisionhygiene.com.au", "phone": "0249234567", "web": "www.precisionhygiene.com.au"},
    {"name": "Aura Corporate Complex Management", "code": "AURA16", "industry": "Corporate Real Estate", "city": "Docklands", "state": "VIC", "zip": "3008", "contact": "Sid Tamilselvan", "email": "sidooaus@gmail.com", "phone": "0412222222", "web": "www.auracomplex.com.au"},
    {"name": "IronClad Security & Patrol", "code": "ICLD17", "industry": "Security Service", "city": "Parramatta", "state": "NSW", "zip": "2150", "contact": "Tariq Mansoor", "email": "tariq@ironcladsecurity.com", "phone": "0287654321", "web": "www.ironcladsecurity.com"},
    {"name": "FreshView Window & Facade Care", "code": "FVWF18", "industry": "Facade & High-Rise Services", "city": "Southbank", "state": "VIC", "zip": "3006", "contact": "Oliver Queen", "email": "oliver@freshview.com.au", "phone": "0396781234", "web": "www.freshview.com.au"},
    {"name": "BioCare Sterile Environments", "code": "BIOC19", "industry": "Healthcare & Cleanrooms", "city": "Clayton", "state": "VIC", "zip": "3168", "contact": "Dr. Emily Wong", "email": "e.wong@biocarelab.com.au", "phone": "0399051234", "web": "www.biocarelab.com.au"},
    {"name": "PureWater Systems & Plumbing", "code": "PWSP20", "industry": "Plumbing & Hydraulics", "city": "Richmond", "state": "VIC", "zip": "3121", "contact": "Jack Morrison", "email": "jack@purewaterhydraulics.com.au", "phone": "0394289876", "web": "www.purewaterhydraulics.com.au"},
    {"name": "AlphaVolt Electrical Contracting", "code": "AVEC21", "industry": "Electrical Engineering", "city": "Alexandria", "state": "NSW", "zip": "2015", "contact": "Nathan Drake", "email": "nathan@alphavolt.com.au", "phone": "0283456789", "web": "www.alphavolt.com.au"},
    {"name": "CivicWorks Urban Grounds Maintenance", "code": "CWUG22", "industry": "Landscaping & Civil", "city": "Hobart", "state": "TAS", "zip": "7000", "contact": "Hannah Abbott", "email": "hannah@civicworks.tas.gov.au", "phone": "0362345678", "web": "www.civicworks.tas.gov.au"},
    {"name": "Quantum Cold Chain Services", "code": "QCCS23", "industry": "Cold Storage & Logistics", "city": "Truganina", "state": "VIC", "zip": "3029", "contact": "Vikram Patel", "email": "vikram@quantumcold.com.au", "phone": "0383601234", "web": "www.quantumcold.com.au"},
    {"name": "Starlight Entertainment Venues", "code": "SLEV24", "industry": "Venue & Event Operations", "city": "Sydney", "state": "NSW", "zip": "2009", "contact": "Sophea Khiev", "email": "sophea@starlightvenues.com.au", "phone": "0290001122", "web": "www.starlightvenues.com.au"},
    {"name": "PrimeSource Waste & Recycling", "code": "PSWR25", "industry": "Waste & Environmental", "city": "Derrimut", "state": "VIC", "zip": "3026", "contact": "Bruce Wayne", "email": "bruce@primesourcewaste.com.au", "phone": "0383905678", "web": "www.primesourcewaste.com.au"},
    {"name": "Beacon Fire Safety & Compliance", "code": "BFSC26", "industry": "Fire Safety Engineering", "city": "Box Hill", "state": "VIC", "zip": "3128", "contact": "Diana Prince", "email": "diana@beaconfiresafety.com.au", "phone": "0398901234", "web": "www.beaconfiresafety.com.au"}
]

FIRST_NAMES = [
    "Liam", "Noah", "Oliver", "James", "Elijah", "William", "Henry", "Lucas", "Benjamin", "Theodore",
    "Jack", "Levi", "Alexander", "Jackson", "Mateo", "Daniel", "Michael", "Mason", "Sebastian", "Ethan",
    "Logan", "Owen", "Samuel", "Jacob", "Asher", "Aiden", "John", "Joseph", "Wyatt", "David",
    "Leo", "Luke", "Julian", "Hudson", "Grayson", "Matthew", "Ezra", "Gabriel", "Carter", "Isaac",
    "Jayden", "Luca", "Anthony", "Dylan", "Lincoln", "Thomas", "Maverick", "Elias", "Josiah", "Charles",
    "Olivia", "Emma", "Charlotte", "Amelia", "Sophia", "Isabella", "Ava", "Mia", "Evelyn", "Harper",
    "Luna", "Camila", "Gianna", "Elizabeth", "Eleanor", "Ella", "Abigail", "Sofia", "Avery", "Scarlett",
    "Emily", "Aria", "Penelope", "Chloe", "Layla", "Mila", "Nora", "Hazel", "Madison", "Ellie",
    "Lily", "Nova", "Isla", "Grace", "Violet", "Aurora", "Riley", "Zoey", "Willow", "Emilia",
    "Stella", "Zoe", "Victoria", "Hannah", "Addison", "Lucy", "Elena", "Natalie", "Kinsley", "Delilah",
    "Ushan", "Sid", "Giri", "Gertie", "Dhivya", "Nuwan", "Rohan", "Ananya", "Arjun", "Priya",
    "Karthik", "Sneha", "Vellingiri", "Baskar", "Naveen", "Kavita", "Suresh", "Meera", "Rajesh", "Sunita",
    "Chen", "Wei", "Li", "Zhang", "Liu", "Yang", "Huang", "Wu", "Zhao", "Zhou",
    "Kenji", "Hiroshi", "Yuki", "Takeshi", "Aoi", "Daiki", "Kazuki", "Ren", "Haruto", "Souta"
]

LAST_NAMES = [
    "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez",
    "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin",
    "Lee", "Perez", "Thompson", "White", "Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson",
    "Walker", "Young", "Allen", "King", "Wright", "Scott", "Torres", "Nguyen", "Hill", "Flores",
    "Green", "Adams", "Nelson", "Baker", "Hall", "Rivera", "Campbell", "Mitchell", "Carter", "Roberts",
    "Lokuge", "Tamilselvan", "Waulite", "Sharen", "Baskar", "Perera", "Sharma", "Verma", "Patel", "Reddy",
    "Wong", "Chen", "Tan", "Lim", "Singh", "Kumar", "Kowalski", "Ivanov", "Santos", "Fernandez"
]

SKILL_SETS = [
    "Commercial Cleaning, Floor Buffing, Waste Disposal",
    "High-Risk Security, Access Control, CCTV Monitoring",
    "HVAC Maintenance, Filter Replacement, Air Quality Audit",
    "Electrical Safety, Panel Testing, Lighting Inspection",
    "Hydraulic Systems, Commercial Plumbing, Drain Snaking",
    "Medical Facility Sanitization, Biohazard Disposal, Sterilization",
    "Data Center Rack Maintenance, Cooling Systems, Cable Routing",
    "Aviation Ground Sanitization, Ramp Safety, Cabin Disinfection",
    "Fire Alarm Testing, Sprinkler Inspection, Emergency Exit Audit",
    "Facade Glass Cleaning, Rope Access, Window Sealant Check",
    "Industrial Pest Management, Rodent Control, Hygiene Audit",
    "Cold Storage Temp Logging, Compressor Servicing, Defrost Check",
    "Event Crowd Control, Patrol Officer, First Aid Certified",
    "Landscape Groundskeeping, Irrigation Check, Turf Management",
    "General Handyman, Drywall Repair, Painting, Carpentry"
]

LOCATIONS_BY_COMPANY = {
    "CWIZ01": [
        {"name": "The Glen Mall Shopping Centre", "city": "Glen Waverley", "lat": -37.8765, "lng": 145.1645, "work_locs": ["Main Concourse Entrance", "Food Court Level 1", "Restroom Block B", "Loading Bay North"]},
        {"name": "Spotlight Cranbourne East Complex", "city": "Cranbourne East", "lat": -38.1021, "lng": 145.2912, "work_locs": ["Sales Floor & Cash Registers", "Fabric Department Aisle 4", "Staff Breakroom", "Rear Warehouse"]}
    ],
    "SWFT02": [
        {"name": "Dandenong South Industrial Logistics Hub", "city": "Dandenong South", "lat": -38.0123, "lng": 145.2156, "work_locs": ["Security Gatehouse A", "Perimeter Fence Post 12", "CCTV Monitoring Room", "Heavy Vehicle Inspection Bay"]},
        {"name": "Clayton Transport Interchange", "city": "Clayton", "lat": -37.9254, "lng": 145.1209, "work_locs": ["Platform 1 Concourse", "Underground Pedestrian Tunnel", "Bus Interchange Shelter"]}
    ],
    "SPOT03": [
        {"name": "Spotlight Plaza Cranbourne", "city": "Cranbourne", "lat": -38.0987, "lng": 145.2865, "work_locs": ["Main Entrance Atrium", "Mezzanine Level 2", "Customer Service Desk"]}
    ],
    "APEX04": [
        {"name": "Sydney Financial Tower One", "city": "Sydney CBD", "lat": -33.8688, "lng": 151.2093, "work_locs": ["Executive Lobby Turnstiles", "Basement B2 Vault Access", "Level 35 Trading Floor Entrance", "Helipad Security Access"]}
    ],
    "SJHL05": [
        {"name": "St. Jude Metropolitan Hospital", "city": "Brisbane", "lat": -27.4698, "lng": 153.0251, "work_locs": ["Intensive Care Unit Sterile Airlock", "Emergency Ward Triage Area", "Pathology Laboratory Corridor", "Operating Theatre 4 Prep Room"]}
    ],
    "SKYP06": [
        {"name": "Melbourne Tullamarine Airport Terminal 4", "city": "Tullamarine", "lat": -37.6690, "lng": 144.8410, "work_locs": ["Gate 12 Departure Lounge", "Baggage Claim Carousel 3", "Airside Jet Bridge B4", "Ground Crew Staging Area"]}
    ],
    "NXUS07": [
        {"name": "Nexus Primary DC Facility Alpha", "city": "North Sydney", "lat": -33.8360, "lng": 151.2070, "work_locs": ["Server Hall Tier-4 Pod A", "UPS Battery Backup Room", "HVAC Chiller Plant Roof", "Biometric Access Mantrap"]}
    ],
    "GHHC08": [
        {"name": "Grand Horizon Resort & Spa", "city": "Surfers Paradise", "lat": -28.0024, "lng": 153.4295, "work_locs": ["Grand Ballroom Foyer", "Infinity Poolside Cabanas", "VIP Penthouse Suite 1801", "Main Kitchen Prep Station"]}
    ],
    "MTRO09": [
        {"name": "Flinders Street Station Metro Hub", "city": "Melbourne CBD", "lat": -37.8180, "lng": 144.9671, "work_locs": ["Main Clocks Concourse", "Platform 5 Underpass", "Staff Signal Control Room", "East Degraves Subway"]}
    ],
    "GLEF10": [
        {"name": "Adelaide Green Star Tower", "city": "Adelaide CBD", "lat": -34.9285, "lng": 138.6007, "work_locs": ["Solar Atrium Level 1", "Recycled Greywater Filtration", "Rooftop Community Garden"]}
    ],
    "TITN11": [
        {"name": "Perth Mining Corporate HQ", "city": "Perth CBD", "lat": -31.9505, "lng": 115.8605, "work_locs": ["Primary Air Handling Unit AHU-01", "Chilled Water Pump Station", "Cooling Tower Array Roof"]}
    ],
    "VNGR12": [
        {"name": "Chadstone Fashion Capital Wing C", "city": "Chadstone", "lat": -37.8860, "lng": 145.0830, "work_locs": ["Luxury Precinct Rotunda", "Glass Dome Skywalk", "Valet Parking Reception"]}
    ],
    "OCNP13": [
        {"name": "Fremantle Container Terminal Gate 4", "city": "Fremantle", "lat": -32.0569, "lng": 115.7439, "work_locs": ["Quay Crane Control Booth", "Reefer Container Yard Zone 3", "Customs Inspection Bay"]}
    ],
    "SOLR14": [
        {"name": "Canberra Clean Grid Substation", "city": "Canberra", "lat": -35.2809, "lng": 149.1300, "work_locs": ["Inverter Station Array A", "High Voltage Transformer Yard", "Control Room Scada Station"]}
    ],
    "PPHS15": [
        {"name": "Newcastle Food Processing Plant", "city": "Newcastle", "lat": -32.9283, "lng": 151.7817, "work_locs": ["Packaging Line Hygiene Zone", "Cold Room Storage Bay", "Silo Intake Perimeter"]}
    ],
    "AURA16": [
        {"name": "Aura Complex Docklands Tower 1", "city": "Docklands", "lat": -37.8175, "lng": 144.9450, "work_locs": ["Sky Lounge Level 28", "Main Reception Concierge", "Sub-basement Facility Office", "Conference Centre Auditorium"]}
    ],
    "ICLD17": [
        {"name": "Parramatta Justice Precinct", "city": "Parramatta", "lat": -33.8150, "lng": 151.0011, "work_locs": ["Main Screening Entry", "Secure Transit Tunnel", "Holding Room Gate 2"]}
    ],
    "FVWF18": [
        {"name": "Eureka High Rise Complex", "city": "Southbank", "lat": -37.8217, "lng": 144.9647, "work_locs": ["Skydeck Level 88 Exterior", "BMU Cradle Rig West", "Podium Glass Canopies"]}
    ],
    "BIOC19": [
        {"name": "Monash Bio-Medical Discovery Lab", "city": "Clayton", "lat": -37.9130, "lng": 145.1340, "work_locs": ["Cleanroom ISO Class 5", "Cryogenic Storage Room", "Sterile Autoclave Station"]}
    ],
    "PWSP20": [
        {"name": "Richmond Commercial Estate", "city": "Richmond", "lat": -37.8230, "lng": 144.9980, "work_locs": ["Boiler Room Plant 2", "Stormwater Retention Basin", "Fire Hydrant Booster Station"]}
    ],
    "AVEC21": [
        {"name": "Alexandria Tech Park", "city": "Alexandria", "lat": -33.9080, "lng": 151.1960, "work_locs": ["Main Switchboard MSB-01", "Solar Battery Energy Room", "EV Charging Station Bank"]}
    ],
    "CWUG22": [
        {"name": "Royal Tasmanian Botanical Works", "city": "Hobart", "lat": -42.8640, "lng": 147.3320, "work_locs": ["Conservatory Glasshouse", "Japanese Garden Pavilion", "Equipment Shed & Nursery"]}
    ],
    "QCCS23": [
        {"name": "Truganina Mega Cold Logistics Hub", "city": "Truganina", "lat": -37.8390, "lng": 144.7300, "work_locs": ["Deep Freeze Room -25C", "Blast Chiller Intake Bay", "Automated Crane Aisle 6"]}
    ],
    "SLEV24": [
        {"name": "Sydney Star Arena & Pavilion", "city": "Pyrmont", "lat": -33.8690, "lng": 151.1950, "work_locs": ["Main Stage Rigging Access", "VIP Hospitality Suites", "General Admission Turnstiles"]}
    ],
    "PSWR25": [
        {"name": "Derrimut Materials Recovery Facility", "city": "Derrimut", "lat": -37.8010, "lng": 144.7780, "work_locs": ["Optical Sorter Conveyor 1", "Baling Press Station B", "Hazardous Waste Segregation"]}
    ],
    "BFSC26": [
        {"name": "Box Hill Central Corporate Hub", "city": "Box Hill", "lat": -37.8185, "lng": 145.1215, "work_locs": ["Fire Control Room FIP", "Riser Shaft 3 Sprinkler Valve", "Fire Pump Diesel Room"]}
    ]
}

TEMPLATE_CATALOG = [
    {
        "name": "Comprehensive Sales Floor & Restroom Sanitization",
        "category": "Hygiene & Cleaning",
        "items": [
            ("Thoroughly sweep sales floor to clean condition", "Ensure zero dust and rubbish along aisle edges", 20, "Normal"),
            ("Thoroughly scrub sales floor with industrial scrubber", "Clean floor surface using antibacterial solution", 35, "High"),
            ("Mop all perimeter edges, gondola feet and corners", "Mop inaccessible areas by hand", 25, "Normal"),
            ("Buff vinyl floor to high gloss reflective shine", "Use high-speed buffer with polish pad", 30, "Normal"),
            ("Deep disinfect public restrooms & touchpoints", "Disinfect door handles, faucets, and countertops", 30, "High"),
            ("Replenish consumables & empty waste bins", "Refill soap, hand towels, toilet rolls, dispose rubbish", 15, "Normal")
        ]
    },
    {
        "name": "High-Security Facility Perimeter & Patrol Audit",
        "category": "Security & Protection",
        "items": [
            ("Conduct physical perimeter fence inspection", "Inspect boundary gates, barbed wire, and anti-climb sensors", 30, "High"),
            ("Verify electronic access control turnstiles & card readers", "Test keycard badges, RFID locks, and logs", 20, "Normal"),
            ("Test CCTV security cameras & infrared night-vision", "Check blind spots, pan-tilt-zoom function and recorder", 25, "Normal"),
            ("Inspect emergency panic buttons & duress alarms", "Coordinate test signals with control monitoring room", 20, "High"),
            ("Conduct random vehicle inspection & log entry manifests", "Log license plates, driver IDs, and verify manifest", 25, "Normal")
        ]
    },
    {
        "name": "HVAC Mechanical & Air Quality System Overhaul",
        "category": "HVAC & Engineering",
        "items": [
            ("Shut down primary air handling unit AHU safely", "Apply Lockout/Tagout (LOTO) safety protocol", 15, "High"),
            ("Inspect intake differential pressure gauges & static draft", "Record pressure differential in kPa log", 20, "Normal"),
            ("Replace HEPA air filters & primary pre-cartridges", "Install certified MERV-13/HEPA filtration elements", 40, "High"),
            ("Clean condensate drainage pans & clear blockage", "Treat with anti-algae biocide tablets", 25, "Normal"),
            ("Measure airflow velocity across supply and return diffusers", "Verify CFM airflow standards for indoor air safety", 30, "Normal")
        ]
    },
    {
        "name": "Sterile Cleanroom & Healthcare Disinfection Protocol",
        "category": "Healthcare & Sanitization",
        "items": [
            ("Perform sterile gowning & biohazard checklist", "Confirm level 3 PPE, boot covers, and sterile gloves", 15, "High"),
            ("Disinfect sterile operating room surfaces & overhead lamps", "Apply medical-grade quaternary ammonium solution", 35, "High"),
            ("Sterilize surgical equipment trays & autoclave racks", "Run verification biological indicator test", 30, "High"),
            ("Mop electrostatic cleanroom floors with deionized water", "Use lint-free microfibre flat mops", 25, "Normal"),
            ("Seal and tag biohazard waste containers for disposal", "Log weight and dispatch with licensed medical courier", 20, "High")
        ]
    },
    {
        "name": "Electrical Distribution Board & Thermal Scan Audit",
        "category": "Electrical Engineering",
        "items": [
            ("Perform FLIR infrared thermal scan on Main Switchboard", "Detect overheating circuit breakers or phase imbalances", 25, "High"),
            ("Inspect and test Residual Current Devices (RCDs)", "Log trip time in milliseconds per AS/NZS 3760", 30, "High"),
            ("Check emergency lighting battery duration & illumination", "Simulate 90-minute power outage test", 45, "High"),
            ("Torque check cable lugs & busbar terminations", "Verify screw torque specs to manufacturer standard", 25, "Normal")
        ]
    },
    {
        "name": "Aviation Ramp & Aircraft Cabin Turnaround Service",
        "category": "Aviation Services",
        "items": [
            ("Conduct Foreign Object Debris (FOD) walk on jet bay", "Clear ramp of metal, plastic, or loose debris", 20, "High"),
            ("Perform high-speed aircraft cabin sanitization", "Wipe all tray tables, armrests, and seat buckles", 25, "High"),
            ("Restock galley supplies & passenger amenities", "Verify seal integrity on emergency medical kits", 20, "Normal"),
            ("Inspect jet bridge alignment & wheel chocks placement", "Confirm safety interlocks on airside loading bridge", 15, "High")
        ]
    },
    {
        "name": "Fire Safety System & Hydrant Pressure Verification",
        "category": "Fire Safety",
        "items": [
            ("Inspect Fire Indicator Panel (FIP) for active faults", "Confirm all zone loops are healthy and clear", 15, "High"),
            ("Conduct static and flow pressure test on roof hydrants", "Record water pressure gauge readings in bar", 30, "High"),
            ("Check fire extinguisher expiry dates and gauge pins", "Verify tagged monthly maintenance records", 25, "Normal"),
            ("Test emergency fire shutter doors & acoustic sirens", "Ensure automatic magnetic release is operating", 25, "High")
        ]
    }
]

SHIFTS_LIST = [
    ("Morning First Shift", "06:00", "14:00"),
    ("Standard Day Shift", "08:00", "16:00"),
    ("Midday Peak Shift", "10:00", "18:00"),
    ("Afternoon Shift", "12:00", "20:00"),
    ("Evening Shift", "16:00", "00:00"),
    ("Night Graveyard Shift", "22:00", "06:00")
]

def ensure_job_and_task_codes(db: Session):
    """Ensures all jobs and tasks have proper Job IDs (JOB-XXXX), Task IDs (TSK-XXXX), custom times, and multi-job demo schedules."""
    # 1. Backfill Job IDs
    unlabeled_jobs = db.query(TaskSchedule).filter(TaskSchedule.job_id.is_(None)).all()
    for j in unlabeled_jobs:
        j.job_id = f"JOB-{j.id:04d}"
        if not j.title:
            tmpl = db.query(TaskTemplate).filter(TaskTemplate.id == j.template_id).first() if j.template_id else None
            j.title = (tmpl.name if tmpl else f"Service Job #{j.id}")
        if not j.start_time:
            j.start_time = "09:00"
        if not j.end_time:
            j.end_time = "11:00"
    if unlabeled_jobs:
        db.commit()
        print(f"Backfilled {len(unlabeled_jobs)} jobs with formatted Job IDs")

    # 2. Backfill Task IDs
    unlabeled_tasks = db.query(TaskScheduleDetail).filter(TaskScheduleDetail.task_id.is_(None)).all()
    for d in unlabeled_tasks:
        d.task_id = f"TSK-{d.id:04d}"
        if not d.priority:
            d.priority = "Normal"
        if not d.estimated_minutes:
            d.estimated_minutes = 30
    if unlabeled_tasks:
        db.commit()
        print(f"Backfilled {len(unlabeled_tasks)} tasks with formatted Task IDs")

    # 3. Seed multiple same-day jobs for Alex Vance (professional@auralinks.com)
    alex_user = db.query(User).filter(User.email == "professional@auralinks.com").first()
    first_company = db.query(Company).first()
    loc = db.query(Location).filter(Location.company_id == first_company.id).first() if first_company else None
    
    if alex_user and first_company and loc:
        today_str = datetime.now().strftime("%Y-%m-%d")
        alex_name = f"{alex_user.first_name} {alex_user.last_name}"
        
        existing_alex_today = db.query(TaskSchedule).filter(
            TaskSchedule.company_id == first_company.id,
            TaskSchedule.scheduled_date == today_str,
            TaskSchedule.assigned_professionals_json.ilike(f"%{alex_name}%")
        ).count()
        
        if existing_alex_today < 2:
            demo_jobs_data = [
                {
                    "title": "Morning Medical Check & Vital Monitoring",
                    "start": "09:00",
                    "end": "11:00",
                    "tasks": [
                        ("Check Vital Signs & Blood Pressure", "Clinical Vitals", "Normal", 30),
                        ("Administer Scheduled Morning Medication", "Medication", "High", 25),
                        ("Complete Patient Daily Well-Being Log", "Documentation", "Normal", 20)
                    ]
                },
                {
                    "title": "Afternoon Rehabilitation & Mobility Care",
                    "start": "13:00",
                    "end": "15:30",
                    "tasks": [
                        ("Supervised Physiotherapy Exercises", "Rehabilitation", "Normal", 45),
                        ("Sanitization & Fresh Linen Replacement", "Sanitization", "Normal", 30)
                    ]
                },
                {
                    "title": "Late Afternoon Safety Sweep & Shift Handover",
                    "start": "16:30",
                    "end": "18:30",
                    "tasks": [
                        ("Facility Hazard Check & Equipment Audit", "Safety Inspection", "High", 35),
                        ("Supervisor Handover Briefing & Sign-Off", "Administration", "Normal", 20)
                    ]
                }
            ]

            first_tmpl = db.query(TaskTemplate).filter(TaskTemplate.company_id == first_company.id).first()
            tmpl_id = first_tmpl.id if first_tmpl else 1

            for job_info in demo_jobs_data:
                j = TaskSchedule(
                    title=job_info["title"],
                    template_id=tmpl_id,
                    company_id=first_company.id,
                    location_id=loc.id,
                    work_location_name="Suite A, Main Facility",
                    assigned_professional_id=alex_user.id,
                    assigned_professional_name=alex_name,
                    assigned_professionals_json=json.dumps([alex_name]),
                    scheduled_date=today_str,
                    start_time=job_info["start"],
                    end_time=job_info["end"],
                    shift_name=f"Custom Window ({job_info['start']} - {job_info['end']})",
                    status="Scheduled",
                    modified_by="Company Admin"
                )
                db.add(j)
                db.commit()
                db.refresh(j)
                j.job_id = f"JOB-{j.id:04d}"
                db.commit()

                for t_name, t_cat, t_prio, t_mins in job_info["tasks"]:
                    t = TaskScheduleDetail(
                        schedule_id=j.id,
                        category_name=t_cat,
                        task_name=t_name,
                        description=f"Perform {t_name} according to standard company guidelines",
                        work_location_name="Suite A, Main Facility",
                        shift_name=f"{job_info['start']} - {job_info['end']}",
                        estimated_minutes=t_mins,
                        priority=t_prio,
                        assigned_professionals_json=json.dumps([alex_name]),
                        status="YetToStart"
                    )
                    db.add(t)
                    db.commit()
                    db.refresh(t)
                    t.task_id = f"TSK-{t.id:04d}"
                    db.commit()
            print(f"Seeded 3 distinct same-day jobs with customized time slots for {alex_name}")

def seed_initial_data(db: Session, force_reseed: bool = False):
    # Ensure Job IDs and Task IDs are populated
    ensure_job_and_task_codes(db)

    total_tasks = db.query(TaskScheduleDetail).count()
    if total_tasks >= 950 and not force_reseed:
        print(f"Database already contains {total_tasks} tasks and sufficient records.")
        return

    print("--- Starting AuraLinks Massive Enterprise Database Seeding (25+ Companies, 250+ Professionals, 1000+ Tasks) ---")

    
    # 1. Super Admin User
    sa = db.query(User).filter(User.email == "super.admin@auralinks.com").first()
    if not sa:
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
        db.add(sa)
        db.commit()
        db.refresh(sa)

    # 2. Seed 26 Companies
    companies = []
    for c_info in COMPANY_DATA:
        comp = db.query(Company).filter(Company.code == c_info["code"]).first()
        if not comp:
            comp = Company(
                name=c_info["name"],
                code=c_info["code"],
                industry_type=c_info["industry"],
                contact_name=c_info["contact"],
                contact_email=c_info["email"],
                phone_number=c_info["phone"],
                website=c_info["web"],
                billing_address1=f"Suite {random.randint(10, 500)}, Corporate Centre",
                billing_city=c_info["city"],
                billing_state=c_info["state"],
                billing_zipcode=c_info["zip"],
                shipping_address1=f"Facility Gate {random.randint(1, 10)}",
                shipping_city=c_info["city"],
                shipping_state=c_info["state"],
                shipping_zipcode=c_info["zip"],
                is_active=True
            )
            db.add(comp)
            db.commit()
            db.refresh(comp)
        companies.append(comp)

    # 3. Create Company Admin Users
    company_admins = []
    for comp in companies:
        admin_email = comp.contact_email or f"admin@{comp.code.lower()}.com"
        u = db.query(User).filter(User.email == admin_email).first()
        if not u:
            first = comp.contact_name.split()[0] if comp.contact_name else "Admin"
            last = comp.contact_name.split()[-1] if comp.contact_name and len(comp.contact_name.split()) > 1 else "User"
            u = User(
                email=admin_email,
                hashed_password=get_password_hash("123456"),
                first_name=first,
                last_name=last,
                phone=comp.phone_number or "0400111222",
                role="Company Admin",
                is_active=True,
                company_id=comp.id
            )
            db.add(u)
            db.commit()
            db.refresh(u)
        company_admins.append(u)

    # Also add standard demo users
    demo_comp_admin = db.query(User).filter(User.email == "ushanlokuge@msn.com").first()
    if not demo_comp_admin and companies:
        demo_comp_admin = User(
            email="ushanlokuge@msn.com",
            hashed_password=get_password_hash("123456"),
            first_name="Don Ushan",
            last_name="Lokuge",
            phone="0435159335",
            role="Company Admin",
            is_active=True,
            company_id=companies[0].id
        )
        db.add(demo_comp_admin)
        db.commit()

    demo_prof_user = db.query(User).filter(User.email == "professional@auralinks.com").first()
    if not demo_prof_user:
        demo_prof_user = User(
            email="professional@auralinks.com",
            hashed_password=get_password_hash("123456"),
            first_name="Alex",
            last_name="Vance",
            phone="0435159335",
            role="Professional",
            is_active=True,
            company_id=companies[0].id
        )
        db.add(demo_prof_user)
        db.commit()

    # 4. Seed Departments & Shifts for each company
    all_shifts = []
    all_departments = []
    for comp in companies:
        # Standard departments
        dept_names = ["Operations", "Facility Maintenance", "Safety & Security", "Hygiene & Cleaning", "Engineering"]
        for dname in dept_names:
            d = db.query(Department).filter(Department.company_id == comp.id, Department.name == dname).first()
            if not d:
                d = Department(name=dname, description=f"{dname} for {comp.name}", company_id=comp.id, is_active=True, modified_by="Admin")
                db.add(d)
                db.commit()
                db.refresh(d)
            all_departments.append(d)

        # Standard shifts
        for sname, stime, etime in SHIFTS_LIST:
            s = db.query(Shift).filter(Shift.company_id == comp.id, Shift.name == sname).first()
            if not s:
                s = Shift(name=sname, start_time=stime, end_time=etime, break_minutes=30, grace_minutes=15, company_id=comp.id, is_active=True, modified_by="Admin")
                db.add(s)
                db.commit()
                db.refresh(s)
            all_shifts.append(s)

    # 5. Seed Locations & WorkLocations
    all_work_locations = []
    all_locations = []
    for comp in companies:
        loc_specs = LOCATIONS_BY_COMPANY.get(comp.code, [
            {"name": f"{comp.name} Headquarters", "city": "Melbourne", "lat": -37.8136 + random.uniform(-0.1, 0.1), "lng": 144.9631 + random.uniform(-0.1, 0.1), "work_locs": ["Main Entrance", "Operations Room", "Warehouse Facility", "Restroom Block"]}
        ])
        
        for l_spec in loc_specs:
            loc = db.query(Location).filter(Location.company_id == comp.id, Location.name == l_spec["name"]).first()
            if not loc:
                loc = Location(
                    name=l_spec["name"],
                    description=f"Operational site for {comp.name}",
                    contact_person=comp.contact_name,
                    contact_email=comp.contact_email,
                    contact_phone=comp.phone_number,
                    city=l_spec["city"],
                    state="VIC",
                    zip_code="3000",
                    latitude=l_spec["lat"],
                    longitude=l_spec["lng"],
                    company_id=comp.id,
                    is_active=True,
                    modified_by="Admin"
                )
                db.add(loc)
                db.commit()
                db.refresh(loc)
            all_locations.append(loc)

            # Work locations with QR code
            for w_idx, wl_name in enumerate(l_spec["work_locs"]):
                wl = db.query(WorkLocation).filter(WorkLocation.location_id == loc.id, WorkLocation.name == wl_name).first()
                if not wl:
                    qr_code = f"AURA-WL-{comp.code}-{loc.id:02d}-{w_idx+1:02d}"
                    wl = WorkLocation(
                        location_id=loc.id,
                        name=wl_name,
                        description=f"{wl_name} at {loc.name}",
                        latitude=loc.latitude + random.uniform(-0.002, 0.002),
                        longitude=loc.longitude + random.uniform(-0.002, 0.002),
                        qr_code_data=qr_code,
                        is_active=True,
                        modified_by="Admin"
                    )
                    db.add(wl)
                    db.commit()
                    db.refresh(wl)
                all_work_locations.append(wl)

    # 6. Seed 260+ Professionals & Corresponding User Accounts
    all_professionals = []
    existing_pro_count = db.query(Professional).count()
    target_pro_count = 260
    
    needed_pros = max(0, target_pro_count - existing_pro_count)
    if needed_pros > 0:
        print(f"Creating {needed_pros} professional profiles across all companies...")
        
        # Primary named demo professionals first
        primary_names = [
            ("Ushan", "Lokuge", "ushanlokuge@gmail.com", "0435159335", "Cleaning, Facility Management"),
            ("Sid", "Tamilselvan", "sidooaus@gmail.com", "0412222222", "Security, Inspection"),
            ("Giri", "Waulite", "vellingiri.d92@gmail.com", "0412345678", "Security, CCTV Monitoring"),
            ("Gertie", "Sharen", "gertie39girlz@gmail.com", "0432150445", "Commercial Cleaning"),
            ("Dhivya", "Baskar", "dhivya.b@waulite.com", "0498765432", "Security, Emergency Response"),
            ("Nuwan", "Perera", "nuwan@cleaningwizard.com.au", "0435125000", "Facility Maintenance, Cleaning"),
            ("Alexander", "Vance", "professional@auralinks.com", "0435159335", "HVAC, Mechanical & Security")
        ]
        
        for first, last, email, phone, skills in primary_names:
            p = db.query(Professional).filter(Professional.email == email).first()
            if not p:
                p = Professional(
                    first_name=first,
                    last_name=last,
                    email=email,
                    phone_number=phone,
                    skills=skills,
                    status="Accepted",
                    company_id=companies[0].id,
                    is_active=True,
                    modified_by="System Seed"
                )
                db.add(p)
                db.commit()
                db.refresh(p)
            all_professionals.append(p)
            
            # User record
            u = db.query(User).filter(User.email == email).first()
            if not u:
                u = User(
                    email=email,
                    hashed_password=get_password_hash("123456"),
                    first_name=first,
                    last_name=last,
                    phone=phone,
                    role="Professional",
                    company_id=companies[0].id,
                    is_active=True
                )
                db.add(u)
                db.commit()

        # Generate the rest
        current_count = db.query(Professional).count()
        remaining = target_pro_count - current_count
        for i in range(max(0, remaining)):
            first = random.choice(FIRST_NAMES)
            last = random.choice(LAST_NAMES)
            comp = companies[i % len(companies)]
            email = f"{first.lower()}.{last.lower()}{i+10}@{comp.code.lower()}.auralinks.com"
            phone = f"04{random.randint(10000000, 99999999)}"
            skills = random.choice(SKILL_SETS)

            p = Professional(
                first_name=first,
                last_name=last,
                email=email,
                phone_number=phone,
                skills=skills,
                status="Accepted",
                company_id=comp.id,
                is_active=True,
                modified_by="System Admin"
            )
            db.add(p)
            
            # User account
            u = User(
                email=email,
                hashed_password=get_password_hash("123456"),
                first_name=first,
                last_name=last,
                phone=phone,
                role="Professional",
                company_id=comp.id,
                is_active=True
            )
            db.add(u)

            if i % 50 == 0:
                db.commit()

        db.commit()

    all_professionals = db.query(Professional).all()
    print(f"Total verified professionals in system: {len(all_professionals)}")

    # 7. Seed Task Templates & Items
    all_templates = []
    for comp in companies:
        for cat in TEMPLATE_CATALOG:
            t = db.query(TaskTemplate).filter(TaskTemplate.company_id == comp.id, TaskTemplate.name == cat["name"]).first()
            if not t:
                t = TaskTemplate(
                    name=cat["name"],
                    description=f"{cat['category']} standard operating template for {comp.name}",
                    company_id=comp.id,
                    is_active=True,
                    modified_by="Admin"
                )
                db.add(t)
                db.commit()
                db.refresh(t)

                for item_name, item_desc, mins, prio in cat["items"]:
                    t_item = TaskTemplateItem(
                        template_id=t.id,
                        category_name=cat["category"],
                        task_name=item_name,
                        description=item_desc,
                        estimated_minutes=mins,
                        priority=prio
                    )
                    db.add(t_item)
                db.commit()
            all_templates.append(t)

    # 8. Seed 1,000+ Tasks (TaskSchedule and TaskScheduleDetail)
    current_details_count = db.query(TaskScheduleDetail).count()
    needed_tasks = max(0, 1050 - current_details_count)
    
    if needed_tasks > 0:
        print(f"Generating {needed_tasks} task assignments across companies and locations...")
        
        pro_names = [f"{p.first_name} {p.last_name}" for p in all_professionals]
        
        statuses = ["YetToStart", "InProgress", "Ended", "Scheduled"]
        status_weights = [0.45, 0.25, 0.20, 0.10]
        
        # Date range: Today, yesterday, upcoming 7 days
        today = datetime.now()
        dates = [(today + timedelta(days=d)).strftime("%Y-%m-%d") for d in range(-2, 8)]

        created_details = 0
        schedule_batch = []
        
        while created_details < needed_tasks:
            comp = random.choice(companies)
            comp_locs = [l for l in all_locations if l.company_id == comp.id]
            if not comp_locs:
                comp_locs = all_locations[:3]
            loc = random.choice(comp_locs)
            
            comp_work_locs = [wl for wl in all_work_locations if wl.location_id == loc.id]
            if not comp_work_locs:
                comp_work_locs = all_work_locations[:5]
            
            comp_templates = [t for t in all_templates if t.company_id == comp.id]
            if not comp_templates:
                comp_templates = all_templates[:5]
            tmpl = random.choice(comp_templates)
            
            # Select 1 to 3 professionals (with preference for company or primary demo professionals)
            comp_pros = [f"{p.first_name} {p.last_name}" for p in all_professionals if p.company_id == comp.id]
            if not comp_pros or random.random() < 0.3:
                # Include demo users
                assigned_names = random.sample(pro_names, min(2, len(pro_names)))
                if "Ushan Lokuge" not in assigned_names and random.random() < 0.2:
                    assigned_names.append("Ushan Lokuge")
            else:
                assigned_names = random.sample(comp_pros, min(2, len(comp_pros)))
                
            sched_date = random.choice(dates)
            shift_info = random.choice(SHIFTS_LIST)
            shift_display = f"{shift_info[0]} ({shift_info[1]} - {shift_info[2]})"
            
            sched = TaskSchedule(
                template_id=tmpl.id,
                location_id=loc.id,
                company_id=comp.id,
                assigned_professionals_json=json.dumps(assigned_names),
                is_recursive=random.choice([True, False]),
                exclude_holidays=False,
                scheduled_date=sched_date,
                status="Scheduled",
                modified_by="Operations Roster"
            )
            db.add(sched)
            db.commit()
            db.refresh(sched)
            
            # Generate detail items for this schedule
            for item in tmpl.items:
                if created_details >= needed_tasks:
                    break
                    
                target_wl = random.choice(comp_work_locs)
                item_status = random.choices(statuses, weights=status_weights)[0]
                
                # If date is in the past, mark as Ended
                if sched_date < today.strftime("%Y-%m-%d"):
                    item_status = "Ended"
                elif sched_date > today.strftime("%Y-%m-%d") and item_status == "InProgress":
                    item_status = "YetToStart"
                    
                d = TaskScheduleDetail(
                    schedule_id=sched.id,
                    category_name=item.category_name,
                    task_name=item.task_name,
                    description=item.description,
                    work_location_name=target_wl.name,
                    shift_name=shift_display,
                    is_recursive=sched.is_recursive,
                    assigned_professionals_json=json.dumps(assigned_names),
                    status=item_status
                )
                db.add(d)
                created_details += 1

            if created_details % 100 == 0:
                db.commit()
                print(f"  ... seeded {created_details}/{needed_tasks} task items")

        db.commit()

    total_tasks = db.query(TaskScheduleDetail).count()
    print(f"Total active & scheduled tasks in system: {total_tasks}")

    # 9. Seed Notifications
    notif_count = db.query(Notification).count()
    if notif_count < 20:
        sample_notifs = [
            ("New Task Assignment: HVAC Overhaul", "You have been dispatched to The Glen Mall for air filter replacement and differential pressure audit.", "task_assigned"),
            ("Shift Reminder: Morning Shift 08:00", "Your morning shift at Spotlight Cranbourne starts in 30 minutes. Please check-in via QR code.", "info"),
            ("Attendance Verified", "Your completed task at Dandenong Hub has been logged. Total shift duration: 8h 00m.", "success"),
            ("Facility Inspection Scheduled", "Security perimeter sweep assigned for Sydney Financial Tower.", "task_assigned"),
            ("Cleanroom Sterilization Alert", "Biohazard cleanroom protocol scheduled for St. Jude Metropolitan Hospital.", "warning")
        ]
        for title, msg, ntype in sample_notifs:
            n = Notification(
                user_id=company_admins[0].id if company_admins else 1,
                title=title,
                message=msg,
                type=ntype,
                is_read=False
            )
            db.add(n)
        db.commit()

    # 10. Backfill Job IDs and Task IDs for existing records
    unlabeled_jobs = db.query(TaskSchedule).filter(TaskSchedule.job_id.is_(None)).all()
    for j in unlabeled_jobs:
        j.job_id = f"JOB-{j.id:04d}"
        if not j.title:
            tmpl = db.query(TaskTemplate).filter(TaskTemplate.id == j.template_id).first() if j.template_id else None
            j.title = (tmpl.name if tmpl else f"Service Job #{j.id}")
        if not j.start_time:
            j.start_time = "09:00"
        if not j.end_time:
            j.end_time = "11:00"
    db.commit()

    unlabeled_tasks = db.query(TaskScheduleDetail).filter(TaskScheduleDetail.task_id.is_(None)).all()
    for d in unlabeled_tasks:
        d.task_id = f"TSK-{d.id:04d}"
        if not d.priority:
            d.priority = "Normal"
        if not d.estimated_minutes:
            d.estimated_minutes = 30
    db.commit()

    # 11. Seed Multiple Jobs per day for demo Care Professional (Alex Vance)
    alex_user = db.query(User).filter(User.email == "professional@auralinks.com").first()
    first_company = companies[0] if companies else db.query(Company).first()
    loc = db.query(Location).filter(Location.company_id == first_company.id).first()
    
    if alex_user and loc:
        today_str = datetime.now().strftime("%Y-%m-%d")
        alex_name = f"{alex_user.first_name} {alex_user.last_name}"
        
        existing_alex_today = db.query(TaskSchedule).filter(
            TaskSchedule.company_id == first_company.id,
            TaskSchedule.scheduled_date == today_str,
            TaskSchedule.assigned_professionals_json.ilike(f"%{alex_name}%")
        ).count()
        
        if existing_alex_today < 2:
            demo_jobs_data = [
                {
                    "title": "Morning Medical Check & Vital Monitoring",
                    "start": "09:00",
                    "end": "11:00",
                    "tasks": [
                        ("Check Vital Signs & Blood Pressure", "Clinical Vitals", "Normal", 30),
                        ("Administer Scheduled Morning Medication", "Medication", "High", 25),
                        ("Complete Patient Daily Well-Being Log", "Documentation", "Normal", 20)
                    ]
                },
                {
                    "title": "Afternoon Rehabilitation & Mobility Care",
                    "start": "13:00",
                    "end": "15:30",
                    "tasks": [
                        ("Supervised Physiotherapy Exercises", "Rehabilitation", "Normal", 45),
                        ("Sanitization & Fresh Linen Replacement", "Sanitization", "Normal", 30)
                    ]
                },
                {
                    "title": "Late Afternoon Safety Sweep & Shift Handover",
                    "start": "16:30",
                    "end": "18:30",
                    "tasks": [
                        ("Facility Hazard Check & Equipment Audit", "Safety Inspection", "High", 35),
                        ("Supervisor Handover Briefing & Sign-Off", "Administration", "Normal", 20)
                    ]
                }
            ]

            for job_info in demo_jobs_data:
                j = TaskSchedule(
                    title=job_info["title"],
                    company_id=first_company.id,
                    location_id=loc.id,
                    work_location_name="Suite A, Main Facility",
                    assigned_professional_id=alex_user.id,
                    assigned_professional_name=alex_name,
                    assigned_professionals_json=json.dumps([alex_name]),
                    scheduled_date=today_str,
                    start_time=job_info["start"],
                    end_time=job_info["end"],
                    shift_name=f"Custom Window ({job_info['start']} - {job_info['end']})",
                    status="Scheduled",
                    modified_by="Company Admin"
                )
                db.add(j)
                db.commit()
                db.refresh(j)
                j.job_id = f"JOB-{j.id:04d}"
                db.commit()

                for t_name, t_cat, t_prio, t_mins in job_info["tasks"]:
                    t = TaskScheduleDetail(
                        schedule_id=j.id,
                        category_name=t_cat,
                        task_name=t_name,
                        description=f"Perform {t_name} according to standard company guidelines",
                        work_location_name="Suite A, Main Facility",
                        shift_name=f"{job_info['start']} - {job_info['end']}",
                        estimated_minutes=t_mins,
                        priority=t_prio,
                        assigned_professionals_json=json.dumps([alex_name]),
                        status="YetToStart"
                    )
                    db.add(t)
                    db.commit()
                    db.refresh(t)
                    t.task_id = f"TSK-{t.id:04d}"
                    db.commit()

    # 12. Seed Acceptance Scenario: Chennai Cleaning Services, Kumari, and Airport Entrance 10
    chennai_comp = db.query(Company).filter(Company.code == "CHNI01").first()
    if not chennai_comp:
        chennai_comp = Company(
            name="Chennai Cleaning Services",
            code="CHNI01",
            industry_type="Cleaning & Facility Services",
            contact_name="Ravi Kumar",
            contact_email="admin@chennaicleaning.com",
            phone_number="04422334455",
            website="www.chennaicleaning.com",
            billing_address1="12 Anna Salai",
            billing_city="Chennai",
            billing_state="Tamil Nadu",
            billing_zipcode="600002",
            is_active=True
        )
        db.add(chennai_comp)
        db.commit()
        db.refresh(chennai_comp)

        # Company Admin for Chennai Cleaning
        chennai_admin = User(
            email="admin@chennaicleaning.com",
            hashed_password=get_password_hash("password123"),
            first_name="Ravi",
            last_name="Kumar",
            phone="04422334455",
            role="Company Admin",
            company_id=chennai_comp.id,
            is_active=True,
            account_status="Active"
        )
        db.add(chennai_admin)

        # Department
        dept = Department(
            name="Sanitation & Housekeeping",
            description="Airport and Commercial Facility Cleaning",
            company_id=chennai_comp.id,
            is_active=True
        )
        db.add(dept)
        db.commit()
        db.refresh(dept)

        # Location
        loc_chennai = Location(
            name="Chennai International Airport Terminal",
            description="T2 Domestic & International Departure",
            contact_person="Ravi Kumar",
            contact_email="terminal.ops@chennaicleaning.com",
            city="Chennai",
            state="Tamil Nadu",
            zip_code="600027",
            latitude=12.9941,
            longitude=80.1709,
            company_id=chennai_comp.id,
            is_active=True
        )
        db.add(loc_chennai)
        db.commit()
        db.refresh(loc_chennai)

        wl_chennai = WorkLocation(
            location_id=loc_chennai.id,
            name="Airport Entrance Gate 10",
            description="Main Gate 10 and Public Concourse",
            latitude=12.9942,
            longitude=80.1710,
            qr_code_data="AURA-WL-CHNI-GATE10",
            is_active=True
        )
        db.add(wl_chennai)

        # Employee Kumari
        kumari_pro = Professional(
            employee_id="EMP-0010",
            first_name="Kumari",
            last_name="Raman",
            email="kumari@chennaicleaning.com",
            phone_number="0449887766",
            job_title="Cleaning Specialist",
            gender="Female",
            department_id=dept.id,
            skills="Sanitization, Deep Floor Cleaning, Waste Management",
            status="Accepted",
            account_status="Active",
            company_id=chennai_comp.id,
            is_active=True
        )
        db.add(kumari_pro)

        kumari_user = User(
            email="kumari@chennaicleaning.com",
            hashed_password=get_password_hash("password123"),
            first_name="Kumari",
            last_name="Raman",
            phone="0449887766",
            role="Professional",
            job_title="Cleaning Specialist",
            gender="Female",
            department_id=dept.id,
            company_id=chennai_comp.id,
            is_active=True,
            account_status="Active"
        )
        db.add(kumari_user)
        db.commit()

        # Job: Airport Entrance 10
        airport_job = TaskSchedule(
            title="Airport Entrance 10",
            job_id="JOB-0010",
            company_id=chennai_comp.id,
            location_id=loc_chennai.id,
            work_location_name="Airport Entrance Gate 10",
            assigned_professional_id=kumari_pro.id,
            assigned_professional_name="Kumari Raman",
            assigned_professionals_json=json.dumps(["Kumari Raman"]),
            scheduled_date=datetime.now().strftime("%Y-%m-%d"),
            start_time="09:00",
            end_time="11:00",
            shift_name="Morning Window (09:00 - 11:00)",
            status="InProgress",
            modified_by="Ravi Kumar"
        )
        db.add(airport_job)
        db.commit()
        db.refresh(airport_job)

        # 3 Tasks:
        # Task 1: Main Gate Cleaning - SubmittedForReview
        t1 = TaskScheduleDetail(
            task_id="TSK-0001",
            schedule_id=airport_job.id,
            category_name="Sanitation",
            task_name="Main Gate Cleaning",
            description="Clean the main entrance gate and surrounding area",
            work_location_name="Airport Entrance Gate 10",
            shift_name="09:00 - 11:00",
            estimated_minutes=30,
            priority="High",
            assigned_professional_name="Kumari Raman",
            assigned_professionals_json=json.dumps(["Kumari Raman"]),
            evidence_required=True,
            evidence_type="photo",
            status="SubmittedForReview",
            submitted_at=datetime.utcnow() - timedelta(minutes=45),
            notes="Gate wiped, railings disinfected, and glass polished."
        )
        db.add(t1)
        db.commit()
        db.refresh(t1)

        db.add(TaskEvidence(
            schedule_id=airport_job.id,
            task_detail_id=t1.id,
            uploaded_by="Kumari Raman",
            file_name="Gate_10_Entrance_Cleaned.jpg",
            file_type="image/jpeg",
            notes="Completed front entrance cleaning. All glass cleared.",
            submission_version=1,
            review_status="Pending"
        ))

        # Task 2: Toilet Cleaning - Completed
        t2 = TaskScheduleDetail(
            task_id="TSK-0002",
            schedule_id=airport_job.id,
            category_name="Hygiene",
            task_name="Toilet Cleaning",
            description="Clean and sanitize assigned toilet facilities",
            work_location_name="Airport Entrance Gate 10",
            shift_name="09:00 - 11:00",
            estimated_minutes=40,
            priority="Critical",
            assigned_professional_name="Kumari Raman",
            assigned_professionals_json=json.dumps(["Kumari Raman"]),
            evidence_required=True,
            evidence_type="checklist",
            status="Completed",
            completed_at=datetime.utcnow() - timedelta(hours=1),
            submitted_at=datetime.utcnow() - timedelta(hours=1, minutes=15),
            reviewed_at=datetime.utcnow() - timedelta(hours=1),
            reviewed_by="Ravi Kumar",
            notes="Full bleach wash, towel dispenser restocked, soap refilled."
        )
        db.add(t2)
        db.commit()
        db.refresh(t2)

        db.add(TaskEvidence(
            schedule_id=airport_job.id,
            task_detail_id=t2.id,
            uploaded_by="Kumari Raman",
            file_name="Restroom_Inspection_Sheet.pdf",
            file_type="application/pdf",
            notes="Restroom sanitized and restocked according to standard checklist.",
            submission_version=1,
            review_status="Approved",
            review_comments="All sanitization standards verified."
        ))

        # Task 3: Reception Cleaning - ReworkRequired
        t3 = TaskScheduleDetail(
            task_id="TSK-0003",
            schedule_id=airport_job.id,
            category_name="General",
            task_name="Reception Cleaning",
            description="Clean the reception area",
            work_location_name="Airport Entrance Gate 10",
            shift_name="09:00 - 11:00",
            estimated_minutes=25,
            priority="Normal",
            assigned_professional_name="Kumari Raman",
            assigned_professionals_json=json.dumps(["Kumari Raman"]),
            evidence_required=True,
            evidence_type="photo",
            status="ReworkRequired",
            submitted_at=datetime.utcnow() - timedelta(hours=2),
            reviewed_at=datetime.utcnow() - timedelta(hours=1, minutes=30),
            reviewed_by="Ravi Kumar",
            rejection_reason="Water streaks visible on reception counter glass and floor near corner. Please re-buff.",
            notes="Initial dust and vacuum completed."
        )
        db.add(t3)
        db.commit()
        db.refresh(t3)

        db.add(TaskEvidence(
            schedule_id=airport_job.id,
            task_detail_id=t3.id,
            uploaded_by="Kumari Raman",
            file_name="Reception_Desk_Angle1.jpg",
            file_type="image/jpeg",
            notes="First pass floor cleaning.",
            submission_version=1,
            review_status="Rejected",
            review_comments="Streaks visible on reception glass. Please re-buff."
        ))

        # Add Audit logs for Chennai Cleaning
        db.add(AuditLog(
            company_id=chennai_comp.id,
            action="COMPANY_CREATED",
            target_type="Company",
            target_id=str(chennai_comp.id),
            details="Chennai Cleaning Services created by Super Admin."
        ))
        db.add(AuditLog(
            company_id=chennai_comp.id,
            action="CREATE_COMPANY_ADMIN",
            target_type="User",
            target_id=str(chennai_admin.id),
            details="Company Admin Ravi Kumar provisioned."
        ))
        db.add(AuditLog(
            company_id=chennai_comp.id,
            action="EMPLOYEE_CREATED",
            target_type="Professional",
            target_id=str(kumari_pro.id),
            details="Employee EMP-0010 (Kumari Raman) created as Cleaning Specialist."
        ))
        db.add(AuditLog(
            company_id=chennai_comp.id,
            action="CREATE_JOB",
            target_type="Job",
            target_id=airport_job.job_id,
            details="Created Job Airport Entrance 10 (JOB-0010) with 3 tasks assigned to Kumari Raman."
        ))
        db.add(AuditLog(
            company_id=chennai_comp.id,
            action="TASK_SUBMITTED",
            target_type="Task",
            target_id=t1.task_id,
            details="Kumari Raman submitted Main Gate Cleaning with photo evidence."
        ))
        db.add(AuditLog(
            company_id=chennai_comp.id,
            action="TASK_APPROVED",
            target_type="Task",
            target_id=t2.task_id,
            details="Toilet Cleaning approved by Ravi Kumar."
        ))
        db.add(AuditLog(
            company_id=chennai_comp.id,
            action="TASK_REWORK_REQUESTED",
            target_type="Task",
            target_id=t3.task_id,
            details="Rework requested on Reception Cleaning by Ravi Kumar: Streaks on glass."
        ))
        db.commit()

    print("=== Database Seeding Complete! 27 Companies, 260+ Professionals, 1,000+ Tasks Ready! ===")

if __name__ == "__main__":
    from app.database import SessionLocal, engine, Base
    Base.metadata.create_all(bind=engine)
    with SessionLocal() as session:
        seed_initial_data(session, force_reseed=True)

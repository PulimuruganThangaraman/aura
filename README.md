# AuraLinks (Aura) — Enterprise Multi-Tenant Workforce & Task Operations Platform

**AuraLinks** is an enterprise-grade workforce management, field operations, and task scheduling platform tailored for high-compliance industries such as **Disability & Aged Care (NDIS), Healthcare, Facility Management, and Field Services**. 

The system provides complete multi-tenant isolation, role-based governance, QR code & GPS-verified attendance, structured Job & Task scheduling, and cross-platform access across Web and Mobile.

---

## 🏗️ System Architecture Overview

```
                                  +---------------------------------------+
                                  |         AuraLinks Platform            |
                                  +---------------------------------------+
                                                     |
         +-------------------------------------------+-------------------------------------------+
         |                                           |                                           |
+-------------------+                       +-------------------+                       +-------------------+
|  React 19 Web App |                       |   FastAPI Backend |                       |   Flutter Mobile  |
|  (Admin & Portal) | <===================> |   (RESTful API)   | <===================> |  (Field Staff App)|
+-------------------+        JSON/JWT       +-------------------+        JSON/JWT       +-------------------+
         |                                           |                                           |
         * Multi-Tenant Governance                   * Multi-Tenant Isolation                   * QR Code Scanning
         * Super & Company Admin                     * RBAC & JWT Authentication                 * Geofence GPS Check-in
         * Interactive Recharts KPIs                 * Job & Task Engine                         * Day/Week Task Views
         * QR Voucher Generator                      * SQLite / PostgreSQL                       * Mobile Admin Dashboard
```

---

## 🚀 What Has Been Completed

### 1. Multi-Tenant Architecture & RBAC Engine
- **Tenant Isolation**: Strict scoping where data (users, jobs, tasks, locations, departments, shifts) belongs to individual tenant companies.
- **Three Core User Roles**:
  - **Super Admin**: Platform-wide visibility across all tenants, platform KPIs, tenant company provisioning, and direct Company Admin credential management.
  - **Company Admin**: Tenant-level operational management, company departments, facilities, staff roster, shifts, templates, and job assignments.
  - **Professional (Care/Field Staff)**: Dedicated view strictly filtered to assigned jobs and tasks, check-in, execution updates, and notes.
- **Security & Auth**: JWT-based Bearer authentication, bcrypt password hashing, and token expiration handling.

---

### 2. First-Class Job & Task Scheduling System
- **Dual-Tier Hierarchy**:
  - **Jobs (`JOB-XXXX`)**: High-level scheduled shifts or work orders defined by title, date, facility/work location, customized start/end time windows (e.g., `09:00 - 11:00`), and assigned professionals.
  - **Tasks (`TSK-XXXX`)**: Granular checklist items nested within jobs featuring category names, priorities (`Normal`, `High`, `Critical`), estimated minutes, and execution status (`YetToStart`, `InProgress`, `Completed`).
- **Flexible Time Windows**: Custom operational hours per job without hardcoded shift dependencies.
- **Collapsible Checklist Drawer**: Intuitive UI drawers allowing admins and supervisors to expand any job and inspect or update task items in real time.
- **Task Templates**: Standard operating procedure (SOP) library (e.g., *NDIS Quality Standards*, *Infection Control*, *Clinical Rounds*) enabling one-click cloning into live jobs.

---

### 3. QR Code & GPS Geofence Verification
- **Dynamic QR Code Generation**: Instant SVG/PNG QR generation tied to unique work location tokens.
- **Printable QR Badges**: Modal print engine supporting Small, Medium, and A4 placard sizes with company branding and instructions.
- **Geolocation & Distance Verification**: Haversine formula calculation on the backend to enforce check-in proximity against registered location latitude/longitude coordinates.

---

### 4. Web Frontend (React 19 + Vite + Tailwind CSS)
- **Executive & Cross-Tenant Dashboards**:
  - Super Admin view tracking **Total Companies**, **Total Care Staff**, **Total Jobs Created**, and **Completed Procedures**.
  - Company Admin view tracking real-time shift completion rates, task breakdown pie charts, and today's schedule roster.
  - Professional view featuring simplified personal task queues and completion logs.
- **Management Portals**:
  - **Companies Page**: Tenant directory, profile management, and Company Admin credential assignment.
  - **Scheduled Tasks Page**: Multi-filter board (date, staff, status, search), job builder modal with dynamic task line items, and job cancellation/completion controls.
  - **Task Templates Page**: SOP template builder, category tagging, and task item configuration.
  - **Work Locations & Facilities**: Multi-tier location hierarchy (Campus/Facility -> Work Zone/Room) with GPS coordinates and QR code actions.
  - **Departments & Shifts**: Department trees, work shifts with grace times and break intervals.
  - **Professionals & System Accounts**: Staff roster, status toggles (Active/Inactive), role delegation, and skill profiles.
  - **Reports & Auditing**: Cross-tenant attendance compliance logs, time audits, and export capabilities.
  - **Reusable Components**: Global navigation, responsive sidebar, reusable `Pagination` component, and high-contrast accessible layouts.

---

### 5. Cross-Platform Mobile Application (Flutter)
- **Cross-Platform Compatibility**: Android, iOS, and Web targets (`mobile_scanner`, `geolocator`, `dio`, `go_router`, `flutter_riverpod`).
- **Field Professional Workflow**:
  - Personalized Day, Week, Month, and All task lists with status filters.
  - Built-in camera QR scanner to verify arrival at the designated work location.
  - One-tap task lifecycle: **Start Task** -> **Add Progress Notes** -> **Complete Task**.
  - GPS-based attendance recording.
- **Mobile Admin Dashboard**:
  - High-level KPI summaries and staff status tracking directly from a smartphone or tablet.

---

### 6. Backend API & Verification Suite
- **FastAPI Endpoints**:
  - `/api/auth`: Login, user profiling, role validation, password resets.
  - `/api/dashboard`: Super Admin, Company Admin, and Professional aggregated analytics.
  - `/api/companies`: Tenant CRUD and Company Admin provisioning.
  - `/api/tasks`: First-class Job and Task scheduling, status updates, templates.
  - `/api/mobile`: High-throughput mobile task feed (1,000+ items), QR verification, GPS check-in, notifications.
  - `/api/locations` & `/api/work-locations`: Facility mapping, GPS geocoding, QR code data.
  - `/api/departments`, `/api/shifts`, `/api/professionals`, `/api/reports`: Supporting master data endpoints.
- **Automated Verification**: End-to-end test script (`backend/test_verification.py`) validating KPI metrics, company admin creation, job/task ID formatting (`JOB-XXXX`, `TSK-XXXX`), and role scoping.

---

## 📁 Repository Directory Structure

```text
Aura/
├── backend/                        # FastAPI Backend
│   ├── app/
│   │   ├── api/                    # API Route Handlers
│   │   │   ├── auth.py             # Authentication & User Management
│   │   │   ├── companies.py        # Tenant & Admin Management
│   │   │   ├── dashboard.py        # Analytics & Metrics Aggregation
│   │   │   ├── departments.py      # Department Hierarchy
│   │   │   ├── locations.py        # Site/Campus Locations
│   │   │   ├── mobile.py           # Mobile Feed, QR Check-in & GPS Geofence
│   │   │   ├── notifications.py    # Notification Dispatch
│   │   │   ├── professionals.py    # Staff Roster Management
│   │   │   ├── reports.py          # Attendance & Audit Reporting
│   │   │   ├── shifts.py           # Shift Configurations
│   │   │   ├── tasks.py            # Jobs, Tasks & SOP Templates
│   │   │   ├── users.py            # System User Administration
│   │   │   └── work_locations.py   # Work Zones & QR Generation
│   │   ├── database.py             # Database Engine & Session
│   │   ├── models.py               # SQLAlchemy ORM Models (User, Job, Task, Company, etc.)
│   │   ├── schemas.py              # Pydantic Request/Response Models
│   │   └── seed.py                 # Multi-Tenant Seed Data Generator
│   ├── auralinks.db                # SQLite Database (or PostgreSQL via ENV)
│   ├── main.py                     # FastAPI Application Entrypoint
│   ├── requirements.txt            # Python Dependencies
│   └── test_verification.py        # Automated End-to-End Test Suite
│
├── frontend/                       # React 19 + Vite Frontend
│   ├── src/
│   │   ├── api/
│   │   │   └── client.js           # Axios HTTP Client with Auth Interceptors
│   │   ├── components/             # Reusable UI Components
│   │   │   ├── Modals.jsx          # QR Code, Company, Shift & Job Creation Modals
│   │   │   ├── Navbar.jsx          # Top Navigation Bar with Quick Actions
│   │   │   ├── Pagination.jsx      # Universal Data Table Pagination
│   │   │   └── Sidebar.jsx         # Role-Aware Navigation Sidebar
│   │   ├── context/
│   │   │   └── AuthContext.jsx     # User Auth State & Role Context
│   │   ├── pages/                  # Application Views
│   │   │   ├── CompaniesPage.jsx       # Super Admin Tenant Management
│   │   │   ├── DashboardPage.jsx       # Role-Adaptive Analytics Dashboard
│   │   │   ├── DepartmentsPage.jsx     # Department Management
│   │   │   ├── LandingPage.jsx         # Public Welcome & Showcase
│   │   │   ├── LocationsPage.jsx       # Physical Facilities
│   │   │   ├── LoginPage.jsx           # Secure Authentication Portal
│   │   │   ├── ProfessionalsPage.jsx   # Staff Roster & Skills
│   │   │   ├── ProfilePage.jsx         # User Preferences
│   │   │   ├── ReportsPage.jsx         # Compliance & Attendance Reports
│   │   │   ├── ScheduleTasksPage.jsx   # Job Scheduling Board with Task Drawers
│   │   │   ├── ShiftsPage.jsx          # Operational Shift Setup
│   │   │   ├── SystemAccountsPage.jsx  # System User Management
│   │   │   ├── TaskTemplatesPage.jsx   # Standard Checklist Templates
│   │   │   └── WorkLocationsPage.jsx   # Zones & QR Badge Generation
│   │   ├── App.jsx                 # Routing & Layout Shell
│   │   ├── main.jsx                # DOM Mounting
│   │   └── index.css               # Styling & Tailwind CSS Directives
│   ├── package.json                # Frontend Dependencies & Scripts
│   └── vite.config.js              # Vite Build Configuration
│
├── mobile/                         # Flutter Cross-Platform Mobile App
│   ├── lib/
│   │   ├── api/                    # Dio Client & REST Endpoints
│   │   ├── config/                 # App Colors, Themes & Route Config
│   │   ├── models/                 # Data Models (Task, Job, Company, User, Attendance)
│   │   ├── providers/              # Riverpod State Management Providers
│   │   ├── screens/                # UI Screens (Home, QR Scanner, Attendance, Tasks, Admin)
│   │   ├── services/               # GPS Location & Task Background Services
│   │   └── main.dart               # Flutter Main Entrypoint
│   ├── pubspec.yaml                # Flutter Dependencies & Assets
│   └── serve_web.py                # Local Web Preview Server
│
├── render.yaml                     # Cloud Deployment Blueprint
└── README.md                       # Complete Project Documentation
```

---

## 🛠️ Technology Stack

| Domain | Technology | Key Highlights |
|---|---|---|
| **Backend** | Python 3.10+, FastAPI | High performance, auto-documented OpenAPI docs (`/docs`), Pydantic v2 validation |
| **Database** | SQLAlchemy 2.0, SQLite / PostgreSQL | Robust relational schemas, foreign key cascade actions, tenant filtering |
| **Authentication** | JWT (python-jose), Passlib (bcrypt) | Stateless tokens, role claims, secure salted passwords |
| **Web Frontend** | React 19, Vite, Tailwind CSS 4 | Fast HMR, responsive styling, dark/light visual hierarchy |
| **Icons & Charts** | Lucide React, Recharts | Interactive SVG pie & bar charts, enterprise icon set |
| **Mobile App** | Flutter 3.x, Dart 3.x | Riverpod 2.5, Dio, Mobile Scanner (Camera), Geolocator |
| **Deployment** | Render Blueprint (`render.yaml`) | Production container orchestration |

---

## ⚡ Quick Start & Running Locally

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create and activate a Python virtual environment (Windows)
python -m venv venv
.\venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Seed the database with sample companies, jobs, tasks, and users
python -m app.seed

# Run the backend server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```
- Swagger API Documentation: `http://localhost:8000/docs`
- Health Check: `http://localhost:8000/`

---

### 2. Frontend Web Setup

```bash
# Navigate to frontend directory
cd frontend

# Install npm packages
npm install

# Start Vite development server
npm run dev
```
- Web Application URL: `http://localhost:5173`

---

### 3. Mobile App Setup (Flutter)

```bash
# Navigate to mobile directory
cd mobile

# Fetch Flutter dependencies
flutter pub get

# Run on connected device or Chrome
flutter run -d chrome
# OR start mobile web runner
python serve_web.py
```

---

### 4. Running Verification Tests

To verify backend integrity, database calculations, and first-class Job/Task formatting:
```bash
cd backend
python test_verification.py
```

---

## 🔑 Default Demo Accounts

The database comes pre-seeded with test accounts for each role (Password: `password123`):

| Role | Email | Access Scope |
|---|---|---|
| **Super Admin** | `superadmin@auralinks.com` | Global access across all tenant companies, platform metrics, and admin provisioning. |
| **Company Admin** | `admin@firstcare.com` | Full administrative control over "FirstCare Disability Services" tenant data. |
| **Company Admin** | `admin@apexhealth.com` | Full administrative control over "Apex Care Group" tenant data. |
| **Professional** | `alex.vance@firstcare.com` | Personal schedule, assigned jobs, task execution, and QR check-in. |
| **Professional** | `sarah.jenkins@apexhealth.com` | Personal schedule and field tasks for Apex Care Group. |

---

## 📄 License
This project is proprietary enterprise software developed for **AuraLinks**. All rights reserved.

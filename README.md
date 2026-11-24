# CivicSolve AI — AI-Powered Civic Problem Solving & Innovation Platform

CivicSolve AI is a complete, modern, responsive, and functional full-stack web application designed for civic grievance redressal, municipal workflow automation, and university innovation collaboration.

---

## 🌟 Key Capabilities

1. **Citizen Grievance Redressal:**
   - 5-step guided reporting wizard with interactive location geolocation, photo evidence, and live AI priority calculation.
   - Unique report ID generation (`CS-2026-0001` format).
   - Real-time status stepper timeline.
   - Upvoting, community comments, and post-resolution satisfaction feedback.

2. **Modular Explainable AI Engine:**
   - **Category Classifier:** Keyword and semantic pattern matching across 10 municipal categories.
   - **Priority Scoring (0 to 100):** Multi-factor priority estimation analyzing user urgency, pedestrian risk, and safety hazards (e.g., live wires, open manholes, cave-ins).
   - **Duplicate Detection:** Scikit-Learn TF-IDF vectorization and cosine similarity paired with Haversine geographic proximity to flag redundant reports.
   - **Department Routing:** Automated mapping from category and ward to municipal bodies.

3. **Role-Based Access Control (RBAC):**
   - 8 authenticated user roles with strict backend permission enforcement:
     - `CITIZEN`
     - `AUTHORITY_OFFICER`
     - `GOVERNMENT_OFFICIAL`
     - `SYSTEM_ADMIN`
     - `STUDENT_TEAM`
     - `FACULTY_MENTOR`
     - `INDUSTRY_PARTNER`
     - `UNIVERSITY_TEAM`
   - Zero self-privilege escalation (public registrations cannot self-assign administrative roles).

4. **Municipal Governance & Field Operations:**
   - **Admin Console:** Verification queue, priority/category adjustments, duplicate candidate review, department & officer assignment, user management, and audit logs.
   - **Field Officer Console:** Assigned cases, status transitions (`IN_PROGRESS` → `RESOLVED`), progress notes, and resolution proof.
   - **Government Command Center:** Aggregated metrics, department workload, and interactive Leaflet OpenStreetMap with color-coded priority pins.

5. **Solution Hub & Student Innovation Workspace:**
   - Separate research and prototype pipeline for university engineering teams.
   - Proposal submissions, milestone tracking, sprint task boards, faculty mentor evaluations, and industry pilot trial requests.

---

## 🛠️ Technology Stack

- **Frontend:** React 18, Vite, Tailwind CSS, Lucide Icons, Leaflet & React-Leaflet, React Router DOM v6.
- **Backend:** Python 3.10+, FastAPI, Uvicorn, SQLAlchemy 2.0, Pydantic v2, Scikit-learn, Bcrypt, Python-Jose (JWT).
- **Database:** SQLite (default zero-config local setup) or PostgreSQL via `DATABASE_URL`.
- **Testing:** PyTest, FastAPI TestClient.

---

## 🚀 Beginner-Friendly Windows PowerShell Setup Guide

Follow these exact steps in Windows PowerShell to run the application locally.

### 1. Prerequisites Check
Ensure Python and Node.js are installed:
```powershell
python --version   # Requires Python 3.10+
node --version     # Requires Node.js v18+
npm --version
```

### 2. Navigate to Project Directory
```powershell
cd c:\Users\HP\OneDrive\Desktop\civicai
```

### 3. Activate Python Virtual Environment
The virtual environment is already created in `venv`:
```powershell
.\venv\Scripts\Activate.ps1
```
*(If PowerShell displays an ExecutionPolicy error, run `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass` and re-activate).*

### 4. Install Dependencies (If setting up on a new machine)
```powershell
.\venv\Scripts\python -m pip install -r backend\requirements.txt
cd frontend
npm install
cd ..
```

### 5. Seed the Database
Populate realistic demonstration data across all 8 roles, municipal departments, civic grievances, and innovation proposals:
```powershell
.\venv\Scripts\python backend\seed_data.py
```

### 6. Run Automated Backend Tests
Verify all 6 test suites (auth, RBAC security, end-to-end civic workflow, AI triage, and innovation hub):
```powershell
.\venv\Scripts\pytest -v
```

### 7. Start the FastAPI Backend Server
In your first PowerShell terminal, run:
```powershell
.\venv\Scripts\python -m uvicorn app.main:app --app-dir backend --reload --port 8000
```
- **Backend API:** `http://127.0.0.1:8000`
- **Interactive Swagger Docs:** `http://127.0.0.1:8000/docs`

### 8. Start the React Frontend Server
Open a second PowerShell terminal in the same directory:
```powershell
cd c:\Users\HP\OneDrive\Desktop\civicai\frontend
npm run dev
```
- **Frontend Application:** `http://localhost:5173`

---

## 👥 Seeded Demonstration Accounts

For college presentation and Smart India Hackathon grading, you can either click the **"Role: Evaluator Switcher"** button in the top navbar or use these verified seed credentials (Password for all: `Password123!`):

| Role | Seed Email | Description |
| :--- | :--- | :--- |
| **Citizen** | `citizen@civicsolve.demo` | Report grievances, upvote, comment, and submit satisfaction feedback |
| **Authority Officer** | `officer@civicsolve.demo` | Municipal Field Inspector managing assigned cases and updates |
| **System Admin** | `admin@civicsolve.demo` | Authenticate complaints, assign departments, audit user roles |
| **Government Official** | `official@civicsolve.demo` | Command center analytics, department workload, spatial GIS map |
| **Student Team** | `student@civicsolve.demo` | Team SmartRoads lead submitting proposals and sprint tasks |
| **Faculty Mentor** | `faculty@civicsolve.demo` | Review and evaluate student technical proposals |
| **Industry Partner** | `partner@civicsolve.demo` | UrbanInfra Ltd. requesting pilot trial collaborations |
| **University Cell** | `university@civicsolve.demo` | Campus innovation council overview |

---

## 🧪 Verification & Acceptance Checklist

- [x] **Responsive Navigation:** Sticky navbar, active route indicators, theme toggle (Dark/Light), and mobile drawer.
- [x] **5-Step Report Wizard:** Details, Geolocation with GPS, image upload with previews, live AI scoring preview, and persistent `CS-2026-XXXX` submission.
- [x] **AI Engine:** Real keyword extraction, multi-factor priority scoring (0-100), and TF-IDF duplicate similarity checking.
- [x] **Admin Verification:** 1-click verify/reject modal with reason logging and department routing.
- [x] **Authority Workflow:** Status transitions (`ASSIGNED` → `IN_PROGRESS` → `RESOLVED`) with progress notes and proof of resolution.
- [x] **Citizen Feedback:** Star rating (1-5) and satisfaction comments after grievance resolution.
- [x] **Solution Hub:** Separate research lifecycle for university teams with task tracking, milestones, and faculty mentorship.
- [x] **Interactive GIS Map:** Leaflet map with OpenStreetMap tiles and priority-colored pins.
- [x] **Automated Tests:** 100% passing PyTest suite verifying all workflows and security restrictions.


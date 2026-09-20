# AURIX — AI Business Process Intelligence & Automation Orchestration Platform

> **"Client ka apna CRM data uthao, process bottleneck dikhao, ek automation recommend karo, human se approve karao, aur ROI number screen par le aao — 60 second me."**

AURIX is a full-stack pre-sales ROI engine engineered for the **LJ University B.Tech Hackathon 2026**. It analyzes CRM exports, identifies operational bottlenecks using a deterministic rule engine, facilitates human-in-the-loop approval, simulates automation orchestration, and calculates quantified economic and capacity impact.

---

## 1. Problem Statement & Solution

* **The Problem**: B2B consulting firms and enterprise sales organizations spend days manually auditing customer CRM exports to locate conversion drop-offs, slow first-contact latencies, and stale pipelines.
* **The Solution**: AURIX ingests CRM datasets, computes lifecycle conversion funnels with Pandas, diagnoses bottlenecks via rule heuristics, and demonstrates immediate simulated time/revenue impact within a 60-second live demonstration.

---

## 2. Core 60-Second Workflow

```
Client CRM Data (.csv / seed)
           ↓
Pandas Descriptive Analysis (Funnel conversion, latency)
           ↓
Rule Engine (R1: Slow Response, R2: Stale Pipeline, R3: Drop-off)
           ↓
Human-in-the-Loop Approval (Modal confirmation)
           ↓
Simulated Workflow Execution (Audit logging)
           ↓
Impact & ROI Engine (Hours saved, recovered leads, revenue opportunity)
```

---

## 3. Technology Stack

* **Frontend**:
  * React 19 / Vite 8
  * Tailwind CSS (Enterprise Design System)
  * Recharts (Horizontal Before vs After latency visualizer)
  * Lucide React (Contextual micro-interactions)
* **Backend**:
  * Python 3.11+
  * Django 5.2 + Django REST Framework (DRF)
  * `django-cors-headers`
  * Pandas 3.0 (Descriptive telemetry analysis)
* **Database**:
  * SQLite (`db.sqlite3`) via Django ORM

---

## 4. Project Structure

```
AURIX/
├── frontend/
│   ├── package.json
│   ├── vite.config.js
│   ├── index.html
│   └── src/
│       ├── App.jsx                  # 3-screen state machine & orchestration flow
│       ├── index.css                # Enterprise design tokens, keyframes, grid background
│       ├── api/
│       │   └── api.js               # Centralized client (JWT session + Django REST endpoints)
│       └── components/
│           ├── StartupSplash.jsx    # 1-second crisp enterprise startup sequence
│           ├── Header.jsx           # B2B header with animated progress connectors
│           ├── UploadPanel.jsx      # Multi-state drag & drop dropzone + seed trigger
│           ├── Stepper.jsx          # 4-stage diagnostic stepper with scanning telemetry
│           ├── MetricTile.jsx       # Tabular counters with natural count-up & finish pop
│           ├── ProcessFunnel.jsx    # Horizontal CRM stage health & bottleneck badge
│           ├── FindingCard.jsx      # Reusable recommendation card with states
│           ├── ConfirmDialog.jsx    # Scaled modal approval dialog
│           ├── ImpactSummary.jsx    # Recharts comparison + easeOutCubic ROI count-up
│           ├── ExecutionLog.jsx     # Progressive audit trail with Indian SMEs
│           └── Toast.jsx            # Non-intrusive action feedback toasts
│
├── backend/
│   ├── manage.py
│   ├── requirements.txt
│   ├── db.sqlite3
│   ├── aurix_backend/
│   │   ├── settings.py              # CORS, DRF, SQLite configuration
│   │   ├── urls.py                  # API route inclusion (/api/)
│   │   ├── asgi.py
│   │   └── wsgi.py
│   └── api/
│       ├── models.py                # Lead, AnalysisRun, Recommendation, Execution, ExecutionItem
│       ├── serializers.py          # DRF serializers
│       ├── views.py                # Class-based views for all 7 API endpoints
│       ├── urls.py                 # Endpoint URL routes
│       └── services/
│           ├── seed.py             # Realistic 312 Indian SME lead generator with bottlenecks
│           ├── ingest.py           # Flexible CSV column normalizer and importer
│           ├── analyzer.py         # Pandas pipeline conversion and latency engine
│           ├── rules.py            # R1, R2, R3 deterministic bottleneck rules
│           ├── executor.py         # Simulated execution and telemetry audit recorder
│           └── impact.py           # Mathematical ROI and capacity recapture formulas
│
├── README.md
└── package.json                     # Root scripts for npm run dev
```

---

## 5. Local Setup & Execution Guide (Windows / Mac / Linux)

### Prerequisites
* **Node.js** v18+ & **npm**
* **Python** 3.11+

### Step 1: Backend Setup (Django REST Framework)
Open a terminal in the project root:

```bash
cd backend

# 1. Create Python virtual environment
python -m venv venv

# 2. Activate virtual environment (Windows PowerShell)
venv\Scripts\activate
# Or on Linux/macOS:
# source venv/bin/activate

# 3. Install Python dependencies
pip install -r requirements.txt

# 4. Run database migrations
python manage.py makemigrations
python manage.py migrate

# 5. Start the Django API server on port 8000
python manage.py runserver 8000
```
* Backend will be active at: `http://localhost:8000/`

### Step 2: Frontend Setup (React + Vite)
Open a second terminal:

```bash
cd frontend

# 1. Install npm packages
npm install

# 2. Start the Vite development server
npm run dev
```
* Frontend will be active at: `http://localhost:5173/`

---

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/health` | Service health status | No |
| `POST` | `/api/auth/signup` | Register new consultant user, returns JWT tokens | No |
| `POST` | `/api/auth/login` | Authenticate with email/username & password, returns JWT | No |
| `POST` | `/api/auth/refresh` | Refresh expired access token | No |
| `GET` | `/api/auth/me` | Fetch authenticated user profile | **Yes (Bearer)** |
| `POST` | `/api/auth/logout` | Discard tokens & invalidate session | No |
| `POST` | `/api/seed` | Generates 312 seeded SME leads, evaluates rules, returns `run_id` | **Yes (Bearer)** |
| `POST` | `/api/upload` | Multipart CSV upload, processes file, returns `run_id` | **Yes (Bearer)** |
| `GET` | `/api/runs/{id}/metrics` | Returns CRM summary metrics & 5-stage funnel drop-off | **Yes (Bearer)** |
| `GET` | `/api/runs/{id}/recommendations`| Returns sorted bottleneck rules (HIGH, MEDIUM, LOW) | **Yes (Bearer)** |
| `POST` | `/api/recommendations/{id}/approve` | Approves recommendation & creates simulated execution | **Yes (Bearer)** |
| `POST` | `/api/recommendations/{id}/reject` | Marks recommendation as rejected | **Yes (Bearer)** |
| `GET` | `/api/executions/{id}/impact` | Computes ROI impact, hours saved, and execution audit logs | **Yes (Bearer)** |

---

### Local Admin Superuser Bootstrap

To bootstrap or update the local development admin account safely without storing credentials in source files:

```bash
# Set environment variables
$env:DJANGO_SUPERUSER_USERNAME="ved"
$env:DJANGO_SUPERUSER_PASSWORD="<your-secure-password>"
$env:DJANGO_SUPERUSER_EMAIL="ved@aurix.local"

# Run bootstrap command
python manage.py bootstrap_admin
```

---

## 7. Mathematical Impact Model

* **Hours Saved / Month**:
  $$\text{Hours Saved} = \frac{\text{Affected Leads} \times 12\text{ min}}{60} \times \left(\frac{30}{\text{Dataset Span Days}}\right)$$
* **Recovered Leads**:
  $$\text{Recovered Leads} = \text{Affected Leads} \times 0.35$$
* **Revenue Opportunity**:
  $$\text{Revenue Opportunity (INR)} = \text{Recovered Leads} \times \text{Average Deal Value} \times \text{Win Rate}$$

---

## 8. Defensible Demo Answers for Judges

* **"Where is the AI?"**
  * *Answer*: "AURIX utilizes operational telemetry analysis paired with a deterministic expert rule engine to isolate latency deviations and handoff drop-offs. Machine learning predictive models and LLM automation generators represent our Phase 2 roadmap."
* **"Does it send live WhatsApp / email messages?"**
  * *Answer*: "No. AURIX is a pre-sales estimation sandbox. It simulates execution against target lead cohorts to calculate and defend ROI before a client commits capital to live integrations."
* **"Is the revenue guaranteed?"**
  * *Answer*: "No. The interface clearly communicates: *'Simulated impact — based on your dataset and industry benchmarks.'*"

---

## 9. Automated Testing & Verification
The platform includes an automated Django test suite covering Authentication, Ingest, Analyzer, Rule Engine, State Guards, Impact Calculation, and Cross-User Data Isolation:

```bash
cd backend
python manage.py test api
```

All 23 comprehensive test cases run against an isolated test SQLite database to verify:
* JWT authentication tokens and duplicate signup prevention
* Strict user ownership and cross-tenant isolation (404/403 guards)
* Rule engine activation thresholds (R1 > 4h, R2 > 15% stale, R3 < 40% conversion)
* Atomic database transactions preventing double approvals (HTTP 409)
* Pure mathematical ROI impact calculations with zero hardcoded values

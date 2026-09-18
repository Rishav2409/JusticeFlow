# NyayaFlow — Legal-Aid Case Screening Assistant

> **Review 1 Prototype** — Hackathon MVP

A pre-screening and workflow-assistance tool for panel lawyers and legal-aid clinic staff. NyayaFlow helps identify undertrial prisoners who may be approaching or have crossed statutory detention thresholds, enabling faster case triage and follow-up.

---

## ⚖️ Important Disclaimer

> **This prototype provides preliminary case screening based on configured statutory rules. It does not constitute legal advice, determine final entitlement to bail, or replace review by a qualified legal professional or competent court.**

All case data in this demo is **synthetic**. No real prisoner data is used.

---

## 🔍 Problem

There is an operational gap between *identifying potentially eligible undertrial prisoners* and *taking the next legal-aid action* (lawyer review, preparing an application). Existing UTRC / e-Prisons / e-Courts processes are **not replaced** by this project.

NyayaFlow sits as a **pre-screening and workflow-assistance layer** that helps a legal-aid worker:

1. Enter case information
2. Select an offence from a controlled database
3. Automatically retrieve the statutory maximum punishment
4. Calculate the relevant detention period
5. Apply predefined statutory screening rules
6. Produce an explainable preliminary result

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────┐
│                    BROWSER (React)                   │
│  ┌──────────┐  ┌──────────────┐  ┌───────────────┐  │
│  │ Case List │  │ Case Entry   │  │ Case Result   │  │
│  │          │  │ + Offence    │  │ + Explainable │  │
│  │          │  │   Search     │  │   Screening   │  │
│  └──────────┘  └──────────────┘  └───────────────┘  │
└──────────────────────┬──────────────────────────────┘
                       │ REST API (JSON)
┌──────────────────────┴──────────────────────────────┐
│                EXPRESS.JS BACKEND                     │
│  ┌────────────┐  ┌────────────┐  ┌───────────────┐  │
│  │ /api/cases │  │/api/offences│  │/api/eligibility│  │
│  └─────┬──────┘  └─────┬──────┘  └──────┬────────┘  │
│        │               │                │            │
│  ┌─────┴───────────────┴────────────────┴─────────┐  │
│  │        ELIGIBILITY ENGINE (Deterministic)       │  │
│  │        backend/src/rules/eligibilityEngine.js   │  │
│  └─────────────────────┬──────────────────────────┘  │
│                        │                             │
│  ┌─────────────────────┴──────────────────────────┐  │
│  │              SQLite Database                    │  │
│  │      offences table  │  cases table             │  │
│  └────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────┘
```

---

## 💻 Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS v4 |
| Backend | Node.js, Express.js |
| Database | SQLite (via better-sqlite3) |
| API | RESTful JSON |
| Testing | Node.js built-in test runner |
| Language | JavaScript (JSX) |

---

## 📊 Database Structure

### `offences` table

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER PK | Auto-increment |
| law_code | TEXT | e.g., "BNS" |
| section | TEXT | e.g., "303(2)" |
| offence_name | TEXT | Human-readable name |
| max_imprisonment_years | INTEGER | Maximum years |
| max_imprisonment_days | INTEGER | Additional days |
| death_or_life_exclusion | INTEGER | 1 if death/life is specified |
| source_reference | TEXT | Data provenance note |

### `cases` table

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER PK | Auto-increment |
| case_number | TEXT UNIQUE | User-supplied Case ID |
| prisoner_name | TEXT | Applicant name |
| fir_number | TEXT | FIR reference |
| district | TEXT | District |
| court | TEXT | Court name |
| lawyer | TEXT | Assigned lawyer |
| offence_id | INTEGER FK | → offences.id |
| custody_start_date | TEXT | ISO 8601 date |
| delay_days | INTEGER | Accused-attributable delay |
| first_time_offender | INTEGER | 0 or 1 |
| multiple_pending_cases | INTEGER | 0 or 1 |
| eligibility_status | TEXT | Computed status |
| eligibility_result | TEXT | Full JSON result |
| created_at | TEXT | Timestamp |

---

## ⚙️ Eligibility Engine

The eligibility engine (`backend/src/rules/eligibilityEngine.js`) is a **purely deterministic** rules engine. It does NOT use AI or LLM calls.

### Algorithm

```
1. EXCLUSION CHECKS (checked first):
   - Death/life imprisonment specified as punishment → EXCLUDED
   - Multiple pending cases/investigations → EXCLUDED

2. CALCULATION:
   Total custody days = calendar days from custody_start to reference_date
   Credited detention = total custody days − accused-attributable delay
   Max imprisonment (days) = (max_years × 365) + max_days

3. THRESHOLD:
   - First-time offender: 1/3 of max imprisonment
   - Otherwise: 1/2 of max imprisonment

4. COMPARISON:
   - Credited detention ≥ threshold → ELIGIBLE_NOW
   - Credited detention < threshold → NOT_YET_ELIGIBLE
```

### Date Calculation Convention

All date calculations use **calendar days** (difference in days between two dates). This convention is consistent across:
- Backend eligibility engine
- API responses
- Frontend display
- Unit tests

### Output States

| Backend Status | Frontend Display | Meaning |
|---------------|-----------------|---------|
| `ELIGIBLE_NOW` | 🟢 POTENTIALLY ELIGIBLE — LAWYER REVIEW REQUIRED | Credited detention ≥ threshold |
| `NOT_YET_ELIGIBLE` | 🔴 NOT CURRENTLY ELIGIBLE (or 🟡 APPROACHING if ≤30 days) | Below threshold |
| `EXCLUDED` | ⛔ EXCLUDED FROM THIS SCREENING RULE | Fails a prerequisite condition |

### Legal Basis

The screening rules are configured based on **Section 479 BNSS** (Bharatiya Nagarik Suraksha Sanhita, 2023).

> Procedural-law applicability in transitional cases requires professional verification.

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | Health check |
| `GET` | `/api/offences` | List all offences |
| `GET` | `/api/offences/search?q=theft` | Search offences |
| `POST` | `/api/cases` | Create case + calculate eligibility |
| `GET` | `/api/cases` | List all cases |
| `GET` | `/api/cases/:id` | Get case with full result |
| `POST` | `/api/eligibility/calculate` | Dry-run calculation (no save) |

### POST /api/cases — Request Body

```json
{
  "case_number": "CASE-001",
  "prisoner_name": "Demo Name",
  "fir_number": "FIR-2024-123",
  "district": "Demo District",
  "court": "Demo Court",
  "lawyer": "Adv. Demo",
  "offence_id": 1,
  "custody_start_date": "2024-11-01",
  "delay_days": 0,
  "first_time_offender": false,
  "multiple_pending_cases": false
}
```

---

## 🚀 Installation & Setup

### Prerequisites

- Node.js v18+ (v20+ recommended)
- npm v9+

### 1. Clone / Download the project

```bash
cd nyayaflow
```

### 2. Backend Setup

```bash
cd backend
npm install
npm run seed        # Seeds 12 mock offences
npm run seed:cases  # Seeds 6 demo cases
npm test            # Runs eligibility engine tests
npm run dev         # Starts backend on http://localhost:3000
```

### 3. Frontend Setup (in a new terminal)

```bash
cd frontend
npm install
npm run dev         # Starts frontend on http://localhost:5173
```

### 4. Open in browser

Navigate to: **http://localhost:5173**

---

## 🎯 Demo Cases

Six pre-loaded scenarios demonstrating different eligibility outcomes:

| Case | Scenario | Expected Result |
|------|----------|----------------|
| DEMO-001 | Ordinary undertrial (Theft, ~22 months custody) | 🟢 ELIGIBLE_NOW |
| DEMO-002 | First-time offender (Cheating, ~17 months, ⅓ threshold) | 🟢 ELIGIBLE_NOW |
| DEMO-003 | Below threshold (Grievous Hurt, ~9 months vs 3.5yr threshold) | 🔴 NOT_YET_ELIGIBLE |
| DEMO-004 | Multiple pending cases (Theft) | ⛔ EXCLUDED |
| DEMO-005 | Death/life punishment (Murder) | ⛔ EXCLUDED |
| DEMO-006 | Accused-attributable delay (Criminal Breach of Trust, 120 days excluded) | Depends on calculation |

---

## 🧪 Review 1 Demo Flow

### Demo 1 — Ordinary Undertrial
Enter a case with ~22 months custody for Theft (3-year max). System calculates: credited detention exceeds ½ threshold → **POTENTIALLY ELIGIBLE**.

### Demo 2 — First-Time Offender
Enter a first-time offender case. System applies ⅓ threshold instead of ½ → shows different threshold calculation.

### Demo 3 — Not Yet Eligible
Enter a case with short custody vs. long max sentence → **NOT YET ELIGIBLE** with days remaining.

### Demo 4 — Multiple Cases
Enter a case with multiple pending investigations → **EXCLUDED** with clear reason.

### Demo 5 — Death/Life Punishment
Select Murder offence → **EXCLUDED** (death/life specified as punishment).

### Demo 6 — Delay Subtraction
Enter a case with 120 days accused-attributable delay → shows delay subtracted from credited detention.

---

## ⚠️ Mock Data Notice

> **All offence data in this prototype is MOCK DATA for demonstration purposes only.** Statutory maximum punishment values, section numbers, and offence descriptions must be verified against the Bharatiya Nyaya Sanhita, 2023 (or applicable law) before any real-world use.

The database architecture is designed to allow replacing mock data with verified legal datasets **without changing the application logic**.

---

## 📋 Current Scope (Review 1)

✅ Case entry form with validation
✅ Offence search/autocomplete from controlled database
✅ SQLite database with offences + cases tables
✅ Deterministic eligibility engine (Section 479 BNSS screening)
✅ Explainable results with calculation breakdown
✅ Rule checks panel
✅ Case list with status indicators
✅ 6 demo scenarios
✅ Unit tests for eligibility engine
✅ Legal disclaimers throughout

---

## 🔮 Future Scope (Not in Review 1)

### Phase 2
- Dashboard with filters and sorting
- CSV bulk upload
- Urgency sorting
- Audit trail

### Phase 3
- Auto-generated application PDF
- Multilingual UI
- Analytics and district reports

### Future
- Broader UTRC screening criteria
- Document summarization
- WhatsApp/SMS workflow
- Voice-assisted entry
- Integration with authorized government systems (if access is officially provided)

---

## 🏛️ Legal Positioning

This application does NOT:
- Grant bail
- Determine a person's legal entitlement conclusively
- Replace a lawyer, court, UTRC, e-Prisons, or e-Courts
- Provide final legal advice

It provides **preliminary statutory screening** to assist legal-aid workers in identifying cases that may warrant further lawyer review.

---

## 👥 Team

Built by a team of 5 second-year B.Tech students during a ~30-hour hackathon.

---

## 📄 License

Hackathon prototype — not for production use.

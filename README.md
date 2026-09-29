# StudentPulse: Student Early Dropout Warning & Intervention System

StudentPulse is a full-stack academic decision-support application designed for educational institutions. It identifies students who may be at elevated risk of dropping out by analyzing academic indicators (attendance, internal test scores, assignment submission rates, and performance trends) and providing transparent human-readable explanations and intervention tracking.

---

## Key Features

- **Decision-Support Core**: Built around the workflow **DETECT → EXPLAIN → INTERVENE → MONITOR**.
- **ML Classification Engine**: Random Forest model trained on academic indicators to output continuous risk scores (0–100) and risk levels (`LOW`, `MEDIUM`, `HIGH`).
- **Transparent Explainability Layer**: Explains *why* a student was flagged by generating evidence-based rule breakdowns comparing current metrics against institutional thresholds.
- **Intervention Management**: Record, edit, assign, and monitor faculty support actions (counselling, remedial classes, mentoring, follow-up dates).
- **Risk History & Monitoring**: Stores historical risk assessments and visualizes risk trajectory over time using line charts.
- **Role-Based Access Control (RBAC)**: Distinct permissions for `ADMIN` (user management, student CRUD, system settings) and `FACULTY` (monitoring, reassessment, intervention logging).
- **Automated Fallback Architecture**: Seamlessly uses an in-memory MongoDB fallback and rule-based inference fallback if external services are offline.

---

## Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, React Router v6, Lucide Icons, Recharts.
- **Backend API**: Node.js, Express.js, Mongoose ODM, JWT, bcryptjs, mongodb-memory-server.
- **Machine Learning**: Python 3.12+, FastAPI, scikit-learn (Random Forest), pandas, numpy, joblib.
- **Database**: MongoDB (Local or In-Memory).

---

## System Architecture

```
                    FACULTY / ADMIN
                          |
                          v
                 React Frontend (Vite)
                          |
                          v
                 Node.js + Express API
                    /          \
                   /            \
                  v              v
             MongoDB        Python ML Service (FastAPI)
                                |
                                v
                         Trained ML Model
                                |
                                v
                         Risk Prediction
```

---

## Project Structure

```
StudentPulse/
├── server/               # Node.js + Express Backend API
│   ├── src/
│   │   ├── config/       # Database & environment config
│   │   ├── controllers/  # Route logic & controllers
│   │   ├── middleware/   # JWT auth & error handling
│   │   ├── models/       # Mongoose schemas (User, Student, RiskAssessment, etc.)
│   │   ├── routes/       # REST API endpoints
│   │   ├── utils/        # Explainability engine & seed data
│   │   └── server.js     # Entry point
│   └── tests/            # Integration test suite
├── ml/                   # Python Machine Learning Service
│   ├── data/             # studentpulse_demo_dataset.csv
│   ├── models/           # Saved model artifacts (.pkl)
│   ├── generate_dataset.py
│   ├── train_model.py
│   ├── evaluate_model.py
│   ├── predict.py
│   └── main.py           # FastAPI service endpoint
├── client/               # React + Vite Frontend
│   ├── src/
│   │   ├── components/   # Layouts, Cards, Badges, Modals
│   │   ├── pages/        # Dashboard, Students, Risk, Interventions, Analytics
│   │   ├── context/      # AuthContext
│   │   └── services/     # Axios API client
│   └── vite.config.js
└── docs/                 # Academic Project Documentation
```

---

## Quick Start Guide

### Prerequisites
- Node.js (v18+)
- Python (v3.10+) with `pip`

### 1. Python ML Service Setup
```bash
cd ml
py -m pip install -r requirements.txt
py generate_dataset.py
py train_model.py
py evaluate_model.py
py main.py
```
*The ML API runs at `http://127.0.0.1:8000`.*

### 2. Express Backend Setup
```bash
cd server
npm install
npm run seed     # (Optional manual seed; auto-seeds on first startup)
npm run dev
```
*The Express server runs at `http://localhost:5000`.*

### 3. React Frontend Setup
```bash
cd client
npm install
npm run dev
```
*The frontend application runs at `http://localhost:3000`.*

---

## Demo Accounts

| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin** | `admin@studentpulse.local` | `admin123` |
| **Faculty** | `faculty@studentpulse.local` | `faculty123` |

---

## Example Case (Rahul Kumar)

- **Student ID**: `CS2024001`
- **Department**: Computer Science (Semester S4)
- **Academic Metrics**:
  - Attendance: `52%`
  - Internal Marks: `48%`
  - Assignment Submission: `60%`
  - Previous Performance: `68%`
  - Recent Test Performance: `48%`
- **Model Output**:
  - **Risk Score**: `78 / 100`
  - **Risk Level**: `HIGH`
  - **Contributing Factors**: Attendance concern below 60%, internal performance drop, assignment lag.
  - **Suggested Interventions**: 1-on-1 faculty counselling, remedial class enrollment, assignment support.

---

## Limitations & Ethical Considerations

1. **Decision Support Only**: Risk scores are estimated risk indicators, not guaranteed probability of dropout. Faculty judgment remains paramount.
2. **Synthetic Data**: Prototype demo uses `studentpulse_demo_dataset.csv`. Deployment in actual educational institutions requires authorized institutional data.
3. **Data Privacy**: Academic records should be kept sensitive and compliant with educational privacy guidelines.

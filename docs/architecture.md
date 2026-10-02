# StudentPulse - System Architecture Documentation

## Overview
StudentPulse implements a 3-tier decoupled architecture:
1. **Presentation Layer (React + Vite + Tailwind CSS)**: Renders real-time dashboards, charts, and decision-support interfaces.
2. **Application Server Layer (Node.js + Express.js)**: Handles REST API endpoints, JWT authentication, role-based access control, database transactions, and transparent explainability translation.
3. **Machine Learning & Persistence Layer (Python FastAPI + MongoDB)**: Python executes model inference and training pipelines, while MongoDB provides schema-less persistence for academic records, assessments, and intervention histories.

## System Architecture Diagram

```
                       FACULTY / ADMIN
                             |
                             v
                 React Frontend (Vite)
                             |
                             v
                    Node.js + Express
                       Backend API
                       /         \
                      /           \
                     v             v
                MongoDB       Python ML Service
                                   |
                                   v
                            Trained ML Model
                                   |
                                   v
                            Risk Prediction
                                   |
                                   v
                         Express Backend API
                                   |
                                   v
                         React Dashboard UI
```

## Communication Protocols
- **Client <-> Backend**: HTTP RESTful JSON API with JWT Bearer Token authorization over Axios.
- **Backend <-> ML Service**: Internal HTTP RPC (`POST http://127.0.0.1:8000/predict`). If ML service is unavailable, Express backend activates a transparent mathematical fallback engine to ensure 100% uptime.
- **Backend <-> Database**: Mongoose ODM with automated fallback to `mongodb-memory-server` if local MongoDB daemon is offline.

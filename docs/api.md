# StudentPulse - REST API Reference

## Authentication
Headers: `Authorization: Bearer <JWT_TOKEN>`

### Auth Endpoints
- `POST /api/auth/login`: Authenticate user and retrieve JWT token.
- `GET /api/auth/me`: Get current authenticated user profile.

### Student Endpoints
- `GET /api/students`: List students with pagination, search, and filters.
- `GET /api/students/:id`: Get full profile, academic records, and risk history.
- `POST /api/students`: Create new student profile.
- `PUT /api/students/:id`: Update student metadata.
- `DELETE /api/students/:id`: Delete student record (Admin only).

### Risk Assessment Endpoints
- `POST /api/risk/assess`: Submit academic indicators for ML risk inference & explainability generation.
- `GET /api/risk/student/:studentId`: Retrieve risk assessment trajectory for a student.
- `GET /api/risk/high-risk`: List all students with HIGH risk status.
- `GET /api/risk/statistics`: Retrieve departmental and semester risk statistics.

### Intervention Endpoints
- `GET /api/interventions`: List recorded interventions with status/type filters.
- `POST /api/interventions`: Create new support intervention.
- `PUT /api/interventions/:id`: Update intervention status, outcome, or follow-up date.
- `DELETE /api/interventions/:id`: Remove intervention record.

### Dashboard & Analytics Endpoints
- `GET /api/dashboard/summary`: High-level counters and attention list.
- `GET /api/dashboard/alerts`: Dynamic system alerts from stored database records.

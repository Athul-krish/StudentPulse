# StudentPulse - Database Schema Documentation

## Models & Relations

### 1. User
- `name` (String, required)
- `email` (String, required, unique)
- `passwordHash` (String, required)
- `role` (Enum: `ADMIN`, `FACULTY`)
- `department` (String)

### 2. Student
- `studentId` (String, required, unique)
- `name` (String, required)
- `email` (String, required)
- `department` (String, Enum)
- `semester` (String, Enum: `S1` - `S6`)
- `latestRiskScore` (Number, 0 - 100)
- `latestRiskLevel` (Enum: `LOW`, `MEDIUM`, `HIGH`)

### 3. AcademicRecord
- `studentId` (Ref Student)
- `semester` (String)
- `attendancePercentage` (Number, 0 - 100)
- `internalMarksPercentage` (Number, 0 - 100)
- `assignmentSubmissionPercentage` (Number, 0 - 100)
- `previousSemesterPercentage` (Number, 0 - 100)
- `recentPerformancePercentage` (Number, 0 - 100)

### 4. RiskAssessment
- `studentId` (Ref Student)
- `academicRecordId` (Ref AcademicRecord)
- `riskScore` (Number, 0 - 100)
- `riskLevel` (Enum: `LOW`, `MEDIUM`, `HIGH`)
- `contributingFactors` (Array of objects with factor, value, impact, explanation)
- `suggestedInterventions` (Array of strings)
- `modelVersion` (String)

### 5. Intervention
- `studentId` (Ref Student)
- `riskAssessmentId` (Ref RiskAssessment)
- `interventionType` (Enum)
- `description` (String)
- `assignedFaculty` (Ref User)
- `status` (Enum: `Planned`, `In Progress`, `Completed`, `Monitoring`)
- `followUpDate` (Date)
- `outcome` (String)

# StudentPulse - Core Application Workflow

## Decision Support Workflow: DETECT → EXPLAIN → INTERVENE → MONITOR

```
1. FACULTY LOGIN
   └── Authenticate via JWT (admin@studentpulse.local or faculty@studentpulse.local)

2. DASHBOARD OVERVIEW
   └── Review risk summary counters, distribution charts, and Students Requiring Attention

3. SELECT AT-RISK STUDENT
   └── Open Student Details profile screen (e.g. Rahul Kumar, CS, S4)

4. DETECT & EXPLAIN
   └── View Risk Score (e.g. 78/100 HIGH) and transparent evidence breakdown:
       - Low Attendance (52%)
       - Weak Internal Test Performance (48%)
       - Low Assignment Submissions (60%)
       - Declining Performance Trend (-20%)

5. INTERVENE
   └── Review recommended interventions & log concrete support action:
       - Select type: "Academic Counselling"
       - Set description and 2-week follow-up date

6. MONITOR & REASSESS
   └── Track status changes (In Progress -> Completed) and run new risk assessments over time to plot risk reduction trajectories
```

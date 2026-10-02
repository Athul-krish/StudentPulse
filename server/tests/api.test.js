const http = require('http');
const dotenv = require('dotenv');
dotenv.config();

const app = require('../src/app');
const connectDB = require('../src/config/db');
const { seedInitialData } = require('../src/utils/seedData');

let server;
let adminToken = '';
let facultyToken = '';

async function runTests() {
  console.log('==================================================');
  console.log('STARTING BACKEND API SUITE TESTS');
  console.log('==================================================');

  await connectDB();
  await seedInitialData();

  server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}`;

  const makeRequest = (method, path, body = null, token = null) => {
    return new Promise((resolve, reject) => {
      const url = new URL(baseUrl + path);
      const options = {
        method,
        hostname: url.hostname,
        port: url.port,
        path: url.pathname + url.search,
        headers: {
          'Content-Type': 'application/json'
        }
      };
      if (token) {
        options.headers['Authorization'] = `Bearer ${token}`;
      }

      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            resolve({ status: res.statusCode, body: parsed });
          } catch (e) {
            resolve({ status: res.statusCode, data });
          }
        });
      });

      req.on('error', reject);
      if (body) {
        req.write(JSON.stringify(body));
      }
      req.end();
    });
  };

  try {
    // 1. Health Endpoint
    console.log('[TEST 1] GET /api/health');
    const health = await makeRequest('GET', '/api/health');
    console.log(`  Status: ${health.status}, Response:`, health.body.status);
    if (health.status !== 200) throw new Error('Health check failed');

    // 2. Admin Login
    console.log('[TEST 2] POST /api/auth/login (Admin)');
    const adminLogin = await makeRequest('POST', '/api/auth/login', {
      email: 'admin@studentpulse.local',
      password: 'admin123'
    });
    console.log(`  Status: ${adminLogin.status}, Role:`, adminLogin.body.user ? adminLogin.body.user.role : 'Failed');
    if (adminLogin.status !== 200 || !adminLogin.body.token) throw new Error('Admin login failed');
    adminToken = adminLogin.body.token;

    // 3. Faculty Login
    console.log('[TEST 3] POST /api/auth/login (Faculty)');
    const facultyLogin = await makeRequest('POST', '/api/auth/login', {
      email: 'faculty@studentpulse.local',
      password: 'faculty123'
    });
    console.log(`  Status: ${facultyLogin.status}, Role:`, facultyLogin.body.user ? facultyLogin.body.user.role : 'Failed');
    if (facultyLogin.status !== 200 || !facultyLogin.body.token) throw new Error('Faculty login failed');
    facultyToken = facultyLogin.body.token;

    // 4. Get Students List
    console.log('[TEST 4] GET /api/students');
    const students = await makeRequest('GET', '/api/students', null, facultyToken);
    console.log(`  Status: ${students.status}, Count: ${students.body.count}`);
    if (students.status !== 200 || !students.body.data || students.body.data.length === 0) {
      throw new Error('Get students failed');
    }
    const sampleStudent = students.body.data[0];

    // 5. Dashboard Summary
    console.log('[TEST 5] GET /api/dashboard/summary');
    const summary = await makeRequest('GET', '/api/dashboard/summary', null, facultyToken);
    console.log(`  Status: ${summary.status}, Total Students: ${summary.body.data.totalStudents}, High Risk: ${summary.body.data.highRisk}`);
    if (summary.status !== 200) throw new Error('Dashboard summary failed');

    // 6. Assess Risk (Integration with ML / Fallback)
    console.log('[TEST 6] POST /api/risk/assess for student ID:', sampleStudent.studentId);
    const assess = await makeRequest('POST', '/api/risk/assess', {
      studentId: sampleStudent._id,
      attendancePercentage: 45,
      internalMarksPercentage: 42,
      assignmentSubmissionPercentage: 55,
      previousSemesterPercentage: 65,
      recentPerformancePercentage: 40,
      notes: 'Test assessment'
    }, facultyToken);
    console.log(`  Status: ${assess.status}, Calculated Risk Score: ${assess.body.data.assessment.riskScore}, Level: ${assess.body.data.assessment.riskLevel}`);
    if (assess.status !== 201) throw new Error('Risk assessment failed');

    // 7. Create Intervention
    console.log('[TEST 7] POST /api/interventions');
    const intervention = await makeRequest('POST', '/api/interventions', {
      studentId: sampleStudent._id,
      riskAssessmentId: assess.body.data.assessment._id,
      interventionType: 'Academic Counselling',
      description: 'Scheduled weekly 1-on-1 support for attendance and assignments.'
    }, facultyToken);
    console.log(`  Status: ${intervention.status}, Type: ${intervention.body.data.interventionType}`);
    if (intervention.status !== 201) throw new Error('Create intervention failed');

    console.log('==================================================');
    console.log(' ALL BACKEND API TESTS PASSED SUCCESSFULLY! ');
    console.log('==================================================');
  } catch (err) {
    console.error('==================================================');
    console.error(' TEST SUITE FAILED:', err.message);
    console.error('==================================================');
    process.exitCode = 1;
  } finally {
    server.close();
    process.exit(process.exitCode || 0);
  }
}

runTests();

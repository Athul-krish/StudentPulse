const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const User = require('../models/User');
const Student = require('../models/Student');
const AcademicRecord = require('../models/AcademicRecord');
const RiskAssessment = require('../models/RiskAssessment');
const Intervention = require('../models/Intervention');
const { generateExplainabilityReport } = require('./explainability');

const firstNames = [
  'Rahul', 'Priya', 'Ananya', 'Amit', 'Sneha', 'Rohan', 'Vikram', 'Deepika', 'Arjun', 'Meera',
  'Siddharth', 'Kavya', 'Aditya', 'Neha', 'Nikhil', 'Pooja', 'Karan', 'Shreya', 'Aakash', 'Divya',
  'Gaurav', 'Ritu', 'Varun', 'Tanvi', 'Manish', 'Rhea', 'Abhishek', 'Swati', 'Harsh', 'Anjali',
  'Sanjay', 'Bhavna', 'Ritik', 'Isha', 'Tarun', 'Simran', 'Dev', 'Nisha', 'Yash', 'Payal'
];

const lastNames = [
  'Kumar', 'Sharma', 'Verma', 'Patel', 'Singh', 'Nair', 'Reddy', 'Rao', 'Gupta', 'Joshi',
  'Mehta', 'Deshmukh', 'Chopra', 'Malhotra', 'Bhat', 'Menon', 'Pillai', 'Sengupta', 'Das', 'Roy'
];

const departments = ['Computer Science', 'Information Technology', 'Electronics', 'Mechanical', 'Data Science'];
const semesters = ['S1', 'S2', 'S3', 'S4', 'S5', 'S6'];

async function seedInitialData() {
  const userCount = await User.countDocuments();
  const studentCount = await Student.countDocuments();

  if (userCount > 0 && studentCount > 0) {
    console.log('[SEED INFO] Database already contains records. Skipping seed.');
    return;
  }

  console.log('[SEED START] Seeding database with realistic synthetic student & demo data...');

  // 1. Create Demo Users
  const salt = await bcrypt.genSalt(10);
  const adminPasswordHash = await bcrypt.hash('admin123', salt);
  const facultyPasswordHash = await bcrypt.hash('faculty123', salt);

  const admin = await User.create({
    name: 'Dr. Anita Sharma (Admin)',
    email: 'admin@studentpulse.local',
    passwordHash: adminPasswordHash,
    role: 'ADMIN',
    department: 'Computer Science'
  });

  const faculty = await User.create({
    name: 'Prof. Rajesh Menon (Faculty)',
    email: 'faculty@studentpulse.local',
    passwordHash: facultyPasswordHash,
    role: 'FACULTY',
    department: 'Computer Science'
  });

  console.log('[SEED SUCCESS] Created Demo Accounts:');
  console.log('  Admin: admin@studentpulse.local / admin123');
  console.log('  Faculty: faculty@studentpulse.local / faculty123');

  // 2. Specific prompt example student: Rahul Kumar
  const rahul = await Student.create({
    studentId: 'CS2024001',
    name: 'Rahul Kumar',
    email: 'rahul.k@studentpulse.local',
    department: 'Computer Science',
    program: 'MCA',
    semester: 'S4',
    batch: '2023-2025',
    phone: '+91 98765 43210',
    enrollmentYear: 2023,
    status: 'ACTIVE',
    latestRiskScore: 78,
    latestRiskLevel: 'HIGH'
  });

  const rahulRecord = await AcademicRecord.create({
    studentId: rahul._id,
    semester: 'S4',
    attendancePercentage: 52,
    internalMarksPercentage: 48,
    assignmentSubmissionPercentage: 60,
    previousSemesterPercentage: 68,
    recentPerformancePercentage: 48,
    engagementIndicator: 'Low'
  });

  const rahulExplain = generateExplainabilityReport({
    attendancePercentage: 52,
    internalMarksPercentage: 48,
    assignmentSubmissionPercentage: 60,
    previousSemesterPercentage: 68,
    recentPerformancePercentage: 48
  }, 'HIGH', 78);

  const rahulAssessment = await RiskAssessment.create({
    studentId: rahul._id,
    academicRecordId: rahulRecord._id,
    riskScore: 78,
    riskLevel: 'HIGH',
    contributingFactors: rahulExplain.contributingFactors,
    suggestedInterventions: rahulExplain.suggestedInterventions,
    modelVersion: 'studentpulse-rf-v1.0',
    notes: 'Needs urgent academic & attendance counselling.'
  });

  await Intervention.create({
    studentId: rahul._id,
    riskAssessmentId: rahulAssessment._id,
    interventionType: 'Academic Counselling',
    description: '1-on-1 meeting scheduled regarding attendance drop and recent internal test performance.',
    assignedFaculty: faculty._id,
    assignedFacultyName: faculty.name,
    status: 'In Progress',
    startDate: new Date(),
    followUpDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    facultyNotes: 'Student expressed difficulty with S4 core subjects. Recommended remedial class assistance.'
  });

  // 3. Create 55 more synthetic students with realistic varied profiles
  const studentDocs = [];
  let idCounter = 2;

  for (let i = 0; i < 55; i++) {
    const fn = firstNames[i % firstNames.length];
    const ln = lastNames[i % lastNames.length];
    const dept = departments[i % departments.length];
    const sem = semesters[i % semesters.length];
    const stId = `${dept.substring(0, 2).toUpperCase()}2024${String(idCounter).padStart(3, '0')}`;
    idCounter++;

    // Deterministic distribution of risk profiles (20% High, 30% Medium, 50% Low)
    let att, internal, assign, prev, recent, riskScore, riskLevel;

    if (i % 5 === 0) {
      // HIGH Risk
      att = 45 + (i % 12);
      internal = 40 + (i % 15);
      assign = 50 + (i % 12);
      prev = 65 + (i % 10);
      recent = 42 + (i % 10);
      riskScore = 72 + (i % 20);
      riskLevel = 'HIGH';
    } else if (i % 5 === 1 || i % 5 === 2) {
      // MEDIUM Risk
      att = 68 + (i % 10);
      internal = 58 + (i % 10);
      assign = 65 + (i % 12);
      prev = 70 + (i % 8);
      recent = 60 + (i % 8);
      riskScore = 48 + (i % 18);
      riskLevel = 'MEDIUM';
    } else {
      // LOW Risk
      att = 85 + (i % 12);
      internal = 78 + (i % 18);
      assign = 88 + (i % 10);
      prev = 75 + (i % 18);
      recent = 82 + (i % 15);
      riskScore = 12 + (i % 22);
      riskLevel = 'LOW';
    }

    const st = await Student.create({
      studentId: stId,
      name: `${fn} ${ln}`,
      email: `${fn.toLowerCase()}.${ln.toLowerCase()}${i}@studentpulse.local`,
      department: dept,
      program: 'MCA',
      semester: sem,
      batch: '2023-2025',
      phone: `+91 987${String(i).padStart(2, '0')} 12345`,
      enrollmentYear: 2023,
      status: 'ACTIVE',
      latestRiskScore: riskScore,
      latestRiskLevel: riskLevel
    });

    // Create S3 (historical) and S4 (current) records for risk trend visualization
    const prevRecord = await AcademicRecord.create({
      studentId: st._id,
      semester: 'S3',
      attendancePercentage: Math.min(100, att + 8),
      internalMarksPercentage: Math.min(100, prev),
      assignmentSubmissionPercentage: Math.min(100, assign + 10),
      previousSemesterPercentage: Math.min(100, prev + 4),
      recentPerformancePercentage: prev,
      assessmentDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000)
    });

    const currRecord = await AcademicRecord.create({
      studentId: st._id,
      semester: sem,
      attendancePercentage: att,
      internalMarksPercentage: internal,
      assignmentSubmissionPercentage: assign,
      previousSemesterPercentage: prev,
      recentPerformancePercentage: recent,
      assessmentDate: new Date()
    });

    const explain = generateExplainabilityReport({
      attendancePercentage: att,
      internalMarksPercentage: internal,
      assignmentSubmissionPercentage: assign,
      previousSemesterPercentage: prev,
      recentPerformancePercentage: recent
    }, riskLevel, riskScore);

    const assessment = await RiskAssessment.create({
      studentId: st._id,
      academicRecordId: currRecord._id,
      riskScore,
      riskLevel,
      contributingFactors: explain.contributingFactors,
      suggestedInterventions: explain.suggestedInterventions,
      modelVersion: 'studentpulse-rf-v1.0'
    });

    // Create sample intervention for HIGH or MEDIUM risk students
    if (riskLevel === 'HIGH' || (riskLevel === 'MEDIUM' && i % 2 === 0)) {
      await Intervention.create({
        studentId: st._id,
        riskAssessmentId: assessment._id,
        interventionType: riskLevel === 'HIGH' ? 'Faculty Mentoring' : 'Assignment Support',
        description: `Routine intervention for ${riskLevel} risk student. Focus on attendance and coursework performance.`,
        assignedFaculty: faculty._id,
        assignedFacultyName: faculty.name,
        status: i % 3 === 0 ? 'Planned' : (i % 3 === 1 ? 'In Progress' : 'Completed'),
        startDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        followUpDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        outcome: i % 3 === 2 ? 'Student showed improvement in attendance over 2-week monitoring.' : ''
      });
    }
  }

  console.log('[SEED COMPLETE] Successfully seeded 56 students, academic records, risk assessments, and interventions.');
}

if (require.main === module) {
  const connectDB = require('../config/db');
  (async () => {
    await connectDB();
    await seedInitialData();
    process.exit(0);
  })();
}

module.exports = { seedInitialData };

const axios = require('axios');
const Student = require('../models/Student');
const AcademicRecord = require('../models/AcademicRecord');
const RiskAssessment = require('../models/RiskAssessment');
const { generateExplainabilityReport } = require('../utils/explainability');

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://127.0.0.1:8000';

// Fallback risk calculation if ML service is unreachable
function calculateFallbackRisk(academicData) {
  const {
    attendancePercentage: att,
    internalMarksPercentage: marks,
    assignmentSubmissionPercentage: assign,
    previousSemesterPercentage: prev,
    recentPerformancePercentage: recent
  } = academicData;

  const attRisk = Math.max(0, (75 - att) * 1.2);
  const marksRisk = Math.max(0, (65 - marks) * 1.0);
  const assignRisk = Math.max(0, (70 - assign) * 0.6);
  const dropTrend = Math.max(0, (prev - recent) * 1.1);

  const rawScore = attRisk + marksRisk + assignRisk + dropTrend;
  const score = Math.min(100, Math.max(5, Math.round(rawScore * 1.2)));

  let level = 'LOW';
  if (score >= 70) level = 'HIGH';
  else if (score >= 40) level = 'MEDIUM';

  return {
    riskScore: score,
    riskLevel: level,
    modelVersion: 'studentpulse-fallback-rule-v1.0',
    probabilities: { LOW: level === 'LOW' ? 0.8 : 0.1, MEDIUM: level === 'MEDIUM' ? 0.8 : 0.1, HIGH: level === 'HIGH' ? 0.8 : 0.1 }
  };
}

// @desc    Run risk assessment for a student
// @route   POST /api/risk/assess
// @access  Private
exports.assessRisk = async (req, res, next) => {
  try {
    const { studentId, attendancePercentage, internalMarksPercentage, assignmentSubmissionPercentage, previousSemesterPercentage, recentPerformancePercentage, notes } = req.body;

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ success: false, error: 'Student not found.' });
    }

    // 1. Create or save Academic Record
    const academicRecord = await AcademicRecord.create({
      studentId: student._id,
      semester: student.semester,
      attendancePercentage: Number(attendancePercentage),
      internalMarksPercentage: Number(internalMarksPercentage),
      assignmentSubmissionPercentage: Number(assignmentSubmissionPercentage),
      previousSemesterPercentage: Number(previousSemesterPercentage),
      recentPerformancePercentage: Number(recentPerformancePercentage)
    });

    // 2. Prepare payload for Python ML service
    const mlPayload = {
      attendance: Number(attendancePercentage),
      internalMarks: Number(internalMarksPercentage),
      assignmentSubmission: Number(assignmentSubmissionPercentage),
      previousPerformance: Number(previousSemesterPercentage),
      recentPerformance: Number(recentPerformancePercentage)
    };

    let mlResult;
    let mlServiceAvailable = true;

    try {
      const response = await axios.post(`${ML_SERVICE_URL}/predict`, mlPayload, { timeout: 3000 });
      mlResult = response.data;
    } catch (mlErr) {
      console.warn(`[ML SERVICE WARNING] ML API un-contactable (${mlErr.message}). Using transparent fallback calculation engine.`);
      mlServiceAvailable = false;
      mlResult = calculateFallbackRisk({
        attendancePercentage: Number(attendancePercentage),
        internalMarksPercentage: Number(internalMarksPercentage),
        assignmentSubmissionPercentage: Number(assignmentSubmissionPercentage),
        previousSemesterPercentage: Number(previousSemesterPercentage),
        recentPerformancePercentage: Number(recentPerformancePercentage)
      });
    }

    // 3. Generate explainability & recommendations
    const explainability = generateExplainabilityReport({
      attendancePercentage: Number(attendancePercentage),
      internalMarksPercentage: Number(internalMarksPercentage),
      assignmentSubmissionPercentage: Number(assignmentSubmissionPercentage),
      previousSemesterPercentage: Number(previousSemesterPercentage),
      recentPerformancePercentage: Number(recentPerformancePercentage)
    }, mlResult.riskLevel, mlResult.riskScore);

    // 4. Create Risk Assessment in DB
    const riskAssessment = await RiskAssessment.create({
      studentId: student._id,
      academicRecordId: academicRecord._id,
      riskScore: mlResult.riskScore,
      riskLevel: mlResult.riskLevel,
      contributingFactors: explainability.contributingFactors,
      suggestedInterventions: explainability.suggestedInterventions,
      modelVersion: mlResult.modelVersion || 'studentpulse-rf-v1.0',
      predictionMetadata: {
        probabilities: mlResult.probabilities,
        mlServiceAvailable
      },
      notes: notes || ''
    });

    // 5. Update Student latest risk
    student.latestRiskScore = mlResult.riskScore;
    student.latestRiskLevel = mlResult.riskLevel;
    await student.save();

    res.status(201).json({
      success: true,
      data: {
        assessment: riskAssessment,
        academicRecord,
        student,
        mlServiceAvailable
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get risk history for a specific student
// @route   GET /api/risk/student/:studentId
// @access  Private
exports.getStudentRiskHistory = async (req, res, next) => {
  try {
    const history = await RiskAssessment.find({ studentId: req.params.studentId })
      .populate('academicRecordId')
      .sort({ assessmentDate: 1 });

    res.status(200).json({
      success: true,
      count: history.length,
      data: history
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all high risk students requiring priority intervention
// @route   GET /api/risk/high-risk
// @access  Private
exports.getHighRiskStudents = async (req, res, next) => {
  try {
    const highRiskStudents = await Student.find({ latestRiskLevel: 'HIGH' })
      .sort({ latestRiskScore: -1 });

    res.status(200).json({
      success: true,
      count: highRiskStudents.length,
      data: highRiskStudents
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get risk statistics & breakdown
// @route   GET /api/risk/statistics
// @access  Private
exports.getRiskStatistics = async (req, res, next) => {
  try {
    const totalStudents = await Student.countDocuments();
    const highRisk = await Student.countDocuments({ latestRiskLevel: 'HIGH' });
    const mediumRisk = await Student.countDocuments({ latestRiskLevel: 'MEDIUM' });
    const lowRisk = await Student.countDocuments({ latestRiskLevel: 'LOW' });

    // Risk by Department
    const deptStats = await Student.aggregate([
      {
        $group: {
          _id: '$department',
          total: { $sum: 1 },
          highRisk: { $sum: { $cond: [{ $eq: ['$latestRiskLevel', 'HIGH'] }, 1, 0] } },
          mediumRisk: { $sum: { $cond: [{ $eq: ['$latestRiskLevel', 'MEDIUM'] }, 1, 0] } },
          lowRisk: { $sum: { $cond: [{ $eq: ['$latestRiskLevel', 'LOW'] }, 1, 0] } },
          avgScore: { $avg: '$latestRiskScore' }
        }
      }
    ]);

    // Risk by Semester
    const semStats = await Student.aggregate([
      {
        $group: {
          _id: '$semester',
          total: { $sum: 1 },
          highRisk: { $sum: { $cond: [{ $eq: ['$latestRiskLevel', 'HIGH'] }, 1, 0] } },
          mediumRisk: { $sum: { $cond: [{ $eq: ['$latestRiskLevel', 'MEDIUM'] }, 1, 0] } },
          lowRisk: { $sum: { $cond: [{ $eq: ['$latestRiskLevel', 'LOW'] }, 1, 0] } },
          avgScore: { $avg: '$latestRiskScore' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalStudents,
          highRisk,
          mediumRisk,
          lowRisk
        },
        departmentStats: deptStats,
        semesterStats: semStats
      }
    });
  } catch (err) {
    next(err);
  }
};

const Student = require('../models/Student');
const Intervention = require('../models/Intervention');
const RiskAssessment = require('../models/RiskAssessment');

// @desc    Get dashboard summary counters and metrics
// @route   GET /api/dashboard/summary
// @access  Private
exports.getDashboardSummary = async (req, res, next) => {
  try {
    const totalStudents = await Student.countDocuments();
    const highRisk = await Student.countDocuments({ latestRiskLevel: 'HIGH' });
    const mediumRisk = await Student.countDocuments({ latestRiskLevel: 'MEDIUM' });
    const lowRisk = await Student.countDocuments({ latestRiskLevel: 'LOW' });

    const activeInterventions = await Intervention.countDocuments({
      status: { $in: ['Planned', 'In Progress', 'Monitoring'] }
    });

    const pendingFollowups = await Intervention.countDocuments({
      status: { $in: ['Planned', 'In Progress'] },
      followUpDate: { $lte: new Date() }
    });

    // Top students requiring immediate attention
    const studentsRequiringAttention = await Student.find({ latestRiskLevel: { $in: ['HIGH', 'MEDIUM'] } })
      .sort({ latestRiskScore: -1 })
      .limit(10);

    // Fetch latest assessment top factor for each attention student
    const attentionData = await Promise.all(
      studentsRequiringAttention.map(async (st) => {
        const assessment = await RiskAssessment.findOne({ studentId: st._id }).sort({ assessmentDate: -1 });
        const topFactor = assessment && assessment.contributingFactors && assessment.contributingFactors.length > 0
          ? assessment.contributingFactors[0].factor
          : 'Multiple Academic Factors';

        return {
          _id: st._id,
          studentId: st.studentId,
          name: st.name,
          department: st.department,
          semester: st.semester,
          riskScore: st.latestRiskScore,
          riskLevel: st.latestRiskLevel,
          topFactor,
          lastAssessment: assessment ? assessment.assessmentDate : st.updatedAt
        };
      })
    );

    res.status(200).json({
      success: true,
      data: {
        totalStudents,
        highRisk,
        mediumRisk,
        lowRisk,
        activeInterventions,
        pendingFollowups,
        studentsRequiringAttention: attentionData
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get system operational alerts based on real DB records
// @route   GET /api/dashboard/alerts
// @access  Private
exports.getDashboardAlerts = async (req, res, next) => {
  try {
    const alerts = [];

    // 1. High Risk Students without active intervention
    const highRiskStudents = await Student.find({ latestRiskLevel: 'HIGH' });
    for (const student of highRiskStudents) {
      const activeIntervention = await Intervention.findOne({
        studentId: student._id,
        status: { $in: ['Planned', 'In Progress', 'Monitoring'] }
      });

      if (!activeIntervention) {
        alerts.push({
          id: `hr-no-int-${student._id}`,
          type: 'HIGH_RISK_UNATTENDED',
          severity: 'HIGH',
          title: 'High Risk Student Requires Intervention Plan',
          message: `${student.name} (${student.studentId}, ${student.department}) is flagged HIGH risk (${student.latestRiskScore}/100) with no active intervention logged.`,
          studentId: student._id,
          date: student.updatedAt
        });
      }
    }

    // 2. Due Follow-ups
    const dueInterventions = await Intervention.find({
      status: { $in: ['Planned', 'In Progress'] },
      followUpDate: { $lte: new Date(Date.now() + 24 * 60 * 60 * 1000) }
    }).populate('studentId', 'name studentId department');

    for (const item of dueInterventions) {
      if (item.studentId) {
        alerts.push({
          id: `int-due-${item._id}`,
          type: 'INTERVENTION_FOLLOWUP_DUE',
          severity: 'MEDIUM',
          title: 'Intervention Follow-up Due',
          message: `Follow-up for ${item.studentId.name} (${item.interventionType}) is due today or overdue.`,
          studentId: item.studentId._id,
          interventionId: item._id,
          date: item.followUpDate
        });
      }
    }

    res.status(200).json({
      success: true,
      count: alerts.length,
      data: alerts
    });
  } catch (err) {
    next(err);
  }
};

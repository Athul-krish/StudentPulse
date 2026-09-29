const Intervention = require('../models/Intervention');
const Student = require('../models/Student');

// @desc    Get all interventions with optional filters
// @route   GET /api/interventions
// @access  Private
exports.getInterventions = async (req, res, next) => {
  try {
    const { status, type, studentId } = req.query;
    let query = {};

    if (status && status !== 'ALL') {
      query.status = status;
    }
    if (type && type !== 'ALL') {
      query.interventionType = type;
    }
    if (studentId) {
      query.studentId = studentId;
    }

    const interventions = await Intervention.find(query)
      .populate('studentId', 'name studentId department semester latestRiskLevel latestRiskScore')
      .populate('assignedFaculty', 'name email department')
      .sort({ updatedAt: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: interventions.length,
      data: interventions
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create new intervention record
// @route   POST /api/interventions
// @access  Private
exports.createIntervention = async (req, res, next) => {
  try {
    const { studentId, riskAssessmentId, interventionType, description, followUpDate, facultyNotes } = req.body;

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ success: false, error: 'Student not found.' });
    }

    const intervention = await Intervention.create({
      studentId,
      riskAssessmentId,
      interventionType,
      description,
      assignedFaculty: req.user ? req.user._id : null,
      assignedFacultyName: req.user ? req.user.name : 'System Faculty',
      followUpDate: followUpDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // Default 2 weeks follow-up
      facultyNotes: facultyNotes || ''
    });

    const populated = await Intervention.findById(intervention._id)
      .populate('studentId', 'name studentId department semester latestRiskLevel latestRiskScore')
      .populate('assignedFaculty', 'name email');

    res.status(201).json({
      success: true,
      data: populated
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update intervention status, follow-up, or outcome
// @route   PUT /api/interventions/:id
// @access  Private
exports.updateIntervention = async (req, res, next) => {
  try {
    let intervention = await Intervention.findById(req.params.id);
    if (!intervention) {
      return res.status(404).json({ success: false, error: 'Intervention not found.' });
    }

    intervention = await Intervention.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate('studentId', 'name studentId department semester latestRiskLevel latestRiskScore')
      .populate('assignedFaculty', 'name email');

    res.status(200).json({
      success: true,
      data: intervention
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete intervention
// @route   DELETE /api/interventions/:id
// @access  Private
exports.deleteIntervention = async (req, res, next) => {
  try {
    const intervention = await Intervention.findById(req.params.id);
    if (!intervention) {
      return res.status(404).json({ success: false, error: 'Intervention not found.' });
    }

    await intervention.deleteOne();
    res.status(200).json({
      success: true,
      message: 'Intervention record deleted successfully.'
    });
  } catch (err) {
    next(err);
  }
};

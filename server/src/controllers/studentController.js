const Student = require('../models/Student');
const AcademicRecord = require('../models/AcademicRecord');
const RiskAssessment = require('../models/RiskAssessment');
const Intervention = require('../models/Intervention');

// @desc    Get all students with filtering, search & pagination
// @route   GET /api/students
// @access  Private
exports.getStudents = async (req, res, next) => {
  try {
    const { department, semester, riskLevel, search, limit = 100, page = 1 } = req.query;

    let query = {};

    if (department && department !== 'ALL') {
      query.department = department;
    }
    if (semester && semester !== 'ALL') {
      query.semester = semester;
    }
    if (riskLevel && riskLevel !== 'ALL') {
      query.latestRiskLevel = riskLevel;
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { studentId: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const count = await Student.countDocuments(query);
    const students = await Student.find(query)
      .sort({ latestRiskScore: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      count,
      page: Number(page),
      pages: Math.ceil(count / limit),
      data: students
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single student details with records & interventions
// @route   GET /api/students/:id
// @access  Private
exports.getStudentById = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, error: 'Student not found.' });
    }

    // Academic records ordered by semester / assessmentDate
    const records = await AcademicRecord.find({ studentId: student._id }).sort({ assessmentDate: -1 });

    // Latest Risk Assessment
    const latestAssessment = await RiskAssessment.findOne({ studentId: student._id }).sort({ assessmentDate: -1 });

    // Risk Assessment History
    const riskHistory = await RiskAssessment.find({ studentId: student._id }).sort({ assessmentDate: 1 });

    // Interventions
    const interventions = await Intervention.find({ studentId: student._id }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        student,
        academicRecords: records,
        latestAssessment,
        riskHistory,
        interventions
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create new student
// @route   POST /api/students
// @access  Private
exports.createStudent = async (req, res, next) => {
  try {
    const existing = await Student.findOne({ studentId: req.body.studentId.toUpperCase() });
    if (existing) {
      return res.status(400).json({ success: false, error: `Student ID '${req.body.studentId}' already exists.` });
    }

    const student = await Student.create({
      ...req.body,
      studentId: req.body.studentId.toUpperCase()
    });

    res.status(201).json({
      success: true,
      data: student
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update student
// @route   PUT /api/students/:id
// @access  Private
exports.updateStudent = async (req, res, next) => {
  try {
    let student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, error: 'Student not found.' });
    }

    student = await Student.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: student
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete student
// @route   DELETE /api/students/:id
// @access  Private (Admin)
exports.deleteStudent = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, error: 'Student not found.' });
    }

    await AcademicRecord.deleteMany({ studentId: student._id });
    await RiskAssessment.deleteMany({ studentId: student._id });
    await Intervention.deleteMany({ studentId: student._id });
    await student.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Student and related records deleted successfully.'
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Add academic record for student
// @route   POST /api/students/:id/records
// @access  Private
exports.addAcademicRecord = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, error: 'Student not found.' });
    }

    const record = await AcademicRecord.create({
      studentId: student._id,
      ...req.body
    });

    res.status(201).json({
      success: true,
      data: record
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get academic records for student
// @route   GET /api/students/:id/records
// @access  Private
exports.getAcademicRecords = async (req, res, next) => {
  try {
    const records = await AcademicRecord.find({ studentId: req.params.id }).sort({ assessmentDate: -1 });
    res.status(200).json({
      success: true,
      count: records.length,
      data: records
    });
  } catch (err) {
    next(err);
  }
};

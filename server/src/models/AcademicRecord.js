const mongoose = require('mongoose');

const academicRecordSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  semester: {
    type: String,
    required: true
  },
  attendancePercentage: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  internalMarksPercentage: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  assignmentSubmissionPercentage: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  previousSemesterPercentage: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  recentPerformancePercentage: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  engagementIndicator: {
    type: String,
    default: 'Normal'
  },
  assessmentDate: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('AcademicRecord', academicRecordSchema);

const mongoose = require('mongoose');

const interventionSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  riskAssessmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RiskAssessment'
  },
  interventionType: {
    type: String,
    enum: [
      'Contact Student',
      'Academic Counselling',
      'Remedial Classes',
      'Faculty Mentoring',
      'Assignment Support',
      'Attendance Follow-up',
      'Performance Monitoring',
      'Other'
    ],
    required: true
  },
  description: {
    type: String,
    required: true
  },
  assignedFaculty: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  assignedFacultyName: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['Planned', 'In Progress', 'Completed', 'Monitoring'],
    default: 'Planned'
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  followUpDate: {
    type: Date
  },
  outcome: {
    type: String,
    default: ''
  },
  facultyNotes: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

interventionSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Intervention', interventionSchema);

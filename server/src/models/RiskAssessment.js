const mongoose = require('mongoose');

const contributingFactorSchema = new mongoose.Schema({
  factor: {
    type: String,
    required: true
  },
  value: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  impact: {
    type: String,
    enum: ['High', 'Medium', 'Low', 'Positive'],
    required: true
  },
  explanation: {
    type: String,
    required: true
  }
}, { _id: false });

const riskAssessmentSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  academicRecordId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AcademicRecord'
  },
  riskScore: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  riskLevel: {
    type: String,
    enum: ['LOW', 'MEDIUM', 'HIGH'],
    required: true
  },
  contributingFactors: [contributingFactorSchema],
  suggestedInterventions: [{
    type: String
  }],
  modelVersion: {
    type: String,
    default: 'studentpulse-rf-v1.0'
  },
  predictionMetadata: {
    type: mongoose.Schema.Types.Mixed
  },
  notes: {
    type: String,
    default: ''
  },
  assessmentDate: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('RiskAssessment', riskAssessmentSchema);

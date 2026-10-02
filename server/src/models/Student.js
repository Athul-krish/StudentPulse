const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  studentId: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  department: {
    type: String,
    required: true,
    enum: ['Computer Science', 'Information Technology', 'Electronics', 'Mechanical', 'Data Science']
  },
  program: {
    type: String,
    default: 'MCA'
  },
  semester: {
    type: String,
    required: true,
    enum: ['S1', 'S2', 'S3', 'S4', 'S5', 'S6']
  },
  batch: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    default: ''
  },
  enrollmentYear: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['ACTIVE', 'GRADUATED', 'WITHDRAWN', 'ON_LEAVE'],
    default: 'ACTIVE'
  },
  latestRiskScore: {
    type: Number,
    default: 0
  },
  latestRiskLevel: {
    type: String,
    enum: ['LOW', 'MEDIUM', 'HIGH'],
    default: 'LOW'
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

studentSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Student', studentSchema);

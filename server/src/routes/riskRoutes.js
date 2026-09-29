const express = require('express');
const {
  assessRisk,
  getStudentRiskHistory,
  getHighRiskStudents,
  getRiskStatistics
} = require('../controllers/riskController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.post('/assess', assessRisk);
router.get('/student/:studentId', getStudentRiskHistory);
router.get('/high-risk', getHighRiskStudents);
router.get('/statistics', getRiskStatistics);

module.exports = router;

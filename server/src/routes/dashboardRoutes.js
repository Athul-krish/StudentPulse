const express = require('express');
const { getDashboardSummary, getDashboardAlerts } = require('../controllers/dashboardController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/summary', getDashboardSummary);
router.get('/alerts', getDashboardAlerts);

module.exports = router;

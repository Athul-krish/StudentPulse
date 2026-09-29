const express = require('express');
const {
  getInterventions,
  createIntervention,
  updateIntervention,
  deleteIntervention
} = require('../controllers/interventionController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getInterventions)
  .post(createIntervention);

router.route('/:id')
  .put(updateIntervention)
  .delete(deleteIntervention);

module.exports = router;

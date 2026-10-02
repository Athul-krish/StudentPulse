const express = require('express');
const {
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  addAcademicRecord,
  getAcademicRecords
} = require('../controllers/studentController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getStudents)
  .post(createStudent);

router.route('/:id')
  .get(getStudentById)
  .put(updateStudent)
  .delete(authorize('ADMIN'), deleteStudent);

router.route('/:id/records')
  .get(getAcademicRecords)
  .post(addAcademicRecord);

module.exports = router;

const express = require('express');
const { getUsers, createUser, updateUser } = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);
router.use(authorize('ADMIN'));

router.route('/')
  .get(getUsers)
  .post(createUser);

router.route('/:id')
  .put(updateUser);

module.exports = router;

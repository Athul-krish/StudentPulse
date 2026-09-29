const bcrypt = require('bcryptjs');
const User = require('../models/User');

// @desc    Get all users (Admin only)
// @route   GET /api/users
// @access  Private (Admin)
exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-passwordHash').sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create new faculty/admin user (Admin only)
// @route   POST /api/users
// @access  Private (Admin)
exports.createUser = async (req, res, next) => {
  try {
    const { name, email, password, role, department } = req.body;

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ success: false, error: 'User with this email already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password || 'StudentPulse2026!', salt);

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      passwordHash,
      role: role || 'FACULTY',
      department: department || 'Computer Science'
    });

    res.status(201).json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        createdAt: user.createdAt
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update user (Admin only)
// @route   PUT /api/users/:id
// @access  Private (Admin)
exports.updateUser = async (req, res, next) => {
  try {
    const { name, role, department, password } = req.body;

    let user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found.' });
    }

    if (name) user.name = name;
    if (role) user.role = role;
    if (department) user.department = department;

    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.passwordHash = await bcrypt.hash(password, salt);
    }

    await user.save();

    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department
      }
    });
  } catch (err) {
    next(err);
  }
};

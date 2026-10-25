const jwt = require('jsonwebtoken');
const User = require('../models/User.model');

// ─── Helper ───────────────────────────────────────────────────────────────────
const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

const sendTokenResponse = (res, statusCode, user, message) => {
  const token = signToken(user._id);

  res.status(statusCode).json({
    success: true,
    message,
    data: {
      token,
      user: user.toSafeObject(),
    },
  });
};

// ─── Controllers ─────────────────────────────────────────────────────────────

/**
 * POST /api/auth/register
 * Register a new user
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password, monthlyBudget } = req.body;

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      const error = new Error('An account with this email already exists');
      error.statusCode = 409;
      return next(error);
    }

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      monthlyBudget: monthlyBudget || 0,
    });

    sendTokenResponse(res, 201, user, 'Account created successfully');
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/auth/login
 * Authenticate user and return JWT
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Explicitly select password (it's excluded by default)
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user || !(await user.comparePassword(password))) {
      const error = new Error('Invalid email or password');
      error.statusCode = 401;
      return next(error);
    }

    sendTokenResponse(res, 200, user, 'Logged in successfully');
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/auth/me
 * Get current authenticated user profile
 */
const getMe = async (req, res, next) => {
  try {
    // req.user is already attached by protect middleware
    res.status(200).json({
      success: true,
      data: {
        user: req.user.toSafeObject(),
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/auth/me
 * Update current user profile (name, monthlyBudget only — not password)
 */
const updateMe = async (req, res, next) => {
  try {
    const { name, monthlyBudget } = req.body;
    const updates = {};

    if (name !== undefined) updates.name = name.trim();
    if (monthlyBudget !== undefined) updates.monthlyBudget = monthlyBudget;

    if (Object.keys(updates).length === 0) {
      const error = new Error('No valid fields provided for update');
      error.statusCode = 400;
      return next(error);
    }

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: { user: user.toSafeObject() },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, getMe, updateMe };

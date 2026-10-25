const jwt = require('jsonwebtoken');
const User = require('../models/User.model');

/**
 * Protect routes — verifies JWT token and attaches user to req.user
 */
const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      const error = new Error('Access denied. No token provided.');
      error.statusCode = 401;
      return next(error);
    }

    const token = authHeader.split(' ')[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      const error = new Error('User belonging to this token no longer exists.');
      error.statusCode = 401;
      return next(error);
    }

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = { protect };

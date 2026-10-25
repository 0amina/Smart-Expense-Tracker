/**
 * Request body validation middleware
 * Lightweight validation without external libraries
 */

const validateRegister = (req, res, next) => {
  const { name, email, password } = req.body;
  const errors = [];

  if (!name || name.trim().length < 2) {
    errors.push({ field: 'name', message: 'Name must be at least 2 characters' });
  }

  if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
    errors.push({ field: 'email', message: 'Valid email is required' });
  }

  if (!password || password.length < 6) {
    errors.push({ field: 'password', message: 'Password must be at least 6 characters' });
  }

  if (errors.length > 0) {
    return res.status(422).json({ success: false, message: 'Validation failed', errors });
  }

  next();
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = [];

  if (!email) errors.push({ field: 'email', message: 'Email is required' });
  if (!password) errors.push({ field: 'password', message: 'Password is required' });

  if (errors.length > 0) {
    return res.status(422).json({ success: false, message: 'Validation failed', errors });
  }

  next();
};

const validateTransaction = (req, res, next) => {
  const { type, amount, category } = req.body;
  const errors = [];

  if (!type || !['income', 'expense'].includes(type)) {
    errors.push({ field: 'type', message: 'Type must be "income" or "expense"' });
  }

  if (!amount || isNaN(amount) || Number(amount) <= 0) {
    errors.push({ field: 'amount', message: 'Amount must be a positive number' });
  }

  if (!category || category.trim() === '') {
    errors.push({ field: 'category', message: 'Category is required' });
  }

  if (errors.length > 0) {
    return res.status(422).json({ success: false, message: 'Validation failed', errors });
  }

  next();
};

module.exports = { validateRegister, validateLogin, validateTransaction };

const Transaction = require('../models/Transaction.model');
const { checkBudgetAlert, checkLargeTransactionAlert } = require('../services/notificationService');

// ─── Helper: Build filter query ───────────────────────────────────────────────
const buildFilterQuery = (userId, queryParams) => {
  const { category, type, month, year, search } = queryParams;
  const filter = { user: userId };

  if (type && ['income', 'expense'].includes(type)) {
    filter.type = type;
  }

  if (category) {
    filter.category = category;
  }

  if (search) {
    filter.description = { $regex: search, $options: 'i' };
  }

  if (month || year) {
    const targetYear = parseInt(year) || new Date().getFullYear();
    const targetMonth = parseInt(month); // 1-based

    if (month) {
      // Specific month (optionally with year)
      const start = new Date(targetYear, targetMonth - 1, 1);
      const end = new Date(targetYear, targetMonth, 1);
      filter.date = { $gte: start, $lt: end };
    } else {
      // Year only
      const start = new Date(targetYear, 0, 1);
      const end = new Date(targetYear + 1, 0, 1);
      filter.date = { $gte: start, $lt: end };
    }
  }

  return filter;
};

// ─── Controllers ─────────────────────────────────────────────────────────────

/**
 * GET /api/transactions
 * Get all transactions for the authenticated user with optional filters
 * Query params: ?category=Food&type=expense&month=5&year=2024&search=coffee&page=1&limit=20
 */
const getTransactions = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const filter = buildFilterQuery(req.user._id, req.query);

    const [transactions, total] = await Promise.all([
      Transaction.find(filter).sort({ date: -1 }).skip(skip).limit(limitNum).lean(),
      Transaction.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: {
        transactions,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum),
          hasNextPage: pageNum < Math.ceil(total / limitNum),
          hasPrevPage: pageNum > 1,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/transactions/:id
 * Get a single transaction by ID (must belong to authenticated user)
 */
const getTransaction = async (req, res, next) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      user: req.user._id,
    }).lean();

    if (!transaction) {
      const error = new Error('Transaction not found');
      error.statusCode = 404;
      return next(error);
    }

    res.status(200).json({ success: true, data: { transaction } });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/transactions
 * Create a new transaction
 */
const createTransaction = async (req, res, next) => {
  try {
    const { type, amount, category, description, date } = req.body;

    const transaction = await Transaction.create({
      user: req.user._id,
      type,
      amount: parseFloat(amount),
      category,
      description: description || '',
      date: date ? new Date(date) : new Date(),
    });

    // ── Trigger budget alerts (non-blocking — errors won't fail the request)
    if (type === 'expense') {
      const parsedAmount = parseFloat(amount);
      checkBudgetAlert(req.user._id).catch(() => {});
      checkLargeTransactionAlert(req.user._id, parsedAmount, category).catch(() => {});
    }

    res.status(201).json({
      success: true,
      message: 'Transaction created successfully',
      data: { transaction },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/transactions/:id
 * Update a transaction (must belong to authenticated user)
 */
const updateTransaction = async (req, res, next) => {
  try {
    const { type, amount, category, description, date } = req.body;
    const updates = {};

    if (type !== undefined) updates.type = type;
    if (amount !== undefined) updates.amount = parseFloat(amount);
    if (category !== undefined) updates.category = category;
    if (description !== undefined) updates.description = description;
    if (date !== undefined) updates.date = new Date(date);

    if (Object.keys(updates).length === 0) {
      const error = new Error('No valid fields provided for update');
      error.statusCode = 400;
      return next(error);
    }

    const transaction = await Transaction.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      updates,
      { new: true, runValidators: true }
    ).lean();

    if (!transaction) {
      const error = new Error('Transaction not found');
      error.statusCode = 404;
      return next(error);
    }

    // Re-check budget if an expense amount changed
    if (transaction.type === 'expense') {
      checkBudgetAlert(req.user._id).catch(() => {});
    }

    res.status(200).json({
      success: true,
      message: 'Transaction updated successfully',
      data: { transaction },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/transactions/:id
 * Delete a transaction (must belong to authenticated user)
 */
const deleteTransaction = async (req, res, next) => {
  try {
    const transaction = await Transaction.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!transaction) {
      const error = new Error('Transaction not found');
      error.statusCode = 404;
      return next(error);
    }

    res.status(200).json({
      success: true,
      message: 'Transaction deleted successfully',
      data: null,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getTransactions,
  getTransaction,
  createTransaction,
  updateTransaction,
  deleteTransaction,
};

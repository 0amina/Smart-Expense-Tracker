const mongoose = require('mongoose');

const TRANSACTION_TYPES = ['income', 'expense'];

const EXPENSE_CATEGORIES = [
  'Food',
  'Transport',
  'Housing',
  'Entertainment',
  'Healthcare',
  'Education',
  'Shopping',
  'Utilities',
  'Other',
];

const INCOME_CATEGORIES = ['Salary', 'Freelance', 'Gift', 'Scholarship', 'Investment', 'Other'];

const ALL_CATEGORIES = [...new Set([...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES])];

const transactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Transaction must belong to a user'],
      index: true,
    },
    type: {
      type: String,
      enum: {
        values: TRANSACTION_TYPES,
        message: 'Type must be either "income" or "expense"',
      },
      required: [true, 'Transaction type is required'],
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0.01, 'Amount must be greater than 0'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: {
        values: ALL_CATEGORIES,
        message: `Category must be one of: ${ALL_CATEGORIES.join(', ')}`,
      },
    },
    description: {
      type: String,
      trim: true,
      maxlength: [200, 'Description cannot exceed 200 characters'],
      default: '',
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// ─── Compound Indexes for common query patterns ───────────────────────────────
transactionSchema.index({ user: 1, date: -1 });
transactionSchema.index({ user: 1, type: 1 });
transactionSchema.index({ user: 1, category: 1 });
transactionSchema.index({ user: 1, date: -1, type: 1 });

module.exports = mongoose.model('Transaction', transactionSchema);
module.exports.TRANSACTION_TYPES = TRANSACTION_TYPES;
module.exports.ALL_CATEGORIES = ALL_CATEGORIES;

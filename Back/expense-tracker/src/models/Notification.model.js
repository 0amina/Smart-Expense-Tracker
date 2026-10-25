const mongoose = require('mongoose');

/**
 * Notification types:
 *  - budget_warning     : expenses >= 80% of monthlyBudget
 *  - budget_exceeded    : expenses >= 100% of monthlyBudget
 *  - large_transaction  : single transaction > 50% of monthlyBudget (or > threshold)
 */
const NOTIFICATION_TYPES = ['budget_warning', 'budget_exceeded', 'large_transaction'];

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: NOTIFICATION_TYPES,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    // Snapshot of budget data at the time of the alert
    meta: {
      monthlyBudget: Number,
      totalExpenses: Number,
      percentUsed: Number,
      transactionAmount: Number,   // for large_transaction alerts
      transactionCategory: String, // for large_transaction alerts
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    // Deduplication key — prevents spamming the same alert multiple times in
    // the same month. Format: "{userId}_{type}_{YYYY-MM}"
    deduplicationKey: {
      type: String,
      unique: true,
      sparse: true, // large_transaction alerts don't use this
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for fast unread queries per user
notificationSchema.index({ user: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
module.exports.NOTIFICATION_TYPES = NOTIFICATION_TYPES;

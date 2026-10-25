const Transaction = require('../models/Transaction.model');
const User = require('../models/User.model');
const Notification = require('../models/Notification.model');

// ─── Constants ────────────────────────────────────────────────────────────────

const BUDGET_WARNING_THRESHOLD = 0.8;    // 80%
const BUDGET_EXCEEDED_THRESHOLD = 1.0;   // 100%
const LARGE_TRANSACTION_THRESHOLD = 0.3; // 30% of budget in a single transaction

// ─── Helpers ─────────────────────────────────────────────────────────────────

const getCurrentMonthRange = () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return { start, end };
};

const currentMonthKey = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};

const getMonthlyExpenseTotal = async (userId) => {
  const { start, end } = getCurrentMonthRange();
  const result = await Transaction.aggregate([
    {
      $match: {
        user: userId,
        type: 'expense',
        date: { $gte: start, $lt: end },
      },
    },
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ]);
  return result.length > 0 ? result[0].total : 0;
};

// ─── checkBudgetAlert ─────────────────────────────────────────────────────────

/**
 * Checks if monthly expenses crossed 80% or 100% of the user's budget.
 * Creates one notification per threshold per calendar month (deduplicated).
 * Called after every expense transaction is created or updated.
 *
 * @param {string} userId
 */
const checkBudgetAlert = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user || !user.monthlyBudget || user.monthlyBudget <= 0) return;

    const totalExpenses = await getMonthlyExpenseTotal(userId);
    const percentUsed = totalExpenses / user.monthlyBudget;
    const monthKey = currentMonthKey();

    let alertType = null;
    if (percentUsed >= BUDGET_EXCEEDED_THRESHOLD) {
      alertType = 'budget_exceeded';
    } else if (percentUsed >= BUDGET_WARNING_THRESHOLD) {
      alertType = 'budget_warning';
    }

    if (!alertType) return;

    const deduplicationKey = `${userId}_${alertType}_${monthKey}`;

    const exists = await Notification.findOne({ deduplicationKey });
    if (exists) return;

    const percentLabel = Math.round(percentUsed * 100);
    const remaining = (user.monthlyBudget - totalExpenses).toFixed(2);

    const content =
      alertType === 'budget_exceeded'
        ? {
            title: '🚨 Budget Exceeded',
            message: `You have spent ${percentLabel}% of your monthly budget (${totalExpenses.toFixed(2)} / ${user.monthlyBudget.toFixed(2)}). Consider reducing your expenses for the rest of the month.`,
          }
        : {
            title: '⚠️ Approaching Budget Limit',
            message: `You have used ${percentLabel}% of your monthly budget (${totalExpenses.toFixed(2)} / ${user.monthlyBudget.toFixed(2)}). You have ${remaining} remaining.`,
          };

    await Notification.create({
      user: userId,
      type: alertType,
      title: content.title,
      message: content.message,
      meta: {
        monthlyBudget: user.monthlyBudget,
        totalExpenses: parseFloat(totalExpenses.toFixed(2)),
        percentUsed: parseFloat((percentUsed * 100).toFixed(1)),
      },
      deduplicationKey,
    });

    console.log(`[NotificationService] "${alertType}" alert created for user ${userId} (${percentLabel}% used)`);
  } catch (err) {
    console.error('[NotificationService] checkBudgetAlert error:', err.message);
  }
};

// ─── checkLargeTransactionAlert ──────────────────────────────────────────────

/**
 * Fires when a single expense is >= 30% of the user's monthly budget.
 * No deduplication — every large transaction gets its own notification.
 *
 * @param {string} userId
 * @param {number} amount
 * @param {string} category
 */
const checkLargeTransactionAlert = async (userId, amount, category) => {
  try {
    const user = await User.findById(userId);
    if (!user || !user.monthlyBudget || user.monthlyBudget <= 0) return;

    const percentOfBudget = amount / user.monthlyBudget;
    if (percentOfBudget < LARGE_TRANSACTION_THRESHOLD) return;

    const percentLabel = Math.round(percentOfBudget * 100);

    await Notification.create({
      user: userId,
      type: 'large_transaction',
      title: '💸 Large Transaction Recorded',
      message: `A ${category} expense of ${amount.toFixed(2)} was recorded — that is ${percentLabel}% of your monthly budget in a single transaction.`,
      meta: {
        monthlyBudget: user.monthlyBudget,
        transactionAmount: amount,
        transactionCategory: category,
        percentUsed: parseFloat((percentOfBudget * 100).toFixed(1)),
      },
    });

    console.log(`[NotificationService] "large_transaction" alert created for user ${userId} (${amount} in ${category})`);
  } catch (err) {
    console.error('[NotificationService] checkLargeTransactionAlert error:', err.message);
  }
};

module.exports = { checkBudgetAlert, checkLargeTransactionAlert };

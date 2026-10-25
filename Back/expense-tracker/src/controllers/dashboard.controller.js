const Transaction = require('../models/Transaction.model');

/**
 * GET /api/dashboard/summary
 * Returns total income, total expenses, balance, and recent 5 transactions
 * Optionally filter by ?month=5&year=2024
 */
const getSummary = async (req, res, next) => {
  try {
    const { month, year } = req.query;
    const userId = req.user._id;

    // ─── Build date filter ─────────────────────────────────────────────────
    let dateFilter = {};
    if (month || year) {
      const targetYear = parseInt(year) || new Date().getFullYear();
      const targetMonth = parseInt(month);

      if (month) {
        const start = new Date(targetYear, targetMonth - 1, 1);
        const end = new Date(targetYear, targetMonth, 1);
        dateFilter = { $gte: start, $lt: end };
      } else {
        const start = new Date(targetYear, 0, 1);
        const end = new Date(targetYear + 1, 0, 1);
        dateFilter = { $gte: start, $lt: end };
      }
    }

    const baseMatch = {
      user: userId,
      ...(Object.keys(dateFilter).length > 0 && { date: dateFilter }),
    };

    // ─── Aggregation: totals by type ───────────────────────────────────────
    const [totals, recentTransactions] = await Promise.all([
      Transaction.aggregate([
        { $match: baseMatch },
        {
          $group: {
            _id: '$type',
            total: { $sum: '$amount' },
            count: { $sum: 1 },
          },
        },
      ]),
      Transaction.find(baseMatch).sort({ date: -1 }).limit(5).lean(),
    ]);

    // ─── Parse aggregation results ─────────────────────────────────────────
    let totalIncome = 0;
    let totalExpenses = 0;
    let incomeCount = 0;
    let expenseCount = 0;

    totals.forEach((item) => {
      if (item._id === 'income') {
        totalIncome = item.total;
        incomeCount = item.count;
      } else if (item._id === 'expense') {
        totalExpenses = item.total;
        expenseCount = item.count;
      }
    });

    const balance = totalIncome - totalExpenses;
    const budgetUsedPercent =
      req.user.monthlyBudget > 0
        ? Math.round((totalExpenses / req.user.monthlyBudget) * 100)
        : null;

    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalIncome: parseFloat(totalIncome.toFixed(2)),
          totalExpenses: parseFloat(totalExpenses.toFixed(2)),
          balance: parseFloat(balance.toFixed(2)),
          incomeCount,
          expenseCount,
          monthlyBudget: req.user.monthlyBudget,
          budgetUsedPercent,
          budgetStatus:
            budgetUsedPercent === null
              ? 'not_set'
              : budgetUsedPercent >= 100
              ? 'exceeded'
              : budgetUsedPercent >= 80
              ? 'warning'
              : 'on_track',
        },
        recentTransactions,
        period: {
          month: month ? parseInt(month) : null,
          year: year ? parseInt(year) : null,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getSummary };

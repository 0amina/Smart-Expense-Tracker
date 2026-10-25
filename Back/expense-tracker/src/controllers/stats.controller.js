const Transaction = require('../models/Transaction.model');

/**
 * GET /api/stats/categories
 * Spending breakdown by category (MongoDB aggregation)
 * Query: ?type=expense&month=5&year=2024
 */
const getCategoryStats = async (req, res, next) => {
  try {
    const { type = 'expense', month, year } = req.query;
    const userId = req.user._id;

    const matchStage = { user: userId };

    if (['income', 'expense'].includes(type)) {
      matchStage.type = type;
    }

    if (month || year) {
      const targetYear = parseInt(year) || new Date().getFullYear();
      const targetMonth = parseInt(month);

      if (month) {
        matchStage.date = {
          $gte: new Date(targetYear, targetMonth - 1, 1),
          $lt: new Date(targetYear, targetMonth, 1),
        };
      } else {
        matchStage.date = {
          $gte: new Date(targetYear, 0, 1),
          $lt: new Date(targetYear + 1, 0, 1),
        };
      }
    }

    const stats = await Transaction.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
          avgAmount: { $avg: '$amount' },
        },
      },
      { $sort: { total: -1 } },
      {
        $project: {
          _id: 0,
          category: '$_id',
          total: { $round: ['$total', 2] },
          count: 1,
          avgAmount: { $round: ['$avgAmount', 2] },
        },
      },
    ]);

    // Calculate grand total for percentage calculation
    const grandTotal = stats.reduce((sum, s) => sum + s.total, 0);

    const statsWithPercentage = stats.map((s) => ({
      ...s,
      percentage: grandTotal > 0 ? parseFloat(((s.total / grandTotal) * 100).toFixed(1)) : 0,
    }));

    res.status(200).json({
      success: true,
      data: {
        categories: statsWithPercentage,
        grandTotal: parseFloat(grandTotal.toFixed(2)),
        type,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/stats/monthly
 * Month-by-month breakdown for the past N months (default: 6)
 * Query: ?months=6
 */
const getMonthlyStats = async (req, res, next) => {
  try {
    const { months = 6 } = req.query;
    const userId = req.user._id;

    const monthsNum = Math.min(24, Math.max(1, parseInt(months)));

    // Start date: first day of N months ago
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - monthsNum + 1);
    startDate.setDate(1);
    startDate.setHours(0, 0, 0, 0);

    const stats = await Transaction.aggregate([
      {
        $match: {
          user: userId,
          date: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
            type: '$type',
          },
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    // ─── Transform into a clean month-based structure ──────────────────────
    const monthMap = {};

    stats.forEach(({ _id, total, count }) => {
      const key = `${_id.year}-${String(_id.month).padStart(2, '0')}`;

      if (!monthMap[key]) {
        monthMap[key] = {
          year: _id.year,
          month: _id.month,
          period: key,
          income: 0,
          expense: 0,
          incomeCount: 0,
          expenseCount: 0,
          balance: 0,
        };
      }

      if (_id.type === 'income') {
        monthMap[key].income = parseFloat(total.toFixed(2));
        monthMap[key].incomeCount = count;
      } else {
        monthMap[key].expense = parseFloat(total.toFixed(2));
        monthMap[key].expenseCount = count;
      }
    });

    // Calculate balance for each month
    const monthly = Object.values(monthMap).map((m) => ({
      ...m,
      balance: parseFloat((m.income - m.expense).toFixed(2)),
    }));

    res.status(200).json({
      success: true,
      data: {
        monthly,
        periodMonths: monthsNum,
        startDate: startDate.toISOString().split('T')[0],
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getCategoryStats, getMonthlyStats };

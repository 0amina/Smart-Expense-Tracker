const Transaction = require('../models/Transaction.model');
const { transactionsToCsv } = require('../services/csvService');

/**
 * GET /api/export/csv
 *
 * Exports the authenticated user's transactions as a downloadable CSV file.
 *
 * Supports the same query filters as GET /api/transactions:
 *   ?type=expense&category=Food&month=5&year=2024&search=coffee
 *   &startDate=2024-01-01&endDate=2024-05-31
 *   &currency=DT
 */
const exportTransactionsCsv = async (req, res, next) => {
  try {
    const { type, category, month, year, search, startDate, endDate, currency } = req.query;

    // ─── Build filter ──────────────────────────────────────────────────────
    const filter = { user: req.user._id };

    if (type && ['income', 'expense'].includes(type)) {
      filter.type = type;
    }

    if (category) {
      filter.category = category;
    }

    if (search) {
      filter.description = { $regex: search, $options: 'i' };
    }

    // Date range: explicit startDate/endDate takes priority over month/year
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999); // include full end day
        filter.date.$lte = end;
      }
    } else if (month || year) {
      const targetYear = parseInt(year) || new Date().getFullYear();
      const targetMonth = parseInt(month);

      if (month) {
        filter.date = {
          $gte: new Date(targetYear, targetMonth - 1, 1),
          $lt: new Date(targetYear, targetMonth, 1),
        };
      } else {
        filter.date = {
          $gte: new Date(targetYear, 0, 1),
          $lt: new Date(targetYear + 1, 0, 1),
        };
      }
    }

    // ─── Fetch — no pagination limit for export ────────────────────────────
    const transactions = await Transaction.find(filter).sort({ date: -1 }).lean();

    if (transactions.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No transactions found for the selected filters. Nothing to export.',
      });
    }

    // ─── Generate CSV ──────────────────────────────────────────────────────
    const csv = transactionsToCsv(transactions, { currency: currency || 'DT' });

    // ─── Build a descriptive filename ──────────────────────────────────────
    const now = new Date();
    const dateStamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const filterLabel = type ? `_${type}` : '';
    const monthLabel = month ? `_${year || now.getFullYear()}-${String(month).padStart(2, '0')}` : '';
    const filename = `transactions${filterLabel}${monthLabel}_${dateStamp}.csv`;

    // ─── Send as file download ─────────────────────────────────────────────
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Cache-Control', 'no-cache');

    // UTF-8 BOM — ensures Excel opens the file with correct encoding
    res.send('\uFEFF' + csv);
  } catch (err) {
    next(err);
  }
};

module.exports = { exportTransactionsCsv };

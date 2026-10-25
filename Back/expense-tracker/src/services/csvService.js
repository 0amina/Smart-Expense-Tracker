/**
 * CSV Export Service
 * Pure Node.js — no external dependencies required
 */

/**
 * Escapes a single CSV cell value:
 * - Wraps in quotes if it contains commas, quotes, or newlines
 * - Escapes internal double-quotes by doubling them
 *
 * @param {any} value
 * @returns {string}
 */
const escapeCell = (value) => {
  if (value === null || value === undefined) return '';
  const str = String(value);
  // If the value contains a comma, double-quote, or newline — wrap in quotes
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};

/**
 * Formats a Date object to a readable local string (YYYY-MM-DD HH:MM:SS)
 *
 * @param {Date|string} date
 * @returns {string}
 */
const formatDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  const pad = (n) => String(n).padStart(2, '0');
  return (
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ` +
    `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
  );
};

/**
 * Converts an array of transaction documents to a CSV string.
 *
 * Columns: #, Date, Type, Category, Amount, Description, Created At
 *
 * @param {Array} transactions - Array of Mongoose lean transaction objects
 * @param {Object} [options]
 * @param {string} [options.currency='DT'] - Currency label for the Amount column header
 * @returns {string} Full CSV content as a string
 */
const transactionsToCsv = (transactions, options = {}) => {
  const { currency = 'DT' } = options;

  const headers = ['#', 'Date', 'Type', 'Category', `Amount (${currency})`, 'Description', 'Created At'];

  const rows = transactions.map((tx, index) => [
    index + 1,
    formatDate(tx.date),
    tx.type,
    tx.category,
    tx.amount.toFixed(2),
    tx.description || '',
    formatDate(tx.createdAt),
  ]);

  // ─── Build summary footer ──────────────────────────────────────────────────
  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const summaryRows = [
    [],
    ['', '', '', 'SUMMARY', '', '', ''],
    ['', '', '', 'Total Income', totalIncome.toFixed(2), '', ''],
    ['', '', '', 'Total Expenses', totalExpenses.toFixed(2), '', ''],
    ['', '', '', 'Balance', (totalIncome - totalExpenses).toFixed(2), '', ''],
    ['', '', '', 'Total Records', transactions.length, '', ''],
  ];

  const allRows = [headers, ...rows, ...summaryRows];

  return allRows.map((row) => row.map(escapeCell).join(',')).join('\r\n');
};

module.exports = { transactionsToCsv };

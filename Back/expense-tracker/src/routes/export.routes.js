const express = require('express');
const router = express.Router();

const { exportTransactionsCsv } = require('../controllers/export.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);

// GET /api/export/csv
router.get('/csv', exportTransactionsCsv);

module.exports = router;

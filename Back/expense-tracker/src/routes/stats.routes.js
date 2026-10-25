const express = require('express');
const router = express.Router();

const { getCategoryStats, getMonthlyStats } = require('../controllers/stats.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);

router.get('/categories', getCategoryStats);
router.get('/monthly', getMonthlyStats);

module.exports = router;

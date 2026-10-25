const express = require('express');
const router = express.Router();

const {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications,
} = require('../controllers/notification.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);

router.get('/', getNotifications);
router.delete('/', deleteAllNotifications);

router.patch('/read-all', markAllAsRead);

router.patch('/:id/read', markAsRead);
router.delete('/:id', deleteNotification);

module.exports = router;

const Notification = require('../models/Notification.model');

/**
 * GET /api/notifications
 * Get all notifications for the authenticated user, newest first.
 * Query: ?unreadOnly=true&limit=20
 */
const getNotifications = async (req, res, next) => {
  try {
    const { unreadOnly, limit = 20 } = req.query;
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));

    const filter = { user: req.user._id };
    if (unreadOnly === 'true') filter.isRead = false;

    const [notifications, unreadCount] = await Promise.all([
      Notification.find(filter).sort({ createdAt: -1 }).limit(limitNum).lean(),
      Notification.countDocuments({ user: req.user._id, isRead: false }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        notifications,
        unreadCount,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/notifications/:id/read
 * Mark a single notification as read.
 */
const markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { isRead: true },
      { new: true }
    ).lean();

    if (!notification) {
      const error = new Error('Notification not found');
      error.statusCode = 404;
      return next(error);
    }

    res.status(200).json({
      success: true,
      message: 'Notification marked as read',
      data: { notification },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/notifications/read-all
 * Mark ALL unread notifications as read for the authenticated user.
 */
const markAllAsRead = async (req, res, next) => {
  try {
    const result = await Notification.updateMany(
      { user: req.user._id, isRead: false },
      { isRead: true }
    );

    res.status(200).json({
      success: true,
      message: `${result.modifiedCount} notification(s) marked as read`,
      data: { modifiedCount: result.modifiedCount },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/notifications/:id
 * Delete a single notification (must belong to authenticated user).
 */
const deleteNotification = async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!notification) {
      const error = new Error('Notification not found');
      error.statusCode = 404;
      return next(error);
    }

    res.status(200).json({
      success: true,
      message: 'Notification deleted',
      data: null,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/notifications
 * Clear all notifications for the authenticated user.
 */
const deleteAllNotifications = async (req, res, next) => {
  try {
    const result = await Notification.deleteMany({ user: req.user._id });

    res.status(200).json({
      success: true,
      message: `${result.deletedCount} notification(s) deleted`,
      data: { deletedCount: result.deletedCount },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications,
};

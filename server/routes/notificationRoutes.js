import express from 'express';
import {
    getMyNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead
} from '../controllers/notificationController.js';
import { protect } from '../middleware/authMiddleware.js';
import { requireVerified } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.get('/', protect, requireVerified, getMyNotifications);
router.get('/unread-count', protect, requireVerified, getUnreadCount);
router.patch('/:id/read', protect, requireVerified, markAsRead);
router.patch('/mark-all-read', protect, requireVerified, markAllAsRead);

export default router;

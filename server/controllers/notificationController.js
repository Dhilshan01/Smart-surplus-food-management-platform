import pool from '../config/db.js';

export const getMyNotifications = async (req, res) => {
    try {
        const notifications = await pool.query(
            `SELECT * FROM notifications 
             WHERE user_id = $1 
             ORDER BY created_at DESC 
             LIMIT 20`,
            [req.user.id]
        );
        res.status(200).json(notifications.rows);
    } catch (error) {
        console.error('Get notifications error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// GET UNREAD COUNT
export const getUnreadCount = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT COUNT(*) FROM notifications 
             WHERE user_id = $1 AND is_read = false`,
            [req.user.id]
        );
        res.status(200).json({ count: parseInt(result.rows[0].count) });
    } catch (error) {
        console.error('Unread count error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// MARK ONE AS READ
export const markAsRead = async (req, res) => {
    try {
        await pool.query(
            `UPDATE notifications SET is_read = true 
             WHERE id = $1 AND user_id = $2`,
            [req.params.id, req.user.id]
        );
        res.status(200).json({ message: 'Marked as read' });
    } catch (error) {
        console.error('Mark read error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// MARK ALL AS READ
export const markAllAsRead = async (req, res) => {
    try {
        await pool.query(
            `UPDATE notifications SET is_read = true WHERE user_id = $1`,
            [req.user.id]
        );
        res.status(200).json({ message: 'All marked as read' });
    } catch (error) {
        console.error('Mark all read error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
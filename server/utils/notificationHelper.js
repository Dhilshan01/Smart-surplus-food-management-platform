import pool from '../config/db.js';

export const createNotification = async (userId, title, message, type = 'general') => {
    try {
        await pool.query(
            `INSERT INTO notifications (user_id, title, message, type)
             VALUES ($1, $2, $3, $4)`,
            [userId, title, message, type]
        );
    } catch (error) {
        console.error('Create notification error:', error);
    }
};

// Notify all charities in a city about urgent food
export const notifyCharitiesUrgent = async (listing) => {
    try {
        const charities = await pool.query(
            `SELECT id FROM users 
             WHERE role = 'charity' 
             AND is_active = true
             AND (city ILIKE $1 OR city IS NULL)`,
            [listing.city]
        );

        for (const charity of charities.rows) {
            await createNotification(
                charity.id,
                '🚨 Urgent Food Available',
                `"${listing.title}" in ${listing.city} is expiring soon. Collect before it expires!`,
                'urgent'
            );
        }
    } catch (error) {
        console.error('Notify charities error:', error);
    }
};
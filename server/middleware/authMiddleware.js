import jwt from 'jsonwebtoken';
import pool from '../config/db.js';

export const protect = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await pool.query(
            `SELECT id, role, is_active, verification_status FROM users WHERE id = $1`,
            [decoded.id]
        );

        if (user.rows.length === 0) {
            return res.status(401).json({ message: 'User no longer exists' });
        }
        if (!user.rows[0].is_active) {
            return res.status(403).json({ message: 'Account is deactivated' });
        }

        req.user = {
            id: user.rows[0].id,
            role: user.rows[0].role,
            verification_status: user.rows[0].verification_status
        };
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Token is not valid' });
    }
};

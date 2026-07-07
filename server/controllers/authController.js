import pool from '../config/db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// REGISTER
export const register = async (req, res) => {
    const {
        full_name,
        email,
        password,
        role,
        organization_name,
        phone,
        address,
        city,
        registration_number,
        business_type,
        service_area,
        charity_type
    } = req.body;

    if (!['donor', 'charity'].includes(role)) {
        return res.status(400).json({ message: 'Public registration is only available for donors and charities' });
    }
    if (!full_name || !email || !password) {
        return res.status(400).json({ message: 'Full name, email, and password are required' });
    }
    if (password.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const client = await pool.connect();
    let committed = false;
    try {
        await client.query('BEGIN');

        const existingUser = await client.query(
            'SELECT * FROM users WHERE email = $1', [email]
        );
        if (existingUser.rows.length > 0) {
            await client.query('ROLLBACK');
            return res.status(400).json({ message: 'Email already registered' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await client.query(
            `INSERT INTO users (full_name, email, password, role, organization_name, phone, address, city)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id, full_name, email, role`,
            [full_name, email, hashedPassword, role, organization_name, phone, address, city]
        );

        let businessProfile = null;
        let charityProfile = null;
        if (role === 'donor') {
            const profile = await client.query(
                `INSERT INTO business_profiles (user_id, registration_number, business_type)
                 VALUES ($1, $2, $3)
                 RETURNING id, user_id, registration_number, business_type`,
                [newUser.rows[0].id, registration_number || null, business_type || null]
            );
            businessProfile = profile.rows[0];
        }
        if (role === 'charity') {
            const profile = await client.query(
                `INSERT INTO charity_profiles (user_id, registration_number, service_area, charity_type)
                 VALUES ($1, $2, $3, $4)
                 RETURNING id, user_id, registration_number, service_area, charity_type`,
                [newUser.rows[0].id, registration_number || null, service_area || city || null, charity_type || null]
            );
            charityProfile = profile.rows[0];
        }

        await client.query(
            `INSERT INTO audit_logs (actor_id, action, entity_type, entity_id, details)
             VALUES ($1, 'register', 'user', $1, $2)`,
            [newUser.rows[0].id, JSON.stringify({ role })]
        );

        await client.query('COMMIT');
        committed = true;

        const token = jwt.sign(
            { id: newUser.rows[0].id, role: newUser.rows[0].role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(201).json({
            message: 'Registration successful',
            token,
            user: {
                ...newUser.rows[0],
                business_profile: businessProfile,
                charity_profile: charityProfile
            }
        });

    } catch (error) {
        if (!committed) {
            await client.query('ROLLBACK');
        }
        console.error('Register error:', error);
        res.status(500).json({ message: 'Server error' });
    } finally {
        client.release();
    }
};

// LOGIN
export const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await pool.query(
            `SELECT u.*, bp.id AS business_profile_id, bp.registration_number AS business_registration_number,
                    bp.business_type, cp.id AS charity_profile_id,
                    cp.registration_number AS charity_registration_number, cp.service_area, cp.charity_type
             FROM users u
             LEFT JOIN business_profiles bp ON bp.user_id = u.id
             LEFT JOIN charity_profiles cp ON cp.user_id = u.id
             WHERE u.email = $1`,
            [email]
        );
        if (user.rows.length === 0) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }


        const isMatch = await bcrypt.compare(password, user.rows[0].password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }


        if (!user.rows[0].is_active) {
            return res.status(403).json({ message: 'Account is deactivated' });
        }

        const token = jwt.sign(
            { id: user.rows[0].id, role: user.rows[0].role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(200).json({
            message: 'Login successful',
            token,
            user: {
                id: user.rows[0].id,
                full_name: user.rows[0].full_name,
                email: user.rows[0].email,
                role: user.rows[0].role,
                organization_name: user.rows[0].organization_name,
                phone: user.rows[0].phone,
                city: user.rows[0].city,
                verification_status: user.rows[0].verification_status,
                business_profile: user.rows[0].business_profile_id
                    ? {
                        id: user.rows[0].business_profile_id,
                        user_id: user.rows[0].id,
                        registration_number: user.rows[0].business_registration_number,
                        business_type: user.rows[0].business_type
                    }
                    : null,
                charity_profile: user.rows[0].charity_profile_id
                    ? {
                        id: user.rows[0].charity_profile_id,
                        user_id: user.rows[0].id,
                        registration_number: user.rows[0].charity_registration_number,
                        service_area: user.rows[0].service_area,
                        charity_type: user.rows[0].charity_type
                    }
                    : null
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// GET CURRENT USER
export const getMe = async (req, res) => {
    try {
        const user = await pool.query(
            `SELECT u.id, u.full_name, u.email, u.role, u.organization_name, u.phone, u.address,
                    u.city, u.verification_status,
                    bp.id AS business_profile_id, bp.registration_number AS business_registration_number,
                    bp.business_type, cp.id AS charity_profile_id,
                    cp.registration_number AS charity_registration_number, cp.service_area, cp.charity_type
             FROM users u
             LEFT JOIN business_profiles bp ON bp.user_id = u.id
             LEFT JOIN charity_profiles cp ON cp.user_id = u.id
             WHERE u.id = $1`,
            [req.user.id]
        );
        if (user.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const row = user.rows[0];
        res.status(200).json({
            id: row.id,
            full_name: row.full_name,
            email: row.email,
            role: row.role,
            organization_name: row.organization_name,
            phone: row.phone,
            address: row.address,
            city: row.city,
            verification_status: row.verification_status,
            business_profile: row.business_profile_id
                ? {
                    id: row.business_profile_id,
                    user_id: row.id,
                    registration_number: row.business_registration_number,
                    business_type: row.business_type
                }
                : null,
            charity_profile: row.charity_profile_id
                ? {
                    id: row.charity_profile_id,
                    user_id: row.id,
                    registration_number: row.charity_registration_number,
                    service_area: row.service_area,
                    charity_type: row.charity_type
                }
                : null
        });
    } catch (error) {
        console.error('GetMe error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const updateMe = async (req, res) => {
    const {
        full_name,
        organization_name,
        phone,
        address,
        city,
        registration_number,
        business_type,
        service_area,
        charity_type
    } = req.body;

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const user = await client.query(
            `UPDATE users
             SET full_name = COALESCE($1, full_name),
                 organization_name = COALESCE($2, organization_name),
                 phone = COALESCE($3, phone),
                 address = COALESCE($4, address),
                 city = COALESCE($5, city)
             WHERE id = $6
             RETURNING id, full_name, email, role, organization_name, phone, address, city, verification_status`,
            [full_name, organization_name, phone, address, city, req.user.id]
        );

        if (user.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ message: 'User not found' });
        }

        let businessProfile = null;
        let charityProfile = null;

        if (user.rows[0].role === 'donor') {
            const profile = await client.query(
                `INSERT INTO business_profiles (user_id, registration_number, business_type)
                 VALUES ($1, $2, $3)
                 ON CONFLICT (user_id) DO UPDATE
                   SET registration_number = EXCLUDED.registration_number,
                       business_type = EXCLUDED.business_type
                 RETURNING id, user_id, registration_number, business_type`,
                [req.user.id, registration_number || null, business_type || null]
            );
            businessProfile = profile.rows[0];
        }

        if (user.rows[0].role === 'charity') {
            const profile = await client.query(
                `INSERT INTO charity_profiles (user_id, registration_number, service_area, charity_type)
                 VALUES ($1, $2, $3, $4)
                 ON CONFLICT (user_id) DO UPDATE
                   SET registration_number = EXCLUDED.registration_number,
                       service_area = EXCLUDED.service_area,
                       charity_type = EXCLUDED.charity_type
                 RETURNING id, user_id, registration_number, service_area, charity_type`,
                [req.user.id, registration_number || null, service_area || city || null, charity_type || null]
            );
            charityProfile = profile.rows[0];
        }

        await client.query(
            `INSERT INTO audit_logs (actor_id, action, entity_type, entity_id)
             VALUES ($1, 'profile.update', 'user', $1)`,
            [req.user.id]
        );

        await client.query('COMMIT');

        res.status(200).json({
            message: 'Profile updated',
            user: {
                ...user.rows[0],
                business_profile: businessProfile,
                charity_profile: charityProfile
            }
        });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Update profile error:', error);
        res.status(500).json({ message: 'Server error' });
    } finally {
        client.release();
    }
};

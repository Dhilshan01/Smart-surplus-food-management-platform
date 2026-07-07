import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import './config/db.js';
import authRoutes from './routes/authRoutes.js';
import listingRoutes from './routes/listingRoutes.js';
import './utils/cronJobs.js';
import claimRoutes from './routes/claimRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import transactionRoutes from './routes/transactionRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import complaintRoutes from './routes/complaintRoutes.js';



dotenv.config();

const app = express();

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0';

const allowedOrigins = [
    process.env.CLIENT_URL,
    ...(process.env.CLIENT_URLS ? process.env.CLIENT_URLS.split(',').map((origin) => origin.trim()) : []),
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://192.168.1.41:5173',
].filter(Boolean);

const isLocalDevOrigin = (origin) =>
    /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin);

const isLanDevOrigin = (origin) =>
    /^http:\/\/(10\.\d{1,3}\.\d{1,3}\.\d{1,3}|172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3}|192\.168\.\d{1,3}\.\d{1,3}):\d+$/.test(origin);

app.use(cors({
    origin(origin, callback) {
        if (!origin || allowedOrigins.includes(origin) || isLocalDevOrigin(origin) || isLanDevOrigin(origin)) {
            return callback(null, true);
        }
        return callback(new Error(`CORS blocked origin: ${origin}`));
    },
    credentials: true,
}));
app.use(express.json({ limit: '6mb' }));


// Routes
app.use('/api/auth', authRoutes);
app.use('/api/listings', listingRoutes);
app.use('/api/claims', claimRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/complaints', complaintRoutes);

app.get('/', (req, res) => {
    res.send('Smart Food Waste API is running');
});

app.listen(PORT, HOST, () => {
    console.log(`Server running on http://${HOST}:${PORT}`);
});

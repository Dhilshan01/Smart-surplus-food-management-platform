import express from 'express';
import {
    getStats,
    getAllUsers,
    toggleUserStatus,
    deleteUser,
    getAllListings,
    deleteAnyListing,
    getAllClaims,
    getPlatformAnalytics,
    updateUserVerification,
    getAllTransactions,
    getAuditLogs,
    downloadPlatformReport,
    getAllComplaints,
    updateComplaint
} from '../controllers/adminController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(protect, authorizeRoles('admin'));

router.get('/stats', getStats);
router.get('/users', getAllUsers);
router.patch('/users/:id/toggle', toggleUserStatus);
router.patch('/users/:id/verification', updateUserVerification);
router.delete('/users/:id', deleteUser);
router.get('/listings', getAllListings);
router.delete('/listings/:id', deleteAnyListing);
router.get('/claims', getAllClaims);
router.get('/transactions', getAllTransactions);
router.get('/audit-logs', getAuditLogs);
router.get('/complaints', getAllComplaints);
router.patch('/complaints/:id', updateComplaint);
router.get('/analytics', getPlatformAnalytics);
router.get('/reports/platform', downloadPlatformReport);

export default router;

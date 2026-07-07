import express from 'express';
import { getBusinessAnalytics, downloadBusinessReport } from '../controllers/analyticsController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles, requireVerified } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.get('/business', protect, authorizeRoles('donor'), requireVerified, getBusinessAnalytics);
router.get('/my-stats', protect, authorizeRoles('donor'), requireVerified, getBusinessAnalytics);
router.get('/business/report', protect, authorizeRoles('donor'), requireVerified, downloadBusinessReport);

export default router;

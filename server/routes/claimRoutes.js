import express from 'express';
import {
    claimListing,
    getMyClaims,
    getReceivedClaims,
    updateClaimDecision,
    markCollected
} from '../controllers/claimController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.post('/', protect, authorizeRoles('charity'), claimListing);
router.get('/my-claims', protect, authorizeRoles('charity'), getMyClaims);
router.get('/received', protect, authorizeRoles('donor'), getReceivedClaims);
router.patch('/:id/decision', protect, authorizeRoles('donor'), updateClaimDecision);
router.patch('/:id/collect', protect, authorizeRoles('charity'), markCollected);

export default router;

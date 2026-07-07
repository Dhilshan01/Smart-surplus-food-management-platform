import express from 'express';
import {
    claimListing,
    getMyClaims,
    getReceivedClaims,
    updateClaimDecision,
    markCollected
} from '../controllers/claimController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles, requireVerified } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.post('/', protect, authorizeRoles('charity'), requireVerified, claimListing);
router.get('/my-claims', protect, authorizeRoles('charity'), requireVerified, getMyClaims);
router.get('/received', protect, authorizeRoles('donor'), requireVerified, getReceivedClaims);
router.patch('/:id/decision', protect, authorizeRoles('donor'), requireVerified, updateClaimDecision);
router.patch('/:id/collect', protect, authorizeRoles('charity'), requireVerified, markCollected);

export default router;

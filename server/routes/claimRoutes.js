import express from 'express';
import { claimListing, getMyClaims, markCollected } from '../controllers/claimController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.post('/', protect, authorizeRoles('charity'), claimListing);
router.get('/my-claims', protect, authorizeRoles('charity'), getMyClaims);
router.patch('/:id/collect', protect, authorizeRoles('charity'), markCollected);

export default router;
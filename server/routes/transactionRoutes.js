import express from 'express';
import {
    createTransaction, getMyPurchases, getMySales, markTransactionCollected
} from '../controllers/transactionController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles, requireVerified } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.post('/', protect, authorizeRoles('donor'), requireVerified, createTransaction);
router.get('/my-purchases', protect, authorizeRoles('donor'), requireVerified, getMyPurchases);
router.get('/my-sales', protect, authorizeRoles('donor'), requireVerified, getMySales);
router.patch('/:id/collect', protect, authorizeRoles('donor'), requireVerified, markTransactionCollected);

export default router;

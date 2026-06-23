import express from 'express';
import {
    createTransaction, getMyPurchases, getMySales, markTransactionCollected
} from '../controllers/transactionController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.post('/', protect, authorizeRoles('donor'), createTransaction);
router.get('/my-purchases', protect, authorizeRoles('donor'), getMyPurchases);
router.get('/my-sales', protect, authorizeRoles('donor'), getMySales);
router.patch('/:id/collect', protect, authorizeRoles('donor'), markTransactionCollected);

export default router;

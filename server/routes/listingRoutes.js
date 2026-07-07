import express from 'express';
import {
    createListing,
    getAvailableListings,
    getMyListings,
    getListingById,
    updateListingStatus,
    updateListing,
    deleteListing,
    getMarketplaceListings,
    getMatchedListings
} from '../controllers/listingController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles, requireVerified } from '../middleware/roleMiddleware.js';


const router = express.Router();

router.post('/', protect, authorizeRoles('donor'), requireVerified, createListing);
router.get('/available', protect, authorizeRoles('charity', 'admin'), requireVerified, getAvailableListings);
router.get('/my-listings', protect, authorizeRoles('donor'), requireVerified, getMyListings);
router.get('/marketplace', protect, authorizeRoles('donor'), requireVerified, getMarketplaceListings);
router.get('/matched', protect, authorizeRoles('charity'), requireVerified, getMatchedListings);
router.get('/:id', protect, requireVerified, getListingById);
router.put('/:id', protect, authorizeRoles('donor'), requireVerified, updateListing);
router.patch('/:id/status', protect, authorizeRoles('donor'), requireVerified, updateListingStatus);
router.delete('/:id', protect, authorizeRoles('donor'), requireVerified, deleteListing);

export default router;

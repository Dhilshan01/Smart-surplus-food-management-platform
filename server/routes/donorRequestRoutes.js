import express from "express";
import {
  createDonorRequest,
  getMyDonorRequests,
  getReceivedDonorRequests,
  getRegisteredDonors,
  updateDonorRequestDecision,
} from "../controllers/donorRequestController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles, requireVerified } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.get("/donors", protect, authorizeRoles("charity"), requireVerified, getRegisteredDonors);
router.post("/", protect, authorizeRoles("charity"), requireVerified, createDonorRequest);
router.get("/mine", protect, authorizeRoles("charity"), requireVerified, getMyDonorRequests);
router.get("/received", protect, authorizeRoles("donor"), requireVerified, getReceivedDonorRequests);
router.patch("/:id/decision", protect, authorizeRoles("donor"), requireVerified, updateDonorRequestDecision);

export default router;

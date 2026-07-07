import express from "express";
import { createComplaint } from "../controllers/complaintController.js";
import { protect } from "../middleware/authMiddleware.js";
import { requireVerified } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.post("/", protect, requireVerified, createComplaint);

export default router;

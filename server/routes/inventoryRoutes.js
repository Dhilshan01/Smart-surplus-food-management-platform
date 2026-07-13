import express from "express";
import {
  createInventoryItem,
  createListingFromInventory,
  deleteInventoryItem,
  getInventoryItems,
  updateInventoryItem,
} from "../controllers/inventoryController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles, requireVerified } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.get("/", protect, authorizeRoles("donor"), requireVerified, getInventoryItems);
router.post("/", protect, authorizeRoles("donor"), requireVerified, createInventoryItem);
router.put("/:id", protect, authorizeRoles("donor"), requireVerified, updateInventoryItem);
router.delete("/:id", protect, authorizeRoles("donor"), requireVerified, deleteInventoryItem);
router.post("/:id/listings", protect, authorizeRoles("donor"), requireVerified, createListingFromInventory);

export default router;

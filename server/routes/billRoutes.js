import express from "express";
import Bill from "../models/Bill.js";
import User from "../models/User.js";
const router = express.Router();
import {
  generateBill,
  getAllBills,
  getBillsByUserId,
  getUserTransactions,
  getAllTransactions,
  getBillsByGeneratedBy,
  getBillById,
} from "../controller/billController.js";
import { authMiddleware, adminMiddleware } from "../middleware/authMiddleware.js";

// Generate a new bill (requires authentication)
router.post("/", authMiddleware, generateBill);

// Get all bills (admin only)
router.get("/", authMiddleware, adminMiddleware, getAllBills);

// Get bills by specific user ID (admin only)
router.get('/generated-by/:username', authMiddleware, adminMiddleware, getBillsByUserId);

// Get the logged-in user's transactions
router.get("/me/user", authMiddleware, getUserTransactions);

// grt bill by bill id
router.get("/:id", authMiddleware, getBillById);




export default router;
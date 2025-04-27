import express from "express";
import { addCategory, getCategories, deleteCategory } from "../controller/categoryController.js";
import { authMiddleware, adminMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// ✅ Add a new category (Admin only)
router.post("/",  addCategory);

// ✅ Get all categories (Public)
router.get("/", getCategories);

// ✅ Delete category (Admin only)
router.delete("/:id",deleteCategory);

export default router;

import express from "express";
import {
  getSuppliers,
  addSupplier,
  updateSupplier,
  deleteSupplier
} from "../controller/supplierController.js";

const router = express.Router();

router.get("/", getSuppliers); // Get all suppliers
router.post("/", addSupplier); // Add supplier
router.put("/:id", updateSupplier); // Update supplier
router.delete("/:id", deleteSupplier); // Delete supplier

export default router;

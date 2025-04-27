import express from "express";
import PurchaseOrder from "../models/PurchaseOrder.js"; // ✅ Important: this was missing

import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// Create a new purchase order
router.post("/", authMiddleware, async (req, res) => {
  try {
    const newOrder = new PurchaseOrder({
      ...req.body,
      createdBy: req.user._id,
    });
    await newOrder.save();
    res.status(201).json({ message: "Purchase order created", newOrder });
  } catch (err) {
    res.status(500).json({ message: "Failed to create order", error: err.message });
  }
});

// Get all purchase orders (admin)
router.get("/", authMiddleware, async (req, res) => {
  try {
    const orders = await PurchaseOrder.find().populate("createdBy", "name email");
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch orders" });
  }
});

// Get orders created by the logged-in user
router.get("/my-orders", authMiddleware, async (req, res) => {
  try {
    const orders = await PurchaseOrder.find({ createdBy: req.user._id });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch your orders" });
  }
});

// Update order status (admin only)
router.put("/:id/status", authMiddleware, async (req, res) => {
  const { status } = req.body;
  try {
    const order = await PurchaseOrder.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    order.status = status;
    await order.save();
    res.json({ message: "Status updated", order });
  } catch (err) {
    res.status(500).json({ message: "Failed to update status" });
  }
});


/// Change from PATCH to DELETE
router.delete("/cancel/:id", authMiddleware, async (req, res) => {
  try {
    const deletedOrder = await PurchaseOrder.findByIdAndDelete(req.params.id);

    if (!deletedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json({ message: "Order deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error while deleting the order" });
  }
});



// Example: purchaseRoutes.js (or wherever you handle purchase orders)
router.put("/:id",authMiddleware ,async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const order = await PurchaseOrder.findById(id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    order.status = status;
    await order.save();

    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
}
);


export default router;

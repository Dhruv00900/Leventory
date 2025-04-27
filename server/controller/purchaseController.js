import PurchaseOrder from "../models/PurchaseOrder.js";
import User from "../models/User.js";

import mongoose from "mongoose"; // Ensure mongoose is imported

export const createPurchaseOrder = async (req, res) => {
  try {
    console.log("Received Purchase Order Request:", req.body);

    const { productName, quantity, shippingAddress, sellerName } = req.body;

    if (!productName || !quantity || !shippingAddress) {
      console.log("Missing required fields:", req.body);
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (!req.user || !req.user.id) {
      return res.status(403).json({ message: "Unauthorized: No user ID found" });
    }

    const createdBy = req.user.id; // ✅ Use authenticated user's ID

    // Convert createdBy to a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(createdBy)) {
      return res.status(400).json({ message: "Invalid createdBy ObjectId" });
    }

    const newOrder = new PurchaseOrder({
      productName,
      quantity,
      shippingAddress,
      sellerName: sellerName || "Unknown Seller",
      createdBy: new mongoose.Types.ObjectId(createdBy),
      status: "Pending",
      orderDate: new Date(),
    });

    await newOrder.save();
    console.log("Purchase Order Created Successfully:", newOrder);

    res.status(201).json({ message: "Purchase order created successfully", order: newOrder });
  } catch (error) {
    console.error("Error creating purchase order:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


// Get All Purchase Orders (Admin Only)
export const getAllPurchaseOrders = async (req, res) => {
  try {
    const orders = await PurchaseOrder.find();

    // Fetch user details manually
    const ordersWithUserDetails = await Promise.all(
      orders.map(async (order) => {
        const user = await User.findOne({ _id: order.createdBy }).select("name email");
        return {
          ...order._doc, // Spread the order object
          createdBy: user ? { name: user.name, email: user.email } : "Unknown User",
        };
      })
    );

    res.status(200).json(ordersWithUserDetails);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Approve or Reject Purchase Order (Admin Only)
export const updatePurchaseOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const updatedOrder = await PurchaseOrder.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json({ message: "Order status updated", order: updatedOrder });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

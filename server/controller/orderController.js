import Order from "../models/Order.js";
import Product from "../models/Product.js";
import PurchaseOrder from "../models/PurchaseOrder.js";
import User from "../models/User.js";

// ✅ Create a New Order
export const createOrder = async (req, res) => {
  try {
    const { productId, quantity, discount, paymentMethod, customerName, phone, address } = req.body;
    const userId = req.user._id; // Logged-in user ID

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    if (product.quantity < quantity) {
      return res.status(400).json({ message: "Insufficientstock" });
    }

    // Calculate total price after discount
    const discountAmount = (product.price * quantity * discount) / 100;
    const finalPrice = product.price * quantity - discountAmount;

    // Generate unique invoice number
    const invoiceNo = `INV-${Date.now()}`;

    // Create new order
    const order = new Order({
      productId,
      productName: product.name,
      quantity,
      discount,
      totalPrice: finalPrice,
      paymentMethod,
      invoiceNo,
      customerName,
      phone,
      address,
      status: "Pending", // Default status
      createdBy: userId, // User who placed the order
    });

    await order.save();

    // Reduce product quantity in inventory
    product.quantity -= quantity;
    await product.save();

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: "Error creating order", error: error.message });
  }
};

// ✅ Get All Orders
export const getOrders = async (req, res) => {
  try {
    const orders = await PurchaseOrder.find().populate("createdBy", "name email").sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Error fetching orders", error: error.message });
  }
};

// ✅ Get Single Order by ID
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate("createdBy", "name email");
    if (!order) return res.status(404).json({ message: "Order not found" });

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: "Error fetching order", error: error.message });
  }
};

// ✅ Update Order Status
export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) return res.status(404).json({ message: "Order not found" });

    order.status = status;
    await order.save();

    res.json({ message: "Order status updated", order });
  } catch (error) {
    res.status(500).json({ message: "Error updating order status", error: error.message });
  }
};

// ✅ Delete Order
export const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    // Restore stock when deleting order
    const product = await Product.findById(order.productId);
    if (product) {
      product.quantity += order.quantity;
      await product.save();
    }

    await order.deleteOne();
    res.json({ message: "Order deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting order", error: error.message });
  }
};


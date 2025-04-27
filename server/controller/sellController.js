import Product from '../models/Product.js';
import Bill from '../models/Bill.js';
import { v4 as uuidv4 } from 'uuid';

export const sellProducts = async (req, res) => {
  try {
    const { customerName, customerPhone, items } = req.body;
    const userId = req.user?._id;
    const generatedBy = req.user?.email;

    if (!userId || !generatedBy) {
      return res.status(401).json({ error: 'Unauthorized: User not authenticated' });
    }

    let totalAmount = 0;
    const billItems = [];
    const LOW_STOCK_THRESHOLD = 5;

    for (let item of items) {
      const product = await Product.findById(item.productId);

      if (!product) {
        return res.status(404).json({ error: `Product not found` });
      }

      if (product.quantity < item.quantity) {
        return res.status(400).json({
          error: `${product.name} has only ${product.quantity} item(s) in stock.`,
        });
      }

      const itemTotal = product.price * item.quantity;
      totalAmount += itemTotal;

      // Deduct quantity from stock
      product.quantity -= item.quantity;
      await product.save();

      billItems.push({
        productId: product._id,
        name: product.name,
        quantity: item.quantity,
        price: product.price,
        costPrice:product.costprice,
      });

      // Optionally: handle low stock alert
      if (product.quantity <= LOW_STOCK_THRESHOLD) {
        // You can trigger an email/notification here or mark in DB
        console.log(`Low stock alert for ${product.name}: ${product.quantity} left`);
      }
    }

    // Create invoice number
    const invoiceNumber = `INV-${uuidv4().slice(0, 8).toUpperCase()}`;

    // Create and save bill
    const newBill = new Bill({
      customerName,
      customerPhone,
      products: billItems,
      totalAmount,
      generatedBy,
      invoiceNumber,
      userId,
    });

    await newBill.save();

    res.status(201).json({ message: 'Sale successful', bill: newBill });
  } catch (error) {
    console.error("Error while selling:", error);
    res.status(500).json({ error: 'Server error while processing sale' });
  }
};

// Required imports
import express from 'express';
import mongoose from 'mongoose';
import Bill from '../models/Bill.js';
import Product from '../models/Product.js';
import {authMiddleware,adminMiddleware} from '../middleware/authMiddleware.js';

const router = express.Router();

// 🧃 Top Selling Products
router.get('/top-products', authMiddleware, async (req, res) => {
  try {
    const pipeline = [
      { $unwind: '$products' }, // Unwind the products array
      {
        $group: {
          _id: '$products.productId', // Group by productId for better detail
          name: { $first: '$products.name' }, // Include product name for clarity
          totalSold: { $sum: '$products.quantity' }, // Sum the quantities sold
        }
      },
      { $sort: { totalSold: -1 } }, // Sort by totalSold in descending order
      { $limit: 4 } // Limit to top 4 products
    ];

    // Run the aggregation
    const result = await Bill.aggregate(pipeline);

    // Populate the product details from the Product model, including the image
    const populatedResult = await Product.populate(result, {
      path: '_id', // Populate the product data using the productId
      select: 'name price image', // Select the fields you need (name, price, image)
    });

    res.json(populatedResult); // Return the result with populated data
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch top products', error: err });
  }
});



// 📆 Daily Sales Count
router.get('/daily-sales-count', authMiddleware, async (req, res) => {
  try {
    const result = await Bill.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id': 1 } }
    ]);
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch daily sales count', error: err });
  }
});

// 💸 Profit vs Expense Comparison Chart (assumes expense model exists)
;
// Route to get profit vs expense data
router.get('/profit-vs-expense', authMiddleware, async (req, res) => {
  try {
    // Aggregating sales data by date
    const sales = await Bill.aggregate([
      {
        $unwind: "$products" // Unwind the array of products in each bill
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } }, // Group by date
          totalSales: { $sum: { $multiply: ["$products.price", "$products.quantity"] } }, // Total sales = price * quantity
          totalCost: { $sum: { $multiply: ["$products.costPrice", "$products.quantity"] } } // Total cost = costPrice * quantity
        }
      }
    ]);

    // Format the data by merging sales and expenses (costs)
    const data = sales.map(item => ({
      date: item._id,
      sales: item.totalSales,
      expense: item.totalCost,
      profit: item.totalSales - item.totalCost // Profit = sales - expenses
    }));

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch profit vs expense data', error: err });
  }
});

// 🧍 Sales by User
router.get('/sales-by-user', authMiddleware, async (req, res) => {
  try {
    const result = await Bill.aggregate([
      {
        $group: {
          _id: '$generatedBy',
          totalSales: { $sum: '$totalAmount' },
          orders: { $sum: 1 }
        }
      },
      { $sort: { totalSales: -1 } }
    ]);
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch sales by user', error: err });
  }
});


// GET /api/bills/profit-summary
router.get("/profit-summary", authMiddleware,  async (req, res) => {
  try {
    const bills = await Bill.find();

    let totalProfit = 0;

    for (const bill of bills) {
      for (const item of bill.products) {
        if (item.price && item.costPrice && item.quantity) {
          totalProfit += (item.price - item.costPrice) * item.quantity;
        }
      }
    }

    res.json({ profit: totalProfit });
  }catch (err) {
    console.error("Profit summary error:", err);
    res.status(500).json({ message: "Server error calculating profit." });
  }
});



router.get("/inventory-value", authMiddleware, async (req, res) => {
  try {
    const products = await Product.find();

    const totalValue = products.reduce((acc, product) => {
      return acc + (product.costprice * product.quantity);
    }, 0);

    res.status(200).json({ totalValue: Math.round(totalValue) });
  } catch (error) {
    console.error("Error calculating inventory value:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;

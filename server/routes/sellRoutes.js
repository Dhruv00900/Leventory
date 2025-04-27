import express from 'express';
import { sellProducts } from '../controller/sellController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import Bill from '../models/Bill.js'; 

const router = express.Router();

router.post("/sell", authMiddleware, sellProducts);

router.get('/sells-data', authMiddleware, async (req, res) => {
    try {
      const filter = req.user.role === 'admin'
        ? {}
        : { generatedBy: req.user.name };
  
      const data = await Bill.aggregate([
        { $match: filter },
        {
          $group: {
            _id: {
              date: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
              generatedBy: "$generatedBy"
            },
            totalSales: { $sum: "$totalAmount" }
          }
        },
        { $sort: { "_id.date": 1 } }
      ]);
  
      const formattedData = data.map(item => ({
        date: item._id.date,
        generatedBy: item._id.generatedBy,
        totalSales: item.totalSales
      }));
  
      res.json(formattedData);
    } catch (err) {
      console.error("Error generating sales data:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  
  


router.get("/highest-selling", async (req, res) => {
    try {
      const topProduct = await Bill.aggregate([
        { $unwind: "$products" }, // explode products array
        {
          $group: {
            _id: "$products.name", // group by product name
            totalSold: { $sum: "$products.quantity" }, // sum the quantities sold
          },
        },
        { $sort: { totalSold: -1 } }, // sort descending
        { $limit: 1 }, // get top 1 product
      ]);
  
      res.json({ topProduct: topProduct[0] || null });
    } catch (error) {
      console.error("Error fetching highest selling product:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  

  // GET /api/profit
// GET /api/profit?range=today|week|month|yearrouter.get('/profit', authMiddleware, async (req, res) => {
    router.get('/profit', authMiddleware, async (req, res) => {
        try {
          const { range } = req.query;
          const now = new Date();
          let startDate;
      
          switch (range) {
            case 'week':
              startDate = new Date(now.setDate(now.getDate() - 7));
              break;
            case 'month':
              startDate = new Date(now.getFullYear(), now.getMonth(), 1);
              break;
            case 'year':
              startDate = new Date(now.getFullYear(), 0, 1);
              break;
            default:
              startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          }
      
          const filter = {
            date: { $gte: startDate },
          };
      
          if (req.user.role !== 'admin') {
            filter.generatedBy = req.user._id; // 🔥 Correct filter by user
          }
      
          const bills = await Bill.find(filter).populate('products.productId');
      
          let totalProfit = 0;
      
          bills.forEach(bill => {
            bill.products.forEach(item => {
              const quantity = item.quantity;
              const sellPrice = item.price;
      
              if (req.user.role === 'admin') {
                const costPrice = item.productId?.costprice || 0;
                const profit = (sellPrice - costPrice) * quantity;
                totalProfit += profit;
              } else {
                // user: show total sales amount, not profit
                totalProfit += sellPrice * quantity;
              }
            });
          });
      
          res.json({ totalProfit }); // admin: profit | user: total sales
        } catch (err) {
          console.error("Error calculating profit:", err);
          res.status(500).json({ error: "Internal server error" });
        }
      });
      

  


//order routes
router.get('/total-orders', authMiddleware, async (req, res) => {
  try {
    const filter = req.user.role === 'admin'
      ? {} // admin can see all
      : { generatedBy: req.user.name }; // non-admins see only their orders

    const totalOrders = await Bill.countDocuments(filter);

    res.json({ totalOrders });
  } catch (err) {
    console.error("Error getting total orders:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});






  




export default router;

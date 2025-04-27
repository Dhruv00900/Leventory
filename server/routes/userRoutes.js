import express from "express";

import { getAllUsers ,toggleUserAccess,getMe,updateMe,deleteUser} from "../controller/userController.js";
import { adminMiddleware, authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// Fetch all users (admin only)
router.get("/", authMiddleware, adminMiddleware, getAllUsers);
router.put("/:id/toggle-access", authMiddleware, adminMiddleware, toggleUserAccess);
router.get("/getme", authMiddleware, getMe);
router.put("/updateme" , authMiddleware, updateMe)
router.delete("/:id" , authMiddleware, adminMiddleware, deleteUser);
router.get("/me", authMiddleware, (req, res) => {
    res.json({
      message: "Authenticated user data",
      user: req.user, // should contain user object from the database
    });
  });
export default router;






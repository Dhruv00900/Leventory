import express from "express";
import {
  addProduct,
  getProducts,
  updateProduct,
  deleteProduct,
  deleteMultipleProducts
 
} from "../controller/productController.js";
import cloudinary from "../utils/cloudinaryConfig.js";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { authMiddleware, adminMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// Multer storage setup for Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "products", // Folder name in Cloudinary
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
  },
});

const upload = multer({ storage });


// Add a new product (requires authentication)
router.post("/", authMiddleware,adminMiddleware,upload.single("image"),addProduct);

// Get all products (Public)
router.get("/", getProducts);

// Update a product (requires authentication)
router.put("/:id", authMiddleware, upload.single("image"), updateProduct);

// Delete a product (requires authentication & admin role)
router.delete("/:id", authMiddleware, adminMiddleware, deleteProduct);
router.post("/delete-multiple", authMiddleware, adminMiddleware, deleteMultipleProducts);

export default router;

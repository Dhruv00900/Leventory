import Product from "../models/Product.js";
import Category from "../models/Categories.js";
import cloudinary from "cloudinary"; // If using Cloudinary

import mongoose from "mongoose";

export const addProduct = async (req, res) => {
  try {
    console.log("🚀 Received Data:", req.body);
    console.log("📸 Received File:", req.file);

    const { SKU, name, category, price, quantity, supplier, costprice} = req.body;

    if (!SKU || !name || !category || !price || !quantity || !supplier || !costprice) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // ✅ Check if SKU already exists
    const existingProduct = await Product.findOne({ SKU });
    if (existingProduct) {
      return res.status(400).json({ message: "Product with this SKU already exists" });
    }

    // ✅ Convert supplier to ObjectId
    const supplierObjectId = mongoose.Types.ObjectId.isValid(supplier)
      ? new mongoose.Types.ObjectId(supplier)
      : null;

    if (!supplierObjectId) {
      return res.status(400).json({ message: "Invalid supplier ID" });
    }

    // ✅ Handle image upload
    let imageUrl = "";
    if (req.file) {
      imageUrl = req.file.path; // Store the uploaded image URL
      console.log("Image uploaded successfully: ",imageUrl);
    }

    const newProduct = new Product({
      SKU,
      name,
      category,
      price,
      quantity,
      supplier: supplierObjectId, // Store as ObjectId
      
      image: imageUrl,
      costprice,
    });

    const savedProduct = await newProduct.save();
    return res.status(201).json({ message: "Product added successfully", product: savedProduct });

  } catch (error) {
    console.error("❌ Error adding product:", error);
    return res.status(500).json({ message: "Error adding product", error: error.message });
  }
};




//  Get all products
export const getProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // Current page (default: 1)
    const limit = parseInt(req.query.limit) || 10; // Items per page (default: 10)
    const skip = (page - 1) * limit; // Calculate the number of items to skip
    const { category } = req.query; // Get category from query params

    let filter = {};

    // ✅ Apply category filter if provided
    if (category) {
      filter.category = category;
    }

    // Fetch products with filtering & pagination
    const products = await Product.find(filter)
      .populate("category", "name")
      .populate("supplier", "name")
      .sort({ createdAt: -1 }) // Sort by latest created
      .skip(skip)
      .limit(limit);

    // Get total filtered product count for pagination
    const totalProducts = await Product.countDocuments(filter);

    res.status(200).json({
      products,
      currentPage: page,
      totalPages: Math.ceil(totalProducts / limit),
      totalProducts,
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: "Error fetching products", error: error.message });
  }
};


//  Update a product
export const updateProduct = async (req, res) => {
    try {
      const { id } = req.params;
  
      // Fetch the existing product
      const existingProduct = await Product.findById(id);
    
      if (!existingProduct) {
        return res.status(404).json({ message: "Product not found" });
      }

      // ✅ Handle image update
      let imageUrl = existingProduct.image; // Keep existing image if not updated
      if (req.file) {
        imageUrl = req.file.path;
        console.log("📸 New image uploaded to Cloudinary:", imageUrl);
      }

      // Merge the existing `img` field if it's not provided in the update request
      const updatedData = { ...req.body, image: imageUrl };
      //if (!req.body.img) {
       // updatedData.img = existingProduct.img;}  Retain the old image if not updated
      
  
      const updatedProduct = await Product.findByIdAndUpdate(id, updatedData, { new: true });
  
      res.status(200).json({ message: "Product updated successfully", product: updatedProduct });
    } catch (error) {
      res.status(500).json({ message: "Error updating product", error: error.message });
    }
  };


// Delete a product
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedProduct = await Product.findByIdAndDelete(id);

    if (!deletedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting product", error: error.message });
  }
};
//delete multiple products
export const deleteMultipleProducts = async (req, res) => {
  try {
    const { ids } = req.body; // Expecting an array of product IDs

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: "Invalid request. Provide an array of product IDs." });
    }

    const deletedProducts = await Product.deleteMany({ _id: { $in: ids } });

    if (deletedProducts.deletedCount === 0) {
      return res.status(404).json({ message: "No products found to delete" });
    }

    res.status(200).json({ 
      message: `Successfully deleted ${deletedProducts.deletedCount} product(s).`,
    });
  } catch (error) {
    res.status(500).json({ message: "Error deleting products", error: error.message });
  }
};

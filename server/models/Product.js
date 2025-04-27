import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    SKU: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true }, // Reference Category
    price: { type: Number, required: true },
    costprice: { type: Number, required: true },
    quantity: { type: Number, required: true },
    supplier: { type: mongoose.Schema.Types.ObjectId, ref: "Supplier", required: true },
    image: { type: String },
    
    lowStockThreshold: {
      type: Number,
      default: 5,
    },
    
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);
export default Product;

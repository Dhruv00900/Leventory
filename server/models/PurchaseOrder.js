import mongoose from "mongoose";

const purchaseOrderSchema = new mongoose.Schema(
  {
    productName: { type: String, required: true },
    quantity: { type: Number, required: true },
    shippingAddress: { type: String, required: true },
    sellerName: { type: String, default: "Unknown Seller" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Add createdBy field
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" }, // Add status field
    orderDate: { type: Date, default: Date.now }, // Add orderDate field
  },
  { timestamps: true } // Add timestamps for createdAt and updatedAt
);


const PurchaseOrder = mongoose.model("PurchaseOrder", purchaseOrderSchema);
export default PurchaseOrder;

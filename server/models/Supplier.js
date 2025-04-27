import mongoose from "mongoose";

const SupplierSchema = new mongoose.Schema({
  name: { type: String, required: true },
  contact: { type: String, required: false },
  email: { type: String, required: false,unique: true },
  address:{ type: String, required: false }
}, { timestamps: true });

export default mongoose.model('Supplier', SupplierSchema);

import mongoose from 'mongoose';

const InventoryLogSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  change: { type: Number, required: true }, // + for stock increase, - for stock decrease
  reason: { type: String, required: true }, // e.g., "New stock added", "Product sold"
  date: { type: Date, default: Date.now },
}, { timestamps: true });

export default mongoose.model('InventoryLog', InventoryLogSchema);

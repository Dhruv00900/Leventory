
import mongoose from 'mongoose';
const billSchema = new mongoose.Schema({
  customerName: String,
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  products: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
      },
      name: String,
      price: Number,
      quantity: Number,
      costPrice: Number,
      
    }
  ],
  totalAmount: Number,
  generatedBy: String,
  date: { type: Date, default: Date.now },
  invoiceNumber: String,
});
export default mongoose.model('Bill', billSchema);
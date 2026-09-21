// ============================================
// models/StockTransaction.js
// Records tayo ng bawat pagbabago sa dami (quantity) ng produkto:
// "stock-in" (dumating na bagong stock) o "stock-out" (nabenta/nagamit).
// Naka-link ito sa Product (anong item) at sa User (sino ang gumawa).
// ============================================

const mongoose = require('mongoose');

const stockTransactionSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'Kailangan ng product reference']
  },
  type: {
    type: String,
    enum: {
      values: ['stock-in', 'stock-out'],
      message: 'Ang type ay dapat "stock-in" o "stock-out" lang'
    },
    required: [true, 'Kailangan ng transaction type']
  },
  quantity: {
    type: Number,
    required: [true, 'Kailangan ng quantity'],
    min: [1, 'Dapat hindi bababa sa 1 ang quantity']
  },
  note: {
    type: String,
    trim: true,
    default: ''
  },
  performedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'             // sino sa mga users ang gumawa ng transaction na ito
  }
}, { timestamps: true });

module.exports = mongoose.model('StockTransaction', stockTransactionSchema);

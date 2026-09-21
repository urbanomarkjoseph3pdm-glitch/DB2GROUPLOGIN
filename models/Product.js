// ============================================
// models/Product.js
// Ang PANGUNAHING record ng system. Bawat produkto ay
// naka-link (reference) sa isang Category at isang Supplier —
// dito nangyayari ang "relationship" sa pagitan ng collections.
// ============================================

const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Kailangan ng product name'],
    trim: true
  },
  sku: {
    type: String,
    required: [true, 'Kailangan ng SKU (product code)'],
    unique: true,          // hindi dapat magkapareho ang dalawang produkto
    trim: true,
    uppercase: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',        // REFERENCE papunta sa Category collection
    required: [true, 'Kailangan ng category']
  },
  supplier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplier',        // REFERENCE papunta sa Supplier collection
    required: [true, 'Kailangan ng supplier']
  },
  quantity: {
    type: Number,
    required: true,
    min: [0, 'Hindi pwedeng negative ang quantity'],
    default: 0
  },
  unitPrice: {
    type: Number,
    required: [true, 'Kailangan ng presyo bawat piraso'],
    min: [0, 'Hindi pwedeng negative ang presyo']
  },
  reorderLevel: {
    type: Number,
    default: 10,            // kung bumaba dito ang stock, "low stock" na ito
    min: 0
  }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);

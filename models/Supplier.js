// ============================================
// models/Supplier.js
// Ang "hugis" ng isang Supplier (pinagkukunan ng produkto).
// ============================================

const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Kailangan ng supplier name'],
    trim: true
  },
  contactPerson: {
    type: String,
    trim: true,
    default: ''
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Invalid email format']
  },
  phone: {
    type: String,
    trim: true
  },
  address: {
    type: String,
    trim: true,
    default: ''
  }
}, { timestamps: true });

module.exports = mongoose.model('Supplier', supplierSchema);

// ============================================
// models/Category.js
// Ang "hugis" ng isang Category sa database.
// Ginagamit ito ng Products para malaman kung
// anong uri/klase ng produkto ito (hal. "Beverages", "Snacks").
// ============================================

const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Kailangan ng category name'],
    unique: true,        // walang dalawang category na magkaparehong pangalan
    trim: true
  },
  description: {
    type: String,
    trim: true,
    default: ''
  }
}, { timestamps: true }); // awtomatikong may createdAt / updatedAt

module.exports = mongoose.model('Category', categorySchema);

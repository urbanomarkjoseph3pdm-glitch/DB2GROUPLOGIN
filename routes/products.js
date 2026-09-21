// ============================================
// routes/products.js
// Full CRUD para sa Product collection (ang PANGUNAHING record).
// Base URL: /api/products
// ============================================

const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// CREATE — POST /api/products
router.post('/', async (req, res) => {
  try {
    const { name, sku, category, supplier, quantity, unitPrice, reorderLevel } = req.body;
    const product = await Product.create({
      name, sku, category, supplier, quantity, unitPrice, reorderLevel
    });
    // i-populate para makita agad ang pangalan ng category/supplier, hindi lang ObjectId
    const populated = await product.populate(['category', 'supplier']);
    res.status(201).json(populated);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'May produkto na gamit na ang SKU na iyan.' });
    }
    res.status(400).json({ message: err.message });
  }
});

// READ (all) — GET /api/products
// Kasama na agad ang related category & supplier info (JOIN-like behavior)
router.get('/', async (req, res) => {
  try {
    const products = await Product.find()
      .populate('category', 'name')
      .populate('supplier', 'name')
      .sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: 'Hindi makuha ang mga produkto.' });
  }
});

// READ — GET /api/products/low-stock
// Halimbawa ng "useful query": ipakita lang ang mga produktong kailangan nang i-restock.
// NOTE: nauuna ito sa /:id route para hindi ito ma-interpret bilang isang product id.
router.get('/low-stock', async (req, res) => {
  try {
    const lowStock = await Product.find({
      $expr: { $lte: ['$quantity', '$reorderLevel'] }
    }).populate('category', 'name').populate('supplier', 'name');
    res.json(lowStock);
  } catch (err) {
    res.status(500).json({ message: 'Hindi makuha ang low-stock report.' });
  }
});

// READ (one) — GET /api/products/:id
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('category', 'name')
      .populate('supplier', 'name');
    if (!product) return res.status(404).json({ message: 'Walang nahanap na produkto.' });
    res.json(product);
  } catch (err) {
    res.status(400).json({ message: 'Invalid product id.' });
  }
});

// UPDATE — PUT /api/products/:id
router.put('/:id', async (req, res) => {
  try {
    const { name, sku, category, supplier, quantity, unitPrice, reorderLevel } = req.body;
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { name, sku, category, supplier, quantity, unitPrice, reorderLevel },
      { new: true, runValidators: true }
    ).populate('category', 'name').populate('supplier', 'name');
    if (!product) return res.status(404).json({ message: 'Walang nahanap na produkto.' });
    res.json(product);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'May produkto na gamit na ang SKU na iyan.' });
    }
    res.status(400).json({ message: err.message });
  }
});

// DELETE — DELETE /api/products/:id
router.delete('/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: 'Walang nahanap na produkto.' });
    res.json({ message: 'Na-delete na ang produkto.' });
  } catch (err) {
    res.status(400).json({ message: 'Invalid product id.' });
  }
});

module.exports = router;

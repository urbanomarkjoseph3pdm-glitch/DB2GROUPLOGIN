// ============================================
// routes/suppliers.js
// Full CRUD para sa Supplier collection.
// Base URL: /api/suppliers
// ============================================

const express = require('express');
const router = express.Router();
const Supplier = require('../models/Supplier');

// CREATE — POST /api/suppliers
router.post('/', async (req, res) => {
  try {
    const { name, contactPerson, email, phone, address } = req.body;
    const supplier = await Supplier.create({ name, contactPerson, email, phone, address });
    res.status(201).json(supplier);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// READ (all) — GET /api/suppliers
router.get('/', async (req, res) => {
  try {
    const suppliers = await Supplier.find().sort({ name: 1 });
    res.json(suppliers);
  } catch (err) {
    res.status(500).json({ message: 'Hindi makuha ang mga suppliers.' });
  }
});

// READ (one) — GET /api/suppliers/:id
router.get('/:id', async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) return res.status(404).json({ message: 'Walang nahanap na supplier.' });
    res.json(supplier);
  } catch (err) {
    res.status(400).json({ message: 'Invalid supplier id.' });
  }
});

// UPDATE — PUT /api/suppliers/:id
router.put('/:id', async (req, res) => {
  try {
    const { name, contactPerson, email, phone, address } = req.body;
    const supplier = await Supplier.findByIdAndUpdate(
      req.params.id,
      { name, contactPerson, email, phone, address },
      { new: true, runValidators: true }
    );
    if (!supplier) return res.status(404).json({ message: 'Walang nahanap na supplier.' });
    res.json(supplier);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE — DELETE /api/suppliers/:id
router.delete('/:id', async (req, res) => {
  try {
    const supplier = await Supplier.findByIdAndDelete(req.params.id);
    if (!supplier) return res.status(404).json({ message: 'Walang nahanap na supplier.' });
    res.json({ message: 'Na-delete na ang supplier.' });
  } catch (err) {
    res.status(400).json({ message: 'Invalid supplier id.' });
  }
});

module.exports = router;

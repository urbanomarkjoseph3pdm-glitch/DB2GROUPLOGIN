// ============================================
// routes/categories.js
// Full CRUD para sa Category collection.
// Base URL: /api/categories
// ============================================

const express = require('express');
const router = express.Router();
const Category = require('../models/Category');

// CREATE — POST /api/categories
router.post('/', async (req, res) => {
  try {
    const { name, description } = req.body;
    const category = await Category.create({ name, description });
    res.status(201).json(category);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'May category na gamit na ang pangalang iyan.' });
    }
    res.status(400).json({ message: err.message });
  }
});

// READ (all) — GET /api/categories
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: 'Hindi makuha ang mga categories.' });
  }
});

// READ (one) — GET /api/categories/:id
router.get('/:id', async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ message: 'Walang nahanap na category.' });
    res.json(category);
  } catch (err) {
    res.status(400).json({ message: 'Invalid category id.' });
  }
});

// UPDATE — PUT /api/categories/:id
router.put('/:id', async (req, res) => {
  try {
    const { name, description } = req.body;
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { name, description },
      { new: true, runValidators: true } // ibalik ang updated doc, at i-check ulit ang validation
    );
    if (!category) return res.status(404).json({ message: 'Walang nahanap na category.' });
    res.json(category);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'May category na gamit na ang pangalang iyan.' });
    }
    res.status(400).json({ message: err.message });
  }
});

// DELETE — DELETE /api/categories/:id
router.delete('/:id', async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) return res.status(404).json({ message: 'Walang nahanap na category.' });
    res.json({ message: 'Na-delete na ang category.' });
  } catch (err) {
    res.status(400).json({ message: 'Invalid category id.' });
  }
});

module.exports = router;

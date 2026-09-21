// ============================================
// routes/transactions.js
// CRUD para sa StockTransaction collection.
// Bukod sa normal na CRUD, ang CREATE dito ay nag-a-update din
// ng quantity ng kaugnay na Product — ito ang nagpapakita ng
// "related records" at totoong business logic (hindi lang plain CRUD).
// Base URL: /api/transactions
// (Protektado na ito ng "requireLogin" mula server.js, kaya sigurado
//  na tayong naka-login ang gumagamit bago pa man umabot dito.)
// ============================================

const express = require('express');
const router = express.Router();
const StockTransaction = require('../models/StockTransaction');
const Product = require('../models/Product');

// CREATE — POST /api/transactions
// body: { product, type ("stock-in" | "stock-out"), quantity, note }
router.post('/', async (req, res) => {
  try {
    const { product, type, quantity, note } = req.body;

    const productDoc = await Product.findById(product);
    if (!productDoc) {
      return res.status(404).json({ message: 'Walang nahanap na produkto para sa transaction na ito.' });
    }

    // VALIDATION: huwag payagang mag-stock-out ng mas malaki sa kasalukuyang stock
    if (type === 'stock-out' && quantity > productDoc.quantity) {
      return res.status(400).json({
        message: `Hindi pwede — ${productDoc.quantity} na lang ang stock ng ${productDoc.name}.`
      });
    }

    // i-adjust ang quantity ng produkto base sa transaction type
    productDoc.quantity += (type === 'stock-in') ? quantity : -quantity;
    await productDoc.save();

    // FIX #2: dati "req.userId" ang ginagamit dito, pero:
    //   (a) walang login-check na route dati kaya hindi ito nase-set, at
    //   (b) "req.user.id" ang tamang property na ibinibigay ng requireLogin
    //       middleware (tingnan ang middleware/auth.js), hindi "req.userId".
    // Ngayon, dahil naka-login na (protektado na ng requireLogin sa server.js),
    // sigurado tayong may laman ang req.user, kaya gagana na ang pag-link
    // ng transaction papunta sa taong gumawa nito.
    const transaction = await StockTransaction.create({
      product,
      type,
      quantity,
      note,
      performedBy: req.user.id
    });

    const populated = await transaction.populate('product', 'name sku');
    res.status(201).json(populated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// READ (all) — GET /api/transactions
// Ipinapakita rin ang pangalan ng produkto sa bawat log (relationship in action)
router.get('/', async (req, res) => {
  try {
    const transactions = await StockTransaction.find()
      .populate('product', 'name sku')
      .populate('performedBy', 'username')
      .sort({ createdAt: -1 });
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ message: 'Hindi makuha ang mga transaction.' });
  }
});

// READ (one) — GET /api/transactions/:id
router.get('/:id', async (req, res) => {
  try {
    const transaction = await StockTransaction.findById(req.params.id)
      .populate('product', 'name sku')
      .populate('performedBy', 'username');
    if (!transaction) return res.status(404).json({ message: 'Walang nahanap na transaction.' });
    res.json(transaction);
  } catch (err) {
    res.status(400).json({ message: 'Invalid transaction id.' });
  }
});

// DELETE — DELETE /api/transactions/:id
// NOTE: hindi na dapat "i-update" ang isang transaction (dapat permanente ang log ng history),
// kaya UPDATE ay sinadyang tinanggal dito — DELETE lang ang available bilang correction.
router.delete('/:id', async (req, res) => {
  try {
    const transaction = await StockTransaction.findByIdAndDelete(req.params.id);
    if (!transaction) return res.status(404).json({ message: 'Walang nahanap na transaction.' });
    res.json({ message: 'Na-delete na ang transaction record.' });
  } catch (err) {
    res.status(400).json({ message: 'Invalid transaction id.' });
  }
});

module.exports = router;

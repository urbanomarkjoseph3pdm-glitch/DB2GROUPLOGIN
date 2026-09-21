// ============================================
// server.js
// This is the MAIN file. It builds our website's app.
// Para sa LOCAL testing lang: node server.js
// (Sa Vercel, ang api/index.js na ang gagamitin, hindi itong file na ito —
//  pero ginagamit pa rin ni api/index.js ang code dito, kaya wag burahin.)
// ============================================

// 1) Bring in the tools (packages) we installed with npm
const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const path = require('path');
require('dotenv').config();

// 2) Bring in our own route files
const authRoutes = require('./routes/auth');
const categoryRoutes = require('./routes/categories');
const supplierRoutes = require('./routes/suppliers');
const productRoutes = require('./routes/products');
const transactionRoutes = require('./routes/transactions');

// 3) Create the express app
const app = express();

// 4) MIDDLEWARE
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'views')));

// 5) Connect to MongoDB Atlas — LOCAL testing lang, si api/index.js ang bahala sa Vercel
if (require.main === module) {
  mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ Connected to MongoDB Atlas'))
    .catch((err) => console.error('❌ MongoDB connection error:', err));
}

// 6) I-mount ang bawat set ng routes sa sarili nilang "prefix"
app.use('/api', authRoutes);                    // /api/register, /api/login, /api/me, /api/logout
app.use('/api/categories', categoryRoutes);      // CRUD ng Categories
app.use('/api/suppliers', supplierRoutes);       // CRUD ng Suppliers
app.use('/api/products', productRoutes);         // CRUD ng Products (main record)
app.use('/api/transactions', transactionRoutes); // Stock in/out log

// 7) Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running!' });
});

// 8) I-export ang app
module.exports = app;

// 9) Start the server — LOCAL TESTING LANG ITO
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}

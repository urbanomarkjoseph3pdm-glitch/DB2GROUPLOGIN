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

// FIX #1: i-import ang "requireLogin" checkpoint para gamitin sa CRUD routes.
// Dati, wala nito, kaya kahit sino (kahit hindi naka-login) ay pwedeng
// gumawa/mag-edit/mag-delete ng data sa Category/Supplier/Product/Transaction.
const requireLogin = require('./middleware/auth');

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
// auth routes (register/login) ay DAPAT PUBLIC — kailangan silang ma-access
// kahit hindi pa naka-login (paano ka mag-lo-login kung naka-lock na agad?)
app.use('/api', authRoutes); // /api/register, /api/login, /api/me, /api/logout

// FIX #1 (continued): idinagdag ang "requireLogin" BAGO ang bawat CRUD router.
// Ngayon, kailangan munang naka-login (may valid na cookie/token) bago
// makagalaw sa Categories, Suppliers, Products, o Transactions —
// kahit GET (view) man lang, hindi na pwede nang walang login.
app.use('/api/categories', requireLogin, categoryRoutes);
app.use('/api/suppliers', requireLogin, supplierRoutes);
app.use('/api/products', requireLogin, productRoutes);
app.use('/api/transactions', requireLogin, transactionRoutes);

// 7) Health check (walang pangangailangang mag-login, para sa monitoring lang)
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

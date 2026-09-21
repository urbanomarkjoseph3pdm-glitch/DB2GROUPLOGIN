// ============================================
// api/index.js
// ITO ANG PINAKA-PASUKAN (entry point) NG APP MO SA VERCEL.
// Hindi ito tulad ng normal na server na laging bukas —
// ginigising lang ito ni Vercel kada may bumisita sa site.
//
// Dahil doon, importante na hindi tayo gumagawa ng BAGONG
// koneksyon sa MongoDB kada request — kaya may "caching" dito sa baba.
// ============================================

const mongoose = require('mongoose');
require('dotenv').config();

const app = require('../server'); // kinukuha yung express app na ginawa/na-export sa server.js

// -------------------------------------------
// CACHED MONGODB CONNECTION
// -------------------------------------------
// `global` = isang lugar na "natatandaan" ni Vercel sa pagitan ng mga request
// (kapag hindi pa "natutulog" yung function). Kaya kung may existing connection na,
// gagamitin na lang natin yun sa halip na kumonekta ulit.
let cached = global._mongoose;

if (!cached) {
  cached = global._mongoose = { conn: null, promise: null };
}

async function connectToDatabase() {
  if (cached.conn) {
    // May existing connection na — gamitin na lang, wag nang bumuo ng bago
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(process.env.MONGO_URI).then((mongooseInstance) => {
      console.log('✅ Connected to MongoDB Atlas (Vercel)');
      return mongooseInstance;
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

// -------------------------------------------
// Bago sumagot sa kahit anong request, siguraduhin munang
// naka-connect tayo sa database.
// -------------------------------------------
app.use(async (req, res, next) => {
  try {
    await connectToDatabase();
    next();
  } catch (err) {
    console.error('❌ MongoDB connection error:', err);
    res.status(500).json({ error: 'Database connection failed' });
  }
});

// I-export ang app — si Vercel mismo ang bahala tumawag dito kada request
module.exports = app;

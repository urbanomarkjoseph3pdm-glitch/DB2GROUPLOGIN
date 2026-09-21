// ============================================
// api/index.js  (FIXED VERSION)
// ITO ANG PINAKA-PASUKAN (entry point) NG APP MO SA VERCEL.
//
// FIX: Dati, yung "connect to MongoDB" na middleware ay idinagdag
// PAGKATAPOS ma-mount ang mga routes (galing sa server.js) — kaya
// hindi na ito naaabot ng request bago pumasok sa route handlers,
// kaya laging "buffering timed out" ang error.
//
// Solusyon: gumawa tayo ng BAGONG wrapper app na sa LABAS pa lang,
// kokonekta muna sa database BAGO ipasa ang request papunta sa
// loob na app (na siyang may mga routes).
// ============================================

const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

const innerApp = require('../server'); // ang app na may mga routes (mula sa server.js)

// -------------------------------------------
// CACHED MONGODB CONNECTION
// -------------------------------------------
let cached = global._mongoose;
if (!cached) {
  cached = global._mongoose = { conn: null, promise: null };
}

async function connectToDatabase() {
  if (cached.conn) {
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
// BAGONG "OUTER" APP — ito na ang tunay na entry point.
// Ang middleware dito ay TIYAK na tatakbo BAGO pa man maabot
// ang kahit anong route sa loob ng innerApp.
// -------------------------------------------
const wrapperApp = express();

wrapperApp.use(async (req, res, next) => {
  try {
    await connectToDatabase();
    next();
  } catch (err) {
    console.error('❌ MongoDB connection error:', err);
    res.status(500).json({ error: 'Database connection failed' });
  }
});

// Ngayon, ipasa ang request papunta sa innerApp (na may lahat ng routes)
// — pero ito ay pangalawa na sa pagkakasunod-sunod, kaya guaranteed
// na naka-connect na tayo sa DB bago pa man umabot dito.
wrapperApp.use(innerApp);

module.exports = wrapperApp;

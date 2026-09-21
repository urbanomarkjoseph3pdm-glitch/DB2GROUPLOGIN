// ============================================
// server.js
// This is the MAIN file. It starts our website.
// Run it with: node server.js
// ============================================

// 1) Bring in the tools (packages) we installed with npm
const express = require('express');       // express = makes building a web server easy
const mongoose = require('mongoose');     // mongoose = talks to our MongoDB database
const cookieParser = require('cookie-parser'); // lets us read cookies sent by the browser
const path = require('path');             // built into Node, helps build file paths
require('dotenv').config();               // loads secret values from the .env file

// 2) Bring in our own route files (we made these ourselves, see routes/ folder)
const authRoutes = require('./routes/auth');

// 3) Create the express app (this represents our whole website/server)
const app = express();

// 4) MIDDLEWARE = functions that run on every request before it reaches our routes
app.use(express.json());          // lets our server understand JSON sent from the browser
app.use(cookieParser());          // lets our server read cookies (used for login sessions)
app.use(express.static(path.join(__dirname, 'public'))); // serves CSS/JS files publicly
app.use(express.static(path.join(__dirname, 'views')));  // serves our HTML pages publicly

// 5) Connect to MongoDB Atlas (the cloud database)
// MONGO_URI comes from the .env file (kept secret, never uploaded to GitHub)
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB Atlas'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// 6) Tell express: any request starting with /api/... goes to our auth.js file
app.use('/api', authRoutes);

// 7) A simple "health check" route, useful to confirm Render deployed correctly
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running!' });
});

// 8) Start the server and listen for visitors
// process.env.PORT is given to us automatically by Render when deployed live
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

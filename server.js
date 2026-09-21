// ============================================
// server.js
// This is the MAIN file. It builds our website's app.
// Para sa LOCAL testing lang: node server.js
// (Sa Vercel, ang api/index.js na ang gagamitin, hindi itong file na ito —
//  pero ginagamit pa rin ni api/index.js ang code dito, kaya wag burahin.)
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
// NOTE: Dito lang tayo direktang kumokonekta kapag TUMATAKBO LOCALLY (node server.js).
// Kapag naka-deploy sa Vercel, si api/index.js na ang bahala mag-connect
// (may sarili itong "cached connection" logic — importante yun sa serverless).
if (require.main === module) {
  mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ Connected to MongoDB Atlas'))
    .catch((err) => console.error('❌ MongoDB connection error:', err));
}

// 6) Tell express: any request starting with /api/... goes to our auth.js file
app.use('/api', authRoutes);

// 7) A simple "health check" route, useful to confirm deployment worked
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running!' });
});

// 8) I-export ang app para magamit ito ng ibang files
//    (ginagamit ito ni api/index.js kapag naka-deploy sa Vercel)
module.exports = app;

// 9) Start the server and listen for visitors — LOCAL TESTING LANG ITO.
// `require.main === module` = "tumakbo ba ito gamit ang `node server.js` mismo?"
// Kung oo, mag-listen. Kung ginamit lang siya bilang import (gaya sa Vercel), hindi na.
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}

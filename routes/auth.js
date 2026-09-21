// ============================================
// routes/auth.js
// This file handles everything about accounts:
// registering, logging in, logging out, and
// checking "who am I currently logged in as?".
//
// All these routes start with /api/ because of
// how we mounted them in server.js
// ============================================

const express = require('express');
const bcrypt = require('bcryptjs');       // used to safely hash (scramble) passwords
const jwt = require('jsonwebtoken');       // used to create a secure "login ticket" (token)
const User = require('../models/User');   // our database model from models/User.js
const requireLogin = require('../middleware/auth'); // our "must be logged in" checkpoint

const router = express.Router();

// --------------------------------------------
// POST /api/register
// Creates a brand new user account
// --------------------------------------------
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // 1) Basic validation - make sure nothing is missing
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Please fill in all fields.' });
    }

    // 2) Check if a user with this email or username already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: 'Username or email already in use.' });
    }

    // 3) Hash the password - NEVER store plain text passwords!
    // "10" is the salt rounds - a good default balance of speed vs security
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4) Create and save the new user in MongoDB
    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();

    // 5) Send a success response back to the browser
    res.status(201).json({ message: 'Account created! You can now log in.' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error while registering.' });
  }
});

// --------------------------------------------
// POST /api/login
// Checks credentials and logs the user in
// --------------------------------------------
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please enter email and password.' });
    }

    // 1) Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password.' });
    }

    // 2) Compare the typed password against the hashed one saved in the database
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password.' });
    }

    // 3) Credentials are correct! Create a JWT "login ticket".
    // It contains the user's id/username and is signed with our secret key,
    // so it can't be faked. It expires after 1 day.
    const token = jwt.sign(
      { id: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    // 4) Save that ticket in an httpOnly cookie.
    // "httpOnly" means client-side JavaScript can't read/steal it - safer.
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // only send over HTTPS in production
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000 // 1 day, in milliseconds
    });

    res.json({ message: 'Logged in successfully!', username: user.username });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error while logging in.' });
  }
});

// --------------------------------------------
// POST /api/logout
// Clears the login cookie
// --------------------------------------------
router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out.' });
});

// --------------------------------------------
// GET /api/me
// Protected route - only works if logged in.
// The dashboard page calls this to check
// "is this visitor actually allowed to be here?"
// --------------------------------------------
router.get('/me', requireLogin, (req, res) => {
  // requireLogin already verified the token and attached req.user
  res.json({ username: req.user.username });
});

module.exports = router;

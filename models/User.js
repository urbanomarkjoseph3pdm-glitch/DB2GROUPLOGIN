// ============================================
// models/User.js
// A "model" describes the SHAPE of the data we save
// in MongoDB. Think of it like a form template:
// every user document in the database must have
// these fields.
// ============================================

const mongoose = require('mongoose');

// The "Schema" is the blueprint for a User
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,   // this field MUST be filled in
    unique: true,      // no two users can have the same username
    trim: true         // removes extra spaces at start/end
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true    // always saves email in lowercase (avoids duplicates like A@b.com vs a@b.com)
  },
  password: {
    type: String,
    required: true      // this will store the HASHED password, never the plain text one
  },
  createdAt: {
    type: Date,
    default: Date.now   // automatically records when the account was created
  }
});

// Turn the schema into a real Model we can use to create/find/update users.
// mongoose will automatically create a MongoDB collection called "users".
module.exports = mongoose.model('User', userSchema);

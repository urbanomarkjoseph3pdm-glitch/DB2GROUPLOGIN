// ============================================
// middleware/auth.js
// "Middleware" is a function that runs BEFORE a route.
// This one checks: "Is this visitor actually logged in?"
// We use it to protect pages/data that only logged-in
// users should see (like a dashboard).
// ============================================

const jwt = require('jsonwebtoken');

function requireLogin(req, res, next) {
  // 1) Look for the login token inside the cookies sent by the browser
  const token = req.cookies.token;

  // 2) If there's no token at all, the person is not logged in
  if (!token) {
    return res.status(401).json({ message: 'Not logged in.' });
  }

  try {
    // 3) Verify the token is real and wasn't tampered with, using our secret key
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 4) Attach the user's info to the request so later code can use it
    req.user = decoded; // e.g. req.user.id, req.user.username

    // 5) Everything checks out -> let the request continue to the actual route
    next();
  } catch (err) {
    // Token was invalid or expired
    return res.status(401).json({ message: 'Session expired, please log in again.' });
  }
}

module.exports = requireLogin;

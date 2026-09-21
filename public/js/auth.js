// ============================================
// public/js/auth.js
// Runs in the BROWSER. Handles form submissions
// and talks to our server's /api/... routes
// using fetch() instead of normal page reloads.
// ============================================

// Grab the elements we might need (some pages won't have all of these,
// that's fine - we just check "if it exists" before using it)
const registerForm = document.getElementById('registerForm');
const loginForm = document.getElementById('loginForm');
const messageEl = document.getElementById('message');
const logoutBtn = document.getElementById('logoutBtn');
const welcomeMsg = document.getElementById('welcomeMsg');

// Small helper to show a message on the login/register pages
function showMessage(text, type) {
  if (!messageEl) return;
  messageEl.textContent = text;
  messageEl.className = 'message ' + type; // "error" or "success"
}

// --------------------------------------------
// REGISTER form logic
// --------------------------------------------
if (registerForm) {
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault(); // stop the browser from doing a normal page reload

    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password })
      });
      const data = await res.json();

      if (res.ok) {
        showMessage(data.message + ' Redirecting to login...', 'success');
        // Wait 1.5 seconds so the user can read the message, then redirect
        setTimeout(() => (window.location.href = '/login.html'), 1500);
      } else {
        showMessage(data.message, 'error');
      }
    } catch (err) {
      showMessage('Something went wrong. Try again.', 'error');
    }
  });
}

// --------------------------------------------
// LOGIN form logic
// --------------------------------------------
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();

      if (res.ok) {
        showMessage('Logged in! Redirecting...', 'success');
        setTimeout(() => (window.location.href = '/dashboard.html'), 800);
      } else {
        showMessage(data.message, 'error');
      }
    } catch (err) {
      showMessage('Something went wrong. Try again.', 'error');
    }
  });
}

// --------------------------------------------
// DASHBOARD page logic
// Runs automatically when dashboard.html loads.
// It asks the server "am I actually logged in?"
// --------------------------------------------
if (welcomeMsg) {
  fetch('/api/me')
    .then((res) => {
      if (!res.ok) throw new Error('Not logged in');
      return res.json();
    })
    .then((data) => {
      welcomeMsg.textContent = `Welcome, ${data.username}! 🎉`;
    })
    .catch(() => {
      // Not logged in (or session expired) -> send them back to login
      window.location.href = '/login.html';
    });
}

// --------------------------------------------
// LOGOUT button logic
// --------------------------------------------
if (logoutBtn) {
  logoutBtn.addEventListener('click', async () => {
    await fetch('/api/logout', { method: 'POST' });
    window.location.href = '/login.html';
  });
}

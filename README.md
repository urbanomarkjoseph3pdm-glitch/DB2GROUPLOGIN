# MyApp — Login / Register / Dashboard starter

A simple full-stack app: register, log in, and see a protected dashboard page.
Built with Node.js + Express + MongoDB (Mongoose). HTML and CSS are kept in
separate files. Every code file has comments explaining what it does.

## Project structure
```
webapp/
├── server.js            # starts the server, connects to MongoDB
├── models/User.js        # defines what a "user" looks like in the database
├── middleware/auth.js     # checks if a visitor is logged in
├── routes/auth.js         # register / login / logout / "who am I" logic
├── public/
│   ├── css/style.css      # shared styles
│   ├── css/auth.css       # login/register form styles
│   └── js/auth.js         # front-end JS that talks to the server
├── views/
│   ├── index.html          # landing page
│   ├── login.html
│   ├── register.html
│   └── dashboard.html      # protected page
├── package.json
├── .env.example
└── .gitignore
```

## Step 1 — Run it on your own computer first
1. Install [Node.js](https://nodejs.org) if you don't have it.
2. Open a terminal in this folder and run:
   ```
   npm install
   ```
3. Copy `.env.example` to a new file named `.env`, and fill in real values
   (you'll get `MONGO_URI` in Step 2 below).
4. Start the server:
   ```
   npm start
   ```
5. Open `http://localhost:3000` in your browser.

## Step 2 — Create your free database (MongoDB Atlas)
1. Go to https://www.mongodb.com/cloud/atlas/register and sign up (free).
2. Click **Build a Database** → choose the **free (M0)** tier.
3. Under **Security → Database Access**, create a database user with a
   username and password (save these — you'll need them).
4. Under **Security → Network Access**, click **Add IP Address** →
   **Allow Access from Anywhere** (`0.0.0.0/0`) — needed so Render can connect.
5. Click **Connect** on your cluster → **Drivers** → copy the connection
   string. It looks like:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/
   ```
6. Paste that into your `.env` file as `MONGO_URI`, replacing `<username>`
   and `<password>` with the real ones, and adding a database name, e.g.
   `.../myapp?retryWrites=true&w=majority`.

## Step 3 — Push the code to GitHub
1. Create a new repository on https://github.com/new (don't add a README —
   you already have one).
2. In this project folder, run:
   ```
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
   git push -u origin main
   ```
   (`.env` will NOT be uploaded — it's listed in `.gitignore` on purpose,
   so your secrets stay private.)

## Step 4 — Deploy on Render
1. Go to https://render.com and sign up / log in.
2. Click **New +** → **Web Service**.
3. Connect your GitHub account and pick the repository you just pushed.
4. Fill in:
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
5. Under **Environment Variables**, add the same values from your `.env`
   file:
   - `MONGO_URI` = your Atlas connection string
   - `JWT_SECRET` = your random secret string
   - `NODE_ENV` = `production`
   (Don't set `PORT` — Render provides it automatically.)
6. Click **Create Web Service**. Render will install dependencies, start
   the server, and give you a live URL like `https://myapp.onrender.com`.

## Step 5 — Test it live
Visit your Render URL, register an account, log in, and you should land on
the dashboard. Check your MongoDB Atlas **Collections** view — you'll see
your new user saved there.

## How the login system works (short version)
- Passwords are hashed with **bcrypt** before saving — the real password is
  never stored.
- On login, the server creates a **JWT** (a signed login ticket) and stores
  it in an `httpOnly` cookie, so front-end JavaScript can't read or steal it.
- Every request to a protected route (like the dashboard) passes through
  `middleware/auth.js`, which checks that cookie is valid before allowing
  access.

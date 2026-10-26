# Hosting StudentPulse on Render

This guide explains how to deploy **StudentPulse** to [Render](https://render.com/) for free.

---

## Architecture on Render

StudentPulse can be deployed on Render using two approaches:

1. **Option A (Recommended — 1-Click Blueprint):** Automatically deploys both the Node.js/React full-stack application and the Python FastAPI ML microservice using the included [`render.yaml`](../render.yaml).
2. **Option B (Single Web Service):** Deploys the Node.js/React web service alone. If the Python ML service is omitted, the built-in mathematical risk evaluation fallback seamlessly handles assessments with 100% uptime.

---

## Option A: 1-Click Blueprint Deployment (Full System)

1. **Log In to Render:**
   - Go to [dashboard.render.com](https://dashboard.render.com/) and sign in with your GitHub account.

2. **Create New Blueprint Instance:**
   - Click the **"New +"** button at the top right of the dashboard.
   - Select **"Blueprint"**.
   - Connect your GitHub repository: `https://github.com/Athul-krish/StudentPulse`.

3. **Deploy:**
   - Render will read [`render.yaml`](../render.yaml) and display the two services:
     - `studentpulse-web` (Node.js full-stack app)
     - `studentpulse-ml` (Python FastAPI service)
   - Click **"Apply"** / **"Create Blueprint"**.
   - Render will build and deploy both services automatically.

4. **Access Your Live Application:**
   - Once the build succeeds, click on `studentpulse-web`.
   - Your live public URL will be visible (e.g., `https://studentpulse-web.onrender.com`).

---

## Option B: Manual Single Web Service Deployment (Simplest)

If you only want to spin up a single free service on Render:

1. **Create Web Service:**
   - On the Render dashboard, click **"New +"** &rarr; **"Web Service"**.
   - Choose **"Build and deploy from a Git repository"** and connect `StudentPulse`.

2. **Configure Settings:**
   - **Name:** `studentpulse-web`
   - **Region:** Any (e.g., Oregon or Frankfurt)
   - **Branch:** `main`
   - **Root Directory:** *(leave blank / root)*
   - **Runtime:** `Node`
   - **Build Command:** `npm run build`
   - **Start Command:** `npm run start:prod`
   - **Plan:** `Free`

3. **Add Environment Variables:**
   Under **Environment Variables**, add:
   - `NODE_ENV` = `production`
   - `JWT_SECRET` = `studentpulse_super_secret_jwt_key_2026` *(or any random string)*
   - *(Optional)* `MONGODB_URI` = Your MongoDB Atlas free connection string. If left blank, StudentPulse uses its built-in in-memory database with pre-seeded demo records.

4. **Click "Create Web Service"**:
   - Render will build the Vite React frontend into `client/dist`, install backend dependencies, and launch Express serving both the API and UI at your public Render URL.

---

## Demo Accounts on Deployment

When the application boots for the first time, it automatically pre-seeds the database with:
- **Faculty Account:**
  - Email: `faculty@studentpulse.local`
  - Password: `faculty123`
- **Admin Account:**
  - Email: `admin@studentpulse.local`
  - Password: `admin123`
- **Faculty Self-Registration:** You can also click **"Create an account"** directly on the login screen to register your own faculty credentials.

---

## Database Note (Optional MongoDB Atlas)

By default, StudentPulse automatically starts an in-memory database if no external database is configured. For production persistence across service reboots:
1. Create a free shared cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas).
2. Whitelist `0.0.0.0/0` in Network Access.
3. Copy your connection string and add it to Render under Environment Variables as `MONGODB_URI`.

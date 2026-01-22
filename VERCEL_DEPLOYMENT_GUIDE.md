# Complete Vercel Deployment Guide

Step-by-step instructions for deploying both frontend and backend to Vercel, and connecting them.

## 🎯 Overview

You need to:
1. **Deploy Backend API** to Vercel (as serverless functions)
2. **Get the Backend URL** from Vercel
3. **Set Environment Variable** in Frontend project
4. **Deploy Frontend** to Vercel

---

## Step 1: Deploy Backend API to Vercel

### Option A: Deploy Backend as Separate Vercel Project (Recommended)

1. **Create a new Vercel project for the backend:**

   ```bash
   # In your project root
   cd backend
   vercel
   ```

   - Follow the prompts
   - Select "Create a new project"
   - Project name: `monad-pulse-api` (or your choice)

2. **Create `api/index.js` in the backend directory** (Vercel serverless function entry point):

   ```bash
   # This will be the entry point for Vercel
   ```

   Actually, let's create a proper Vercel configuration for the backend.

### Option B: Deploy Backend as Serverless Functions (Better)

Create these files in your project root:

**`api/index.js`** (Vercel serverless function):

```javascript
const { app } = require('../backend/api/server.cjs');

// Export the Express app as a serverless function
module.exports = app;
```

**`vercel-api.json`** (Backend Vercel config):

```json
{
  "version": 2,
  "builds": [
    {
      "src": "api/index.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "api/index.js"
    }
  ]
}
```

3. **Deploy the backend:**

   ```bash
   # From project root
   vercel --prod --name monad-pulse-api
   ```

4. **Note your backend URL:**
   - After deployment, Vercel will show: `https://monad-pulse-api.vercel.app`
   - **Copy this URL** - you'll need it in Step 2!

---

## Step 2: Set Environment Variable in Frontend Project

### Method 1: Using Vercel Dashboard (Recommended)

1. **Go to Vercel Dashboard:**
   - Visit [vercel.com](https://vercel.com)
   - Log in with your account

2. **Select your Frontend Project:**
   - Click on your frontend project (the main one, not the API)
   - Or create a new project if you haven't deployed yet

3. **Navigate to Settings:**
   - Click on **"Settings"** in the top menu
   - Click on **"Environment Variables"** in the left sidebar

4. **Add Environment Variable:**
   - Click **"Add New"** button
   - **Key:** `VITE_API_URL`
   - **Value:** `https://monad-pulse-api.vercel.app` (your backend URL from Step 1)
   - **Environment:** Select all three:
     - ☑️ Production
     - ☑️ Preview
     - ☑️ Development
   - Click **"Save"**

5. **Redeploy your frontend:**
   - Go to **"Deployments"** tab
   - Click the three dots (⋮) on the latest deployment
   - Click **"Redeploy"**
   - Or push a new commit to trigger a new deployment

### Method 2: Using Vercel CLI

```bash
# Set environment variable for all environments
vercel env add VITE_API_URL production
# When prompted, enter: https://monad-pulse-api.vercel.app

vercel env add VITE_API_URL preview
# When prompted, enter: https://monad-pulse-api.vercel.app

vercel env add VITE_API_URL development
# When prompted, enter: https://monad-pulse-api.vercel.app
```

Then redeploy:
```bash
vercel --prod
```

### Method 3: Using `.env` file (for local testing only)

Create `.env.production` in your project root:

```env
VITE_API_URL=https://monad-pulse-api.vercel.app
```

⚠️ **Note:** `.env` files are for local development only. For Vercel deployments, always use the dashboard or CLI.

---

## Step 3: Verify the Connection

### Test Backend API:

```bash
# Test if backend is working
curl https://monad-pulse-api.vercel.app/api/health

# Should return:
# {"success":true,"status":"healthy","timestamp":"..."}
```

### Test Frontend Connection:

1. **Open your deployed frontend URL**
2. **Open browser DevTools** (F12)
3. **Go to Console tab**
4. **Check for errors:**
   - ✅ Should see API calls to your backend
   - ❌ If you see CORS errors or connection errors, check Step 2

### Check Environment Variable in Frontend:

Add this temporarily to your `src/App.tsx` to debug:

```javascript
console.log('API URL:', import.meta.env.VITE_API_URL);
```

---

## Step 4: Deploy Frontend

If you haven't deployed the frontend yet:

```bash
# Deploy frontend
npm run deploy
```

Or manually:

```bash
vercel --prod
```

---

## 📋 Quick Checklist

- [ ] Backend deployed to Vercel ✅
- [ ] Backend URL copied (e.g., `https://monad-pulse-api.vercel.app`)
- [ ] `VITE_API_URL` environment variable set in Vercel dashboard
- [ ] Environment variable set for Production, Preview, AND Development
- [ ] Frontend redeployed after setting environment variable
- [ ] Tested backend health endpoint
- [ ] Checked browser console for errors
- [ ] Frontend successfully loads markets from backend

---

## 🔧 Troubleshooting

### ❌ "Could not connect to backend API"

**Solution:**
1. Verify backend is deployed: `curl https://your-backend-url.vercel.app/api/health`
2. Check environment variable is set correctly in Vercel dashboard
3. Make sure you **redeployed** after setting the environment variable
4. Environment variables only apply to **new deployments**

### ❌ Environment variable not working

**Solution:**
1. Environment variables are baked into the build at build time
2. You **must redeploy** after adding/changing environment variables
3. Check you're using `VITE_` prefix (required for Vite)
4. Verify the variable is set for the correct environment (Production/Preview)

### ❌ CORS errors

**Solution:**
- Your backend already has CORS enabled (`app.use(cors())`)
- If you still see errors, the backend might not be deployed correctly
- Check backend logs in Vercel dashboard

### ❌ 404 errors for API endpoints

**Solution:**
1. Verify backend routes are correct: `/api/health`, `/api/markets`, etc.
2. Check backend deployment logs in Vercel
3. Make sure backend Express app is exported correctly

---

## 🎯 Alternative: Single Project Deployment

If you want everything in one Vercel project, you can:

1. **Create `api/index.js` in root:**

```javascript
const { app } = require('./backend/api/server.cjs');
module.exports = app;
```

2. **Update `vercel.json`:**

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/api/index.js"
    },
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

3. **Set `VITE_API_URL` to your main domain:**
   - `https://your-project.vercel.app`

This way, frontend and backend are on the same domain!

---

## 📝 Summary

1. **Deploy backend** → Get URL (e.g., `https://api.vercel.app`)
2. **Set `VITE_API_URL`** in Vercel dashboard = Backend URL
3. **Redeploy frontend** → Environment variable is now active
4. **Test** → Frontend should connect to backend successfully!

---

## 🆘 Need Help?

- Check Vercel deployment logs
- Check browser console for errors
- Verify environment variables in Vercel dashboard
- Test backend endpoints directly with curl

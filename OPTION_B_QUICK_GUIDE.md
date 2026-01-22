# Option B: Quick Deployment Guide

## Step 1: Deploy Backend API

Since Vercel auto-detects and builds everything, we'll deploy the backend manually:

```bash
# Make sure you're logged in
vercel login

# Deploy backend (will ask for project name - use: monad-pulse-api)
vercel --prod --yes --config vercel-backend.json
```

**📝 IMPORTANT:** After deployment, Vercel will show you a URL. Copy it!
Example: `https://monad-pulse-api-xxxxx.vercel.app`

---

## Step 2: Set Environment Variable

1. Go to [vercel.com](https://vercel.com) → Your **FRONTEND** project
2. Settings → Environment Variables
3. Add:
   - **Key:** `VITE_API_URL`
   - **Value:** Your backend URL from Step 1
   - **Environments:** ☑️ Production, ☑️ Preview, ☑️ Development
4. **Save**

---

## Step 3: Redeploy Frontend

```bash
npm run deploy
```

Or redeploy from Vercel dashboard.

---

## ✅ Done!

Your frontend will now connect to the backend API!

**Test it:**
- Backend: `curl https://your-backend-url.vercel.app/api/health`
- Frontend: Check browser console for API calls

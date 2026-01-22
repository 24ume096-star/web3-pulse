# Option B: Separate Backend Deployment - Step by Step

Complete guide for deploying backend and frontend separately.

---

## Step 1: Deploy Backend API ✅

### Using the deployment script (Recommended):

```bash
npm run deploy:backend
```

**What happens:**
1. Creates/verifies `api/index.js` exists
2. Deploys backend as a separate Vercel project
3. You'll be prompted for a project name (suggested: `monad-pulse-api`)
4. Vercel will show you a URL like: `https://monad-pulse-api.vercel.app`

### Or deploy manually:

```bash
vercel --prod --yes --name monad-pulse-api
```

**📝 IMPORTANT: Copy the backend URL shown after deployment!**

Example: `https://monad-pulse-api.vercel.app`

---

## Step 2: Set Environment Variable in Frontend Project 🎯

### Using Vercel Dashboard:

1. **Go to Vercel Dashboard:**
   - Visit [vercel.com](https://vercel.com)
   - Log in

2. **Select your FRONTEND project**
   - (Not the backend project you just created)

3. **Go to Settings:**
   - Click **"Settings"** tab
   - Click **"Environment Variables"** in left sidebar

4. **Add the variable:**
   - Click **"Add New"** button
   - **Key:** `VITE_API_URL`
   - **Value:** Your backend URL from Step 1
     - Example: `https://monad-pulse-api.vercel.app`
   - **Environments:** Select ALL three:
     - ☑️ Production
     - ☑️ Preview  
     - ☑️ Development
   - Click **"Save"**

5. **Verify it was added:**
   - You should see `VITE_API_URL` in the list
   - Value should be your backend URL

---

## Step 3: Redeploy Frontend 🔄

**⚠️ CRITICAL:** Environment variables only apply to NEW deployments!

### Option A: Using Dashboard
1. Go to **"Deployments"** tab
2. Find your latest deployment
3. Click the three dots (⋮)
4. Click **"Redeploy"**
5. Wait for deployment to complete

### Option B: Using CLI
```bash
npm run deploy
```

---

## Step 4: Verify Everything Works ✅

### Test Backend:
```bash
curl https://monad-pulse-api.vercel.app/api/health
```

Expected response:
```json
{"success":true,"status":"healthy","timestamp":"..."}
```

### Test Frontend:
1. Open your deployed frontend URL
2. Open browser DevTools (F12)
3. Go to Console tab
4. Check for API calls - should see requests to your backend URL
5. Markets should load from the backend

---

## 📋 Quick Checklist

- [ ] Backend deployed successfully
- [ ] Backend URL copied (e.g., `https://monad-pulse-api.vercel.app`)
- [ ] `VITE_API_URL` added in frontend project's environment variables
- [ ] Environment variable set for Production, Preview, AND Development
- [ ] Frontend redeployed after setting environment variable
- [ ] Backend health endpoint works
- [ ] Frontend successfully loads markets

---

## 🔧 Troubleshooting

### Backend deployment fails

**Error: "Not logged in"**
```bash
vercel login
```

**Error: "Project already exists"**
- The backend project name is already taken
- Use a different name: `npm run deploy:backend your-custom-name`

### Environment variable not working

**Check:**
1. ✅ Variable name is exactly `VITE_API_URL` (case-sensitive)
2. ✅ Variable has `VITE_` prefix (required for Vite)
3. ✅ You redeployed AFTER adding the variable
4. ✅ Variable is set for the correct environment (Production/Preview)

**Solution:**
- Environment variables are baked in at build time
- You MUST redeploy after adding/changing variables

### Frontend can't connect to backend

**Check:**
1. ✅ Backend URL is correct (test with curl)
2. ✅ Backend health endpoint works
3. ✅ CORS is enabled (already configured in backend)
4. ✅ Check browser console for specific error

**Debug:**
Add this temporarily to `src/App.tsx`:
```javascript
console.log('API URL:', import.meta.env.VITE_API_URL);
```

---

## 🎯 What You'll Have

After completing these steps:

- **Backend:** `https://monad-pulse-api.vercel.app`
- **Frontend:** `https://your-frontend.vercel.app`
- **Connected:** Frontend → Backend via `VITE_API_URL`

---

## 📝 Summary Commands

```bash
# 1. Deploy backend
npm run deploy:backend

# 2. Copy backend URL from output

# 3. Go to Vercel dashboard → Frontend project → Settings → Environment Variables
#    Add: VITE_API_URL = <backend-url>

# 4. Redeploy frontend
npm run deploy
```

---

## 🆘 Need Help?

- Check deployment logs in Vercel dashboard
- Verify environment variables are set correctly
- Test backend endpoints with curl
- Check browser console for errors

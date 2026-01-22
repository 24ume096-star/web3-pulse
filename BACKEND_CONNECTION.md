# Backend Connection Guide

This guide explains how the frontend connects to the backend API and how to configure it.

## ✅ What's Been Fixed

The frontend now connects to the backend API instead of using hardcoded mock data. The following has been implemented:

1. **API Configuration** (`src/config/api.ts`)
   - Centralized API endpoint configuration
   - Environment variable support (`VITE_API_URL`)
   - Request timeout and retry logic

2. **React Hooks** 
   - `useMarkets()` - Fetches markets from `/api/markets`
   - `useMetadata()` - Fetches metadata from `/api/metadata`
   - Automatic refresh every 2-5 minutes

3. **Updated App.tsx**
   - Replaced hardcoded markets with API calls
   - Shows HOT/TRENDING badges from metadata
   - Displays suggested stake amounts
   - Sorts markets by trend score
   - Error handling with fallback UI

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Development (default)
VITE_API_URL=http://localhost:3001

# Production (update with your deployed backend URL)
# VITE_API_URL=https://your-backend-api.vercel.app
```

### Default Configuration

- **Development**: `http://localhost:3001` (default if not set)
- **Production**: Must be set via `VITE_API_URL` environment variable

## 🚀 Starting the Backend

Make sure your backend API server is running:

```bash
# Terminal 1: Start API server
npm run api:start

# Terminal 2: (Optional) Start cron job for metadata updates
npm run cron:start
```

The API server runs on port 3001 by default.

## 📡 API Endpoints Used

The frontend connects to these endpoints:

- `GET /api/markets` - List of all markets
- `GET /api/metadata` - Market metadata (HOT status, suggested stakes, etc.)
- `GET /api/trending` - Trending topics (optional)

## 🌐 Deployment

### Frontend (Vercel)

Set the `VITE_API_URL` environment variable in Vercel:

1. Go to your Vercel project settings
2. Navigate to **Environment Variables**
3. Add `VITE_API_URL` with your backend URL:
   - Production: `https://your-backend-api.vercel.app`
   - Preview: Your preview deployment URL

### Backend

Deploy your backend API to Vercel or another hosting service:

1. The backend API is in `backend/api/server.cjs`
2. Deploy it as a separate Vercel serverless function or Express app
3. Update `VITE_API_URL` to point to the deployed backend

## 🔍 Troubleshooting

### "Could not connect to backend API"

**Check:**
1. ✅ Backend server is running (`npm run api:start`)
2. ✅ Backend is accessible at the configured URL
3. ✅ CORS is enabled on the backend (it should be)
4. ✅ Environment variable `VITE_API_URL` is set correctly

**Test connection:**
```bash
curl http://localhost:3001/api/health
```

### Markets not showing

**Check:**
1. ✅ `/api/markets` endpoint returns data
2. ✅ Check browser console for errors
3. ✅ Verify backend is deployed and accessible

### Metadata not updating

**Check:**
1. ✅ Cron job is running (`npm run cron:start`)
2. ✅ `/api/metadata` endpoint returns data
3. ✅ Metadata file exists: `backend/marketMetadata.json`

## 🎯 Features Enabled

With backend connection, the app now supports:

- ✅ **Real-time market data** from backend
- ✅ **HOT/TRENDING badges** based on trend scores
- ✅ **Suggested stake amounts** from metadata
- ✅ **Market sorting** by visibility/trend score
- ✅ **Automatic refresh** every 2-5 minutes
- ✅ **Error handling** with user-friendly messages

## 📝 Next Steps

1. **Deploy backend API** to Vercel or your preferred hosting
2. **Set environment variables** in Vercel dashboard
3. **Deploy frontend** using `npm run deploy`
4. **Test the connection** between frontend and backend

## 🔗 Related Files

- `src/config/api.ts` - API configuration
- `src/hooks/useMarkets.ts` - Markets data hook
- `src/hooks/useMetadata.ts` - Metadata hook
- `src/App.tsx` - Main app component (uses hooks)
- `backend/api/server.cjs` - Backend API server
- `backend/cronJob.cjs` - Metadata update job

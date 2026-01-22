# Deployment Script for Vercel

Automated deployment script that builds and deploys your application to Vercel.

## Quick Start

### Production Deployment
```bash
npm run deploy
```

### Preview Deployment
```bash
npm run deploy:preview
```

## What It Does

1. ✅ **Checks prerequisites** - Verifies Node.js, npm, and Vercel CLI are installed
2. ✅ **Authenticates** - Ensures you're logged in to Vercel
3. ✅ **Builds project** - Runs `npm run build` to create production build
4. ✅ **Verifies output** - Confirms the `dist` folder was created correctly
5. ✅ **Deploys to Vercel** - Uploads and deploys your app

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **Vercel CLI**: The script will install it automatically if missing
3. **Login**: Run `vercel login` if you haven't already

## First Time Setup

```bash
# 1. Login to Vercel
vercel login

# 2. Deploy
npm run deploy
```

## Manual Steps (Alternative)

If you prefer to deploy manually:

```bash
# 1. Build
npm run build

# 2. Deploy
vercel --prod --yes
```

## Environment Variables

If your app needs environment variables (like API URLs), set them in Vercel:

1. Go to your project in Vercel dashboard
2. Navigate to Settings → Environment Variables
3. Add your variables (e.g., `VITE_API_URL`)

## Troubleshooting

### "Not logged in to Vercel"
```bash
vercel login
```

### "Vercel CLI not found"
```bash
npm install -g vercel
```

### Build fails
- Check for TypeScript errors: `npm run lint`
- Verify all dependencies are installed: `npm install`
- Check `vite.config.ts` and `vercel.json` configuration

### Deployment fails
- Verify you have a `vercel.json` file in the root
- Check your internet connection
- Ensure you have permissions for the Vercel project

## Script Options

- `npm run deploy` - Deploys to production
- `npm run deploy:preview` - Deploys to preview (for testing)

## Files

- `scripts/deploy.cjs` - Main deployment script
- `vercel.json` - Vercel configuration
- `dist/` - Build output (created during build)

## Notes

- The script automatically handles authentication checks
- Build output is verified before deployment
- Production deployments go live immediately
- Preview deployments create shareable preview URLs

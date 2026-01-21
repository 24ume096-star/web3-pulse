# Market Metadata Cron Job

## Overview

Automated backend service that runs every 10 minutes to update market metadata based on trending topics.

**Features:**
- ✅ Fetches trending topics automatically
- ✅ Updates market metadata (HOT status, suggested stake, visibility)
- ✅ Stores data off-chain (JSON files)
- ✅ **NEVER modifies on-chain data or user funds**
- ✅ REST API for frontend integration

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Cron Job (Every 10 min)             │
│                                                          │
│  1. Fetch Trending Topics                              │
│  2. Load Deployed Markets                              │
│  3. Match Markets to Trends                            │
│  4. Update Metadata (OFF-CHAIN)                        │
│  5. Save to marketMetadata.json                        │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│              marketMetadata.json (Storage)              │
│                                                          │
│  {                                                      │
│    "0xMarketAddress": {                                │
│      "isHot": true,                                    │
│      "suggestedStake": "0.0015",                       │
│      "visibilityScore": 85,                            │
│      "trendingTopic": "Bitcoin",                       │
│      "lastUpdated": "2026-01-21T20:50:00Z"            │
│    }                                                    │
│  }                                                      │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                   REST API Server                       │
│                                                          │
│  GET /api/metadata          - All markets              │
│  GET /api/metadata/:address - Specific market          │
│  GET /api/trending          - Current trends           │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
                      Frontend dApp
```

## Quick Start

### 1. Test Cron Job (Run Once)

```bash
npm run cron:test
```

This runs the metadata update once for testing purposes.

**Expected Output:**
```
🧪 Running metadata update once (test mode)...

============================================================
🔄 Starting Market Metadata Update
⏰ Time: 2026-01-21T20:50:00.000Z
============================================================

📊 Fetching trending topics...
✅ Found 10 trending topics

📋 Loading deployed markets...
✅ Found 10 deployed markets

🔧 Updating market metadata...

  ✅ 0x1234567890...
     Question: Will Bitcoin break key resistance in the next 4...
     Trend: Bitcoin Halving Aftermath (Score: 95)
     🔥 HOT | Stake: 0.0015 ETH | Visibility: 95

============================================================
✅ METADATA UPDATE COMPLETE
============================================================
📊 Markets Updated: 10
🔥 Hot Markets: 3
============================================================
```

### 2. Start Cron Job (Production)

```bash
npm run cron:start
```

This starts the cron job that runs every 10 minutes.

**To run in background:**
```bash
# Using PM2 (recommended)
npm install -g pm2
pm2 start backend/cronJob.js --name "market-cron"
pm2 save
pm2 startup

# Or using nohup
nohup npm run cron:start > cron.log 2>&1 &
```

### 3. Start API Server

```bash
npm run api:start
```

The API server will start on port 3001 (configurable via `PORT` env variable).

**Test endpoints:**
```bash
# Get all metadata
curl http://localhost:3001/api/metadata

# Get specific market
curl http://localhost:3001/api/metadata/0xYourMarketAddress

# Get trending topics
curl http://localhost:3001/api/trending

# Health check
curl http://localhost:3001/api/health
```

## Metadata Schema

Each market has the following metadata:

```javascript
{
  "isHot": boolean,           // true if trend score > 75
  "suggestedStake": string,   // ETH amount (e.g., "0.0015")
  "visibilityScore": number,  // 0-100 from trend score
  "trendingTopic": string,    // Matched trending topic
  "trendScore": number,       // Raw trend score
  "lastUpdated": string       // ISO timestamp
}
```

## Metadata Update Logic

### HOT Status
- **HOT (🔥)**: Trend score > 75
- **Trending (📈)**: Trend score 50-75
- **Normal**: Trend score < 50

### Suggested Stake Calculation

Base stake: `0.001 ETH`

| Trend Score | Multiplier | Example Stake |
|-------------|------------|---------------|
| 0-50        | 1.1x       | 0.0011 ETH    |
| 50-75       | 1.1-1.3x   | 0.0011-0.0013 ETH |
| 75-100      | 1.3-1.5x   | 0.0013-0.0015 ETH |

### Visibility Score
Directly maps to trend score (0-100)

## Files

### Backend Services

- **`backend/metadataService.js`** - Core metadata management
  - Load/save metadata
  - Calculate suggested stakes
  - Match markets to trends
  - Cleanup old data

- **`backend/cronJob.js`** - Scheduled job
  - Runs every 10 minutes
  - Fetches trends
  - Updates all markets
  - Logs activity

- **`backend/api/server.js`** - REST API
  - Serves metadata to frontend
  - Read-only endpoints
  - CORS enabled

### Data Files

- **`backend/marketMetadata.json`** - Metadata storage
  - Auto-created on first run
  - Updated every 10 minutes
  - Cleaned up weekly

- **`deployments.json`** - Market addresses
  - Created by deployment script
  - Read by cron job

## Frontend Integration

### Fetch All Metadata

```javascript
async function fetchMarketMetadata() {
  const response = await fetch('http://localhost:3001/api/metadata');
  const { data } = await response.json();
  return data;
}
```

### Display HOT Badge

```jsx
function MarketCard({ market, metadata }) {
  return (
    <div className="market-card">
      {metadata?.isHot && <span className="hot-badge">🔥 HOT</span>}
      <h3>{market.question}</h3>
      <p>Suggested Stake: {metadata?.suggestedStake || '0.001'} ETH</p>
    </div>
  );
}
```

### Sort by Visibility

```javascript
markets.sort((a, b) => {
  const scoreA = metadata[a.address]?.visibilityScore || 0;
  const scoreB = metadata[b.address]?.visibilityScore || 0;
  return scoreB - scoreA;
});
```

## Deployment Options

### Option 1: PM2 (Recommended for VPS)

```bash
# Install PM2
npm install -g pm2

# Start cron job
pm2 start backend/cronJob.js --name "market-cron"

# Start API server
pm2 start backend/api/server.js --name "market-api"

# Save configuration
pm2 save

# Auto-start on reboot
pm2 startup
```

### Option 2: Docker

Create `Dockerfile`:
```dockerfile
FROM node:18
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
CMD ["npm", "run", "cron:start"]
```

Run:
```bash
docker build -t market-cron .
docker run -d --name market-cron market-cron
```

### Option 3: Vercel Cron (Serverless)

Create `api/cron.js`:
```javascript
const { updateMarketMetadata_Job } = require('../backend/cronJob');

export default async function handler(req, res) {
  await updateMarketMetadata_Job();
  res.json({ success: true });
}
```

Add to `vercel.json`:
```json
{
  "crons": [{
    "path": "/api/cron",
    "schedule": "*/10 * * * *"
  }]
}
```

## Monitoring

### Check Cron Job Status

```bash
# If using PM2
pm2 status
pm2 logs market-cron

# If using nohup
tail -f cron.log
```

### Verify Metadata Updates

```bash
# Check metadata file
cat backend/marketMetadata.json

# Check last update time
node -e "console.log(require('./backend/marketMetadata.json'))"
```

## Troubleshooting

### Cron job not running

**Check if process is running:**
```bash
ps aux | grep cronJob
```

**Restart:**
```bash
pm2 restart market-cron
# or
npm run cron:start
```

### No markets found

**Ensure deployments.json exists:**
```bash
ls -la deployments.json
```

**Deploy markets first:**
```bash
npm run deploy:markets
```

### API not accessible

**Check if server is running:**
```bash
curl http://localhost:3001/api/health
```

**Check port availability:**
```bash
netstat -an | grep 3001
```

**Change port:**
```bash
PORT=3002 npm run api:start
```

## Safety Guarantees

✅ **No on-chain modifications**
- Cron job only reads from blockchain
- Never sends transactions
- Never modifies user funds

✅ **Off-chain storage only**
- All metadata in JSON files
- No smart contract state changes
- Fully reversible

✅ **Read-only API**
- All endpoints are GET requests
- No state mutations
- CORS enabled for frontend

## Next Steps

1. **Deploy markets** (if not done):
   ```bash
   npm run deploy:markets
   ```

2. **Test cron job**:
   ```bash
   npm run cron:test
   ```

3. **Start services**:
   ```bash
   npm run cron:start  # Terminal 1
   npm run api:start   # Terminal 2
   ```

4. **Integrate frontend**:
   - Fetch metadata from API
   - Display HOT badges
   - Show suggested stakes
   - Sort by visibility

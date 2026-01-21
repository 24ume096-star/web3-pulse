# Market Deployment Script

## Overview

The `deployMarkets.js` script automates the deployment of PredictionMarket contracts with the following features:

- ✅ Deploys new PredictionMarket contracts via PredictionFactory
- ✅ Uses trending questions (auto-generated from trending topics)
- ✅ Sets short endTimes (5-30 minutes for demo purposes)
- ✅ Seeds small initial liquidity from owner wallet (0.001 ETH per side)
- ✅ Avoids creating duplicate markets
- ✅ Logs all deployed addresses to `deployments.json`

## Prerequisites

1. **Environment Setup**: Create a `.env` file with your private key:
   ```
   PRIVATE_KEY=your_private_key_here
   ```

2. **Network**: Ensure you're connected to Monad Testnet (configured in `hardhat.config.cjs`)

3. **Funds**: Make sure your wallet has sufficient ETH for:
   - Gas fees for deployments
   - Initial liquidity (0.002 ETH per market)

## Usage

### First Time Deployment (with Factory)

Deploy the factory and markets:

```bash
npx hardhat run scripts/deployMarkets.js --network monadTestnet
```

This will:
1. Deploy a new PredictionFactory contract
2. Generate prediction questions from trending topics
3. Deploy markets with random 5-30 minute durations
4. Seed each market with 0.001 ETH on YES and 0.001 ETH on NO
5. Save all addresses to `deployments.json`

### Subsequent Deployments (using existing Factory)

If you already have a factory deployed, set the `FACTORY_ADDRESS` environment variable:

```bash
FACTORY_ADDRESS=0xYourFactoryAddress npx hardhat run scripts/deployMarkets.js --network monadTestnet
```

Or add it to your `.env` file:
```
FACTORY_ADDRESS=0xYourFactoryAddress
```

## Configuration

Edit the `CONFIG` object in `deployMarkets.js` to customize:

```javascript
const CONFIG = {
    INITIAL_LIQUIDITY_YES: "0.001", // ETH to seed on YES
    INITIAL_LIQUIDITY_NO: "0.001",  // ETH to seed on NO
    MIN_DURATION: 5 * 60,           // 5 minutes
    MAX_DURATION: 30 * 60,          // 30 minutes
    DEPLOYMENT_LOG: "deployments.json"
};
```

## Trending Topics

The script uses a predefined list of trending topics in `TRENDING_TOPICS`. You can:

1. **Edit the list** directly in `deployMarkets.js`
2. **Replace with API data** from Twitter, Google Trends, etc.

Current topics include:
- Bitcoin, Ethereum, Monad Testnet
- DeepSeek AI, ChatGPT-5
- Nvidia Stock, Tesla, SpaceX
- And more...

## Output

### Console Output

The script provides detailed logging:

```
🚀 Starting PredictionMarket Deployment Script
============================================================
👤 Deployer: 0x1234...
💰 Balance: 1.5 ETH

🏭 Deploying new PredictionFactory...
✅ PredictionFactory deployed at: 0xFactory...

============================================================
🎯 Generating Prediction Markets from Trending Topics

📊 Deploying market: "Will Bitcoin break key resistance in the next 4 hours?"
   Duration: 15 minutes
   ✅ Market deployed at: 0xMarket1...
   💰 Seeding liquidity...
      YES: 0.001 ETH
      NO: 0.001 ETH

============================================================
📊 DEPLOYMENT SUMMARY
============================================================
🏭 Factory Address: 0xFactory...
✅ Markets Deployed: 10
⏭️  Markets Skipped (duplicates): 0
📁 Total Markets: 10
💾 Log File: /path/to/deployments.json
============================================================

📋 DEPLOYED MARKET ADDRESSES:

1. 0xMarket1...
   Question: Will Bitcoin break key resistance in the next 4 hours?
   End Time: 2026-01-21T21:15:00.000Z

2. 0xMarket2...
   Question: Will Ethereum volume spike > 20% in the next hour?
   End Time: 2026-01-21T21:00:00.000Z

...
```

### deployments.json

All deployment data is saved to `deployments.json`:

```json
{
  "factory": "0xFactoryAddress...",
  "markets": [
    {
      "address": "0xMarket1...",
      "question": "Will Bitcoin break key resistance in the next 4 hours?",
      "endTime": "2026-01-21T21:15:00.000Z",
      "duration": 900,
      "initialLiquidity": {
        "yes": "0.001",
        "no": "0.001"
      },
      "deployedAt": "2026-01-21T20:45:00.000Z"
    }
  ]
}
```

## Duplicate Prevention

The script automatically:
- Loads existing deployments from `deployments.json`
- Checks if a market with the same question already exists
- Skips deployment if duplicate found
- Logs skipped markets

## Troubleshooting

### "Insufficient funds"
- Ensure your wallet has enough ETH for gas + liquidity
- Each market requires ~0.002 ETH + gas fees

### "Factory not found"
- Remove `FACTORY_ADDRESS` from `.env` to deploy a new factory
- Or verify the factory address is correct

### "Market already exists"
- This is expected behavior (duplicate prevention)
- The script will skip and continue with other markets

## Integration with Frontend

Use the `deployments.json` file to:
1. Load market addresses in your dApp
2. Display active markets to users
3. Track market history

Example:
```javascript
import deployments from './deployments.json';

const markets = deployments.markets.map(m => ({
  address: m.address,
  question: m.question,
  endTime: new Date(m.endTime)
}));
```

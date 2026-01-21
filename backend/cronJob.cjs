const cron = require('node-cron');
const fs = require('fs');
const path = require('path');
const {
    updateMarketMetadata,
    calculateSuggestedStake,
    matchMarketToTrend,
    cleanupOldMetadata
} = require('./metadataService.cjs');

/**
 * Fetch trending topics (inlined to avoid module conflicts)
 */
async function fetchTrendingTopics() {
    console.log("🚀 Fetching trending topics...");

    // Simulate API network delay
    await new Promise(resolve => setTimeout(resolve, 800));

    // Base mock data tailored to the project's context (Web3, Tech, Future)
    const baseTopics = [
        { topic: "Bitcoin Halving Aftermath", baseScore: 95 },
        { topic: "Monad Mainnet Beta", baseScore: 92 },
        { topic: "AI Agent Economy", baseScore: 88 },
        { topic: "Solana ETF Approval", baseScore: 85 },
        { topic: "Nvidia 50-Series GPU", baseScore: 80 },
        { topic: "Global Interest Rates 2025", baseScore: 78 },
        { topic: "SpaceX Mars Mission Date", baseScore: 75 },
        { topic: "Ethereum Gas Fees Low", baseScore: 72 },
        { topic: "Quantum Internet Tests", baseScore: 68 },
        { topic: "Digital Identity Regulation", baseScore: 65 }
    ];

    // Generate dynamic scores
    const trends = baseTopics.map(item => {
        // Fluctuate score by -10 to +5
        const fluctuation = Math.floor(Math.random() * 15) - 10;
        let score = item.baseScore + fluctuation;

        // Clamp score between 0 and 100
        score = Math.max(0, Math.min(100, score));

        return {
            topic: item.topic,
            score: score
        };
    });

    // Sort by popularity score (Descending)
    trends.sort((a, b) => b.score - a.score);

    return trends;
}

/**
 * Cron Job for Market Metadata Updates
 * 
 * Runs every 10 minutes to:
 * - Fetch trending topics
 * - Update market metadata (HOT status, suggested stake, visibility)
 * - Store metadata off-chain
 * 
 * CRITICAL: This job NEVER modifies on-chain data or user funds.
 */

const DEPLOYMENTS_FILE = path.join(__dirname, '../deployments.json');
const BASE_STAKE = "0.001"; // Base stake in ETH

/**
 * Load deployed markets
 */
function loadDeployedMarkets() {
    try {
        if (fs.existsSync(DEPLOYMENTS_FILE)) {
            const data = fs.readFileSync(DEPLOYMENTS_FILE, 'utf8');
            const deployments = JSON.parse(data);
            return deployments.markets || [];
        }
    } catch (error) {
        console.error('⚠️  Error loading deployments:', error.message);
    }
    return [];
}

/**
 * Update metadata for all markets based on trending topics
 */
async function updateMarketMetadata_Job() {
    console.log('\n' + '='.repeat(60));
    console.log('🔄 Starting Market Metadata Update');
    console.log('⏰ Time:', new Date().toISOString());
    console.log('='.repeat(60));

    try {
        // Step 1: Fetch trending topics
        console.log('\n📊 Fetching trending topics...');
        const trendingTopics = await fetchTrendingTopics();
        console.log(`✅ Found ${trendingTopics.length} trending topics`);

        // Step 2: Load deployed markets
        console.log('\n📋 Loading deployed markets...');
        const markets = loadDeployedMarkets();
        console.log(`✅ Found ${markets.length} deployed markets`);

        if (markets.length === 0) {
            console.log('⚠️  No markets to update');
            return;
        }

        // Step 3: Update metadata for each market
        console.log('\n🔧 Updating market metadata...\n');

        let updatedCount = 0;
        let hotCount = 0;

        for (const market of markets) {
            // Match market to trending topic
            const matchedTrend = matchMarketToTrend(market.question, trendingTopics);

            if (matchedTrend) {
                const trendScore = matchedTrend.score;
                const isHot = trendScore > 75;
                const suggestedStake = calculateSuggestedStake(trendScore, BASE_STAKE);

                // Update metadata
                const success = updateMarketMetadata(market.address, {
                    isHot: isHot,
                    suggestedStake: suggestedStake,
                    visibilityScore: trendScore,
                    trendingTopic: matchedTrend.topic,
                    trendScore: trendScore
                });

                if (success) {
                    updatedCount++;
                    if (isHot) hotCount++;

                    console.log(`  ✅ ${market.address.substring(0, 10)}...`);
                    console.log(`     Question: ${market.question.substring(0, 50)}...`);
                    console.log(`     Trend: ${matchedTrend.topic} (Score: ${trendScore})`);
                    console.log(`     ${isHot ? '🔥 HOT' : '📈 Trending'} | Stake: ${suggestedStake} ETH | Visibility: ${trendScore}`);
                }
            } else {
                // No matching trend - set default values
                updateMarketMetadata(market.address, {
                    isHot: false,
                    suggestedStake: BASE_STAKE,
                    visibilityScore: 50,
                    trendingTopic: null,
                    trendScore: 0
                });
                updatedCount++;
            }
        }

        // Step 4: Cleanup old metadata
        console.log('\n🧹 Cleaning up old metadata...');
        cleanupOldMetadata();

        // Summary
        console.log('\n' + '='.repeat(60));
        console.log('✅ METADATA UPDATE COMPLETE');
        console.log('='.repeat(60));
        console.log(`📊 Markets Updated: ${updatedCount}`);
        console.log(`🔥 Hot Markets: ${hotCount}`);
        console.log(`⏰ Next Update: ${new Date(Date.now() + 10 * 60 * 1000).toLocaleTimeString()}`);
        console.log('='.repeat(60) + '\n');

    } catch (error) {
        console.error('❌ Error updating metadata:', error);
    }
}

/**
 * Start the cron job
 */
function startCronJob() {
    console.log('🚀 Market Metadata Cron Job Starting...\n');
    console.log('⏰ Schedule: Every 10 minutes');
    console.log('📁 Metadata File: backend/marketMetadata.json');
    console.log('🔒 Safety: No on-chain modifications\n');

    // Run immediately on start
    console.log('▶️  Running initial update...');
    updateMarketMetadata_Job();

    // Schedule cron job for every 10 minutes
    // Cron pattern: */10 * * * * = every 10 minutes
    const job = cron.schedule('*/10 * * * *', () => {
        updateMarketMetadata_Job();
    });

    console.log('✅ Cron job scheduled successfully\n');

    // Handle graceful shutdown
    process.on('SIGINT', () => {
        console.log('\n\n🛑 Stopping cron job...');
        job.stop();
        console.log('✅ Cron job stopped');
        process.exit(0);
    });

    process.on('SIGTERM', () => {
        console.log('\n\n🛑 Stopping cron job...');
        job.stop();
        console.log('✅ Cron job stopped');
        process.exit(0);
    });
}

// Command line arguments
const args = process.argv.slice(2);

if (args.includes('--once')) {
    // Run once for testing
    console.log('🧪 Running metadata update once (test mode)...\n');
    updateMarketMetadata_Job().then(() => {
        console.log('\n✅ Test complete');
        process.exit(0);
    });
} else {
    // Start cron job
    startCronJob();
}

module.exports = { updateMarketMetadata_Job, startCronJob };

const express = require('express');
const cors = require('cors');
const path = require('path');
const {
    getAllMetadata,
    getMarketMetadata,
    applyConfidenceDecay
} = require('../metadataService.cjs');
const { generateQuestion } = require('../../scripts/generateQuestions.cjs');
const { generateQuestion } = require('../../scripts/generateQuestions.cjs');
const { creditPoints, getUserBalance, deductPoints } = require('../pointsService.cjs');
const { requestWithdrawal, recordWithdrawal } = require('../withdrawalService.cjs');

/**
 * Fetch trending topics from live news (Google News RSS)
 */
async function fetchTrendingTopics() {
    try {
        console.log('📡 Fetching live news from Google News...');
        const fetch = require('node-fetch');

        // Google News RSS for Crypto and Tech
        const RSS_URL = 'https://news.google.com/rss/search?q=crypto+tech+monad+ai&hl=en-US&gl=US&ceid=US:en';

        const response = await fetch(RSS_URL);
        if (!response.ok) throw new Error(`RSS fetch failed: ${response.status}`);

        const xml = await response.text();

        // Simple regex-based XML parsing
        // Extract <title> and <link> contents from <item> blocks
        const itemRegex = /<item>[\s\S]*?<title>(.*?)<\/title>[\s\S]*?<link>(.*?)<\/link>[\s\S]*?<\/item>/g;
        const titles = [];
        let match;

        while ((match = itemRegex.exec(xml)) !== null && titles.length < 15) {
            let title = match[1];
            // Decode basic XML entities
            title = title
                .replace(/&amp;/g, '&')
                .replace(/&lt;/g, '<')
                .replace(/&gt;/g, '>')
                .replace(/&quot;/g, '"')
                .replace(/&apos;/g, "'");

            // Remove source branding (usually at the end: " - Source Name")
            title = title.replace(/\s-\s[^-]+$/, '');

            // Extract a shorter "topic" from the headline (first 4-5 words or before a colon)
            let topic = title.split(':')[0].split(' - ')[0].trim();
            const words = topic.split(' ');
            if (words.length > 5) {
                topic = words.slice(0, 5).join(' ');
            }

            titles.push({
                topic: topic,
                headline: title,
                url: match[2],
                score: 80 + Math.floor(Math.random() * 20)
            });
        }

        if (titles.length > 0) {
            console.log(`✅ Extracted ${titles.length} live topics`);
            return titles;
        }

        throw new Error('No titles found in RSS');
    } catch (error) {
        console.error('❌ Error fetching live news:', error);
        // Fallback to minimal static list if fetch fails
        return [
            { topic: "Bitcoin Halving", score: 95 },
            { topic: "Monad Mainnet", score: 92 },
            { topic: "AI Agents", score: 88 },
            { topic: "Solana ETF", score: 85 },
            { topic: "Nvidia GPU", score: 80 }
        ];
    }
}

/**
 * REST API for Market Metadata
 * 
 * Provides endpoints for frontend to fetch:
 * - Market metadata (HOT status, suggested stakes, visibility)
 * - Trending topics
 * 
 * This API serves READ-ONLY data. No on-chain modifications.
 */

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

/**
 * GET /
 * Root endpoint - API Information
 */
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Market Pulse API is running',
        version: '1.0.0',
        endpoints: {
            markets: '/api/markets',
            metadata: '/api/metadata',
            trending: '/api/trending',
            activity: '/api/activity',
            health: '/api/health'
        }
    });
});

/**
 * GET /api/metadata
 * Get all market metadata
 */
app.get('/api/metadata', (req, res) => {
    try {
        const metadata = getAllMetadata();

        // Apply decay to all metadata entries on-the-fly
        const decayedMetadata = {};
        for (const [address, data] of Object.entries(metadata)) {
            decayedMetadata[address] = applyConfidenceDecay(data);
        }

        res.json({
            success: true,
            data: decayedMetadata,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error fetching metadata:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch metadata'
        });
    }
});

/**
 * GET /api/metadata/:address
 * Get metadata for a specific market
 */
app.get('/api/metadata/:address', (req, res) => {
    try {
        const { address } = req.params;
        const metadata = getMarketMetadata(address);

        if (!metadata) {
            return res.status(404).json({
                success: false,
                error: 'Market not found'
            });
        }

        const decayedMetadata = applyConfidenceDecay(metadata);

        res.json({
            success: true,
            data: decayedMetadata,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error fetching market metadata:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch market metadata'
        });
    }
});

/**
 * GET /api/activity
 * Get simulated live activity feed
 */
app.get('/api/activity', (req, res) => {
    const activities = [
        "🔥 Just pulsed YES on Monad",
        "🚀 New crowd volume record on Bitcoin!",
        "👥 12 friends joined the AI Regulation pulse",
        "💰 Winning claim: 0.5 Pulse Credits on SpaceX",
        "⚡ TRENDING: Nvidia is heating up!",
        "🏆 Top pulser shared a 5x win",
        "👀 Someone just pulsed 1000 Credits on Tesla"
    ];

    // Return 3-5 random recent activities
    const count = Math.floor(Math.random() * 3) + 3;
    const result = [...activities]
        .sort(() => 0.5 - Math.random())
        .slice(0, count)
        .map(text => ({
            id: Math.random().toString(36).substr(2, 9),
            text,
            time: "Just now"
        }));

    res.json({
        success: true,
        data: result,
        timestamp: new Date().toISOString()
    });
});

/**
 * GET /api/markets
 * Get list of markets (returns real deployments or simulated ones)
 */
app.get('/api/markets', async (req, res) => {
    try {
        const fs = require('fs');
        const DEPLOYMENTS_FILE = path.join(__dirname, '../../deployments.json');

        let markets = [];

        // 1. Try to load real deployments
        if (fs.existsSync(DEPLOYMENTS_FILE)) {
            const data = fs.readFileSync(DEPLOYMENTS_FILE, 'utf8');
            const deployments = JSON.parse(data);
            markets = deployments.markets || [];
        }

        // 2. If no real markets, generate simulated ones
        if (markets.length === 0) {
            console.log('🎲 No real markets found, generating simulated markets...');
            const trends = await fetchTrendingTopics();
            markets = trends.slice(0, 6).map((trend, index) => {
                const questionData = generateQuestion(trend.topic);
                return {
                    id: `sim-${index}`,
                    address: `sim-address-${index}`,
                    question: questionData.question,
                    yesPool: 500 + Math.floor(Math.random() * 2000),
                    noPool: 500 + Math.floor(Math.random() * 2000),
                    endTime: "24 hours",
                    category: questionData.category,
                    isSimulated: true,
                    // Pulse Intelligence Fields
                    insight: `Top trending in ${questionData.category}`,
                    sentiment: 'bullish',
                    source: 'Google News',
                    sourceUrl: trend.url || 'https://news.google.com'
                };
            });
        }

        res.json({
            success: true,
            data: markets,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error fetching markets:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch markets'
        });
    }
});

/**
 * POST /api/claim
 * Claim winnings for a resolved market
 */
app.post('/api/claim', (req, res) => {
    try {
        const { userId, marketId, userStake, totalPool, winningSidePool, outcome } = req.body;

        if (!userId || !marketId || !userStake || !totalPool || !winningSidePool || !outcome) {
            return res.status(400).json({
                success: false,
                error: 'Missing required parameters'
            });
        }

        const result = creditPoints(userId, marketId, userStake, totalPool, winningSidePool, outcome);

        if (!result.success) {
            return res.status(400).json(result);
        }

        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('Error claiming points:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to claim points'
        });
    }
});

/**
 * GET /api/balance/:userId
 * Get user points balance
 */
app.get('/api/balance/:userId', (req, res) => {
    const { userId } = req.params;
    const balance = getUserBalance(userId);
    res.json({
        success: true,
        balance
    });
});

/**
 * GET /api/health
 * Health check endpoint
 */
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        status: 'healthy',
        timestamp: new Date().toISOString()
    });
});

    }
});

/**
 * POST /api/withdraw
 * Request point withdrawal to wallet
 */
app.post('/api/withdraw', (req, res) => {
    try {
        const { userId, walletAddress, amount } = req.body;

        if (!userId || !walletAddress || !amount) {
            return res.status(400).json({ success: false, error: 'Missing parameters' });
        }

        const withdrawalReq = requestWithdrawal(userId, walletAddress, Number(amount));

        if (!withdrawalReq.success) {
            return res.status(400).json(withdrawalReq);
        }

        // Execute Deduction
        const deducted = deductPoints(userId, Number(amount));
        if (!deducted) {
            return res.status(400).json({ success: false, error: 'Transaction failed during deduction' });
        }

        // Record
        const record = recordWithdrawal(userId, walletAddress, Number(amount), withdrawalReq.txHash);

        res.json({
            success: true,
            data: record,
            newBalance: getUserBalance(userId)
        });

    } catch (error) {
        console.error('Error processing withdrawal:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

/**
 * Start the API server
 */
function startServer() {
    app.listen(PORT, () => {
        console.log('🚀 Market Metadata API Server');
        console.log('='.repeat(40));
        console.log(`📡 Server running on port ${PORT}`);
        console.log(`🌐 Base URL: http://localhost:${PORT}`);
        console.log('\n📋 Available Endpoints:');
        console.log(`  GET /api/metadata          - All market metadata`);
        console.log(`  GET /api/metadata/:address - Specific market`);
        console.log(`  GET /api/trending          - Trending topics`);
        console.log(`  GET /api/markets           - List of markets (Demo)`);
        console.log(`  GET /api/health            - Health check`);
        console.log('='.repeat(40) + '\n');
    });
}

// Start server if run directly
if (require.main === module) {
    startServer();
}

module.exports = { app, startServer };

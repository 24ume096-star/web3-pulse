const express = require('express');
const cors = require('cors');
const path = require('path');
const {
    getAllMetadata,
    getMarketMetadata
} = require('../metadataService.cjs');

/**
 * Fetch trending topics (inlined to avoid module conflicts)
 */
async function fetchTrendingTopics() {
    await new Promise(resolve => setTimeout(resolve, 800));

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

    const trends = baseTopics.map(item => {
        const fluctuation = Math.floor(Math.random() * 15) - 10;
        let score = Math.max(0, Math.min(100, item.baseScore + fluctuation));
        return { topic: item.topic, score: score };
    });

    trends.sort((a, b) => b.score - a.score);
    return trends;
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
app.use(cors());
app.use(express.json());

/**
 * GET /api/metadata
 * Get all market metadata
 */
app.get('/api/metadata', (req, res) => {
    try {
        const metadata = getAllMetadata();
        res.json({
            success: true,
            data: metadata,
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

        res.json({
            success: true,
            data: metadata,
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
 * GET /api/trending
 * Get current trending topics
 */
app.get('/api/trending', async (req, res) => {
    try {
        const trends = await fetchTrendingTopics();
        res.json({
            success: true,
            data: trends,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error fetching trending topics:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch trending topics'
        });
    }
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
        console.log(`  GET /api/health            - Health check`);
        console.log('='.repeat(40) + '\n');
    });
}

// Start server if run directly
if (require.main === module) {
    startServer();
}

module.exports = { app, startServer };

const fs = require('fs');
const path = require('path');

/**
 * Metadata Service
 * 
 * Manages off-chain market metadata including:
 * - HOT status (trending markets)
 * - Suggested stake amounts
 * - Visibility scores
 * 
 * IMPORTANT: This service NEVER modifies on-chain data or user funds.
 */

const METADATA_FILE = path.join(__dirname, 'marketMetadata.json');

const TREND_STATES = {
    DETECTED: 'DETECTED',
    HOT: 'HOT',
    COOLING: 'COOLING',
    RESOLVED: 'RESOLVED'
};

/**
 * Load metadata from JSON file
 */
function loadMetadata() {
    try {
        if (fs.existsSync(METADATA_FILE)) {
            const data = fs.readFileSync(METADATA_FILE, 'utf8');
            return JSON.parse(data);
        }
    } catch (error) {
        console.error('⚠️  Error loading metadata:', error.message);
    }
    return {};
}

/**
 * Save metadata to JSON file
 */
function saveMetadata(metadata) {
    try {
        fs.writeFileSync(
            METADATA_FILE,
            JSON.stringify(metadata, null, 2),
            'utf8'
        );
        return true;
    } catch (error) {
        console.error('❌ Error saving metadata:', error.message);
        return false;
    }
}

/**

    if (trendScore >= 75) {
        // Hot market: +30% to +50%
        multiplier = 1.3 + ((trendScore - 75) / 25) * 0.2;
    } else if (trendScore >= 50) {
        // Trending: +10% to +30%
        multiplier = 1.1 + ((trendScore - 50) / 25) * 0.2;
    } else {
        // Normal: +10%
        multiplier = 1.1;
    }

    const suggested = base * multiplier;
    return suggested.toFixed(4);
}

/**
 * Calculate activity status based on trend score changes
 * 
 * @param {number} currentScore - Current trend score
 * @param {number} previousScore - Previous trend score (optional)
 * @returns {string} Activity status: 'increasing', 'stable', or 'decreasing'
 */
function calculateActivityStatus(currentScore, previousScore = null) {
    if (previousScore === null) {
        return 'increasing'; // Default for new markets
    }

    const difference = currentScore - previousScore;
    if (difference > 5) {
        return 'increasing';
    } else if (difference < -5) {
        return 'decreasing';
    } else {
        return 'stable';
    }
}

/**
 * Calculate trend state based on momentum scores
 * 
 * @param {number} articleCount 
 * @param {number} recencyScore 
 * @returns {string} One of TREND_STATES
 */
function calculateTrendState(articleCount, recencyScore) {
    const totalScore = (articleCount / 20) * 60 + recencyScore * 0.4;

    if (totalScore >= 80) return TREND_STATES.HOT;
    if (totalScore >= 50) return TREND_STATES.DETECTED;
    if (totalScore >= 20) return TREND_STATES.COOLING;
    return TREND_STATES.COOLING; // Default to cooling before resolution
}

/**
 * Apply time-based confidence decay to metadata
 * 
 * @param {object} data - Market metadata entry
 * @returns {object} Updated entry with decayed scores
 */
function applyConfidenceDecay(data) {
    if (!data.lastUpdated) return data;

    const hoursSinceUpdate = (Date.now() - new Date(data.lastUpdated).getTime()) / (1000 * 60 * 60);

    // Decay article count and recency based on time
    // Roughly 5% decay per hour
    const decayFactor = Math.pow(0.95, hoursSinceUpdate);

    const updatedData = {
        ...data,
        articleCount: Math.max(1, Math.floor((data.articleCount || 10) * decayFactor)),
        recencyScore: Math.max(10, Math.floor((data.recencyScore || 80) * decayFactor)),
    };

    updatedData.trendState = calculateTrendState(updatedData.articleCount, updatedData.recencyScore);
    updatedData.suggestedStake = calculateSuggestedStake(updatedData);

    return updatedData;
}

/**
 * Generate simulated sentiment data for early/late phases
 * 
 * @returns {object} Sentiment data
 */
function generateSentimentData() {
    const earlyYes = Math.floor(Math.random() * 60) + 20; // 20-80%
    const lateYes = Math.floor(Math.random() * 60) + 20; // 20-80%

    return {
        earlyPhase: { yes: earlyYes, no: 100 - earlyYes },
        latePhase: { yes: lateYes, no: 100 - lateYes }
    };
}

/**
 * Update metadata for a specific market
 * 
 * @param {string} marketAddress - Contract address
 * @param {object} updates - Metadata updates
 * @returns {boolean} Success status
 */
function updateMarketMetadata(marketAddress, updates) {
    const metadata = loadMetadata();

    if (!metadata[marketAddress]) {
        metadata[marketAddress] = {};
    }

    const previousScore = metadata[marketAddress].visibilityScore || metadata[marketAddress].trendScore;
    const currentScore = updates.visibilityScore || updates.trendScore || previousScore;

    // Calculate activity status
    if (currentScore !== undefined) {
        updates.activityStatus = calculateActivityStatus(currentScore, previousScore);
    }

    const articleCount = updates.articleCount || currentData.articleCount || Math.floor(Math.random() * 15) + 5;
    const recencyScore = updates.recencyScore || currentData.recencyScore || Math.floor(Math.random() * 40) + 60;
    const trendState = updates.trendState || calculateTrendState(articleCount, recencyScore);

    const baseMetadata = {
        ...currentData,
        ...updates,
        articleCount,
        recencyScore,
        trendState,
        sentiment: currentData.sentiment || generateSentimentData(),
        lastUpdated: new Date().toISOString()
    };

    metadata[marketAddress] = {
        ...baseMetadata,
        suggestedStake: calculateSuggestedStake(baseMetadata)
    };

    return saveMetadata(metadata);
}

/**
 * Get metadata for a specific market
 * 
 * @param {string} marketAddress - Contract address
 * @returns {object|null} Market metadata or null
 */
function getMarketMetadata(marketAddress) {
    const metadata = loadMetadata();
    return metadata[marketAddress] || null;
}

/**
 * Get all market metadata
 * 
 * @returns {object} All metadata
 */
function getAllMetadata() {
    return loadMetadata();
}

/**
 * Clear old metadata (markets older than 7 days)
 */
function cleanupOldMetadata() {
    const metadata = loadMetadata();
    const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);

    let cleaned = 0;

    for (const [address, data] of Object.entries(metadata)) {
        if (data.lastUpdated) {
            const lastUpdate = new Date(data.lastUpdated).getTime();
            if (lastUpdate < sevenDaysAgo) {
                delete metadata[address];
                cleaned++;
            }
        }
    }

    if (cleaned > 0) {
        saveMetadata(metadata);
        console.log(`🧹 Cleaned up ${cleaned} old market metadata entries`);
    }

    return cleaned;
}

/**
 * Match market question to trending topic
 * 
 * @param {string} question - Market question
 * @param {array} trendingTopics - Array of {topic, score}
 * @returns {object|null} Matching trend or null
 */
function matchMarketToTrend(question, trendingTopics) {
    const questionLower = question.toLowerCase();

    // Find best matching trend
    for (const trend of trendingTopics) {
        const topicWords = trend.topic.toLowerCase().split(' ');

        // Check if any significant words from topic appear in question
        const matches = topicWords.filter(word =>
            word.length > 3 && questionLower.includes(word)
        );

        if (matches.length > 0) {
            return trend;
        }
    }

    return null;
}

module.exports = {
    loadMetadata,
    saveMetadata,
    calculateSuggestedStake,
    updateMarketMetadata,
    getMarketMetadata,
    getAllMetadata,
    cleanupOldMetadata,
    matchMarketToTrend,
    calculateActivityStatus
};

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
 * Calculate suggested stake based on trend score
 * 
 * @param {number} trendScore - Score from 0-100
 * @param {string} baseStake - Base stake amount in ETH (e.g., "0.001")
 * @returns {string} Suggested stake in ETH
 */
function calculateSuggestedStake(trendScore, baseStake = "0.001") {
    const base = parseFloat(baseStake);

    // Increase stake by 10-50% based on trend score
    // Score 0-50: +10%
    // Score 50-75: +10-30%
    // Score 75-100: +30-50%

    let multiplier = 1.0;

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

    // Merge updates
    metadata[marketAddress] = {
        ...metadata[marketAddress],
        ...updates,
        lastUpdated: new Date().toISOString()
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
    matchMarketToTrend
};

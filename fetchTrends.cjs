/**
 * Trending Topics Fetcher
 * 
 * Fetches 5-10 trending topics from Google Trends RSS (no API key needed)
 * Falls back to mock data if Google Trends is unavailable
 * 
 * Returns: Array<{ topic: string, score: number }> sorted by popularity
 */

const https = require('https');

/**
 * Fetch trending topics from Google Trends RSS feed
 * No API key required - uses public RSS feed
 */
async function fetchGoogleTrends() {
    return new Promise((resolve, reject) => {
        const url = 'https://trends.google.com/trends/trendingsearches/daily/rss?geo=US';
        
        https.get(url, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                try {
                    // Parse RSS XML - handle both CDATA and plain text formats
                    const titlePatterns = [
                        /<title><!\[CDATA\[([^\]]+)\]\]><\/title>/g,
                        /<title>([^<]+)<\/title>/g
                    ];
                    
                    const trafficRegex = /<ht:approx_traffic>([^<]+)<\/ht:approx_traffic>/g;
                    
                    const titles = [];
                    const traffic = [];
                    
                    // Try both patterns for titles
                    for (const pattern of titlePatterns) {
                        let match;
                        while ((match = pattern.exec(data)) !== null) {
                            titles.push(match[1].trim());
                        }
                        if (titles.length > 0) break;
                    }
                    
                    let match;
                    while ((match = trafficRegex.exec(data)) !== null) {
                        const trafficValue = parseInt(match[1].replace(/[+,]/g, '')) || 0;
                        traffic.push(trafficValue);
                    }
                    
                    // Skip first title (feed title)
                    if (titles.length > 0) {
                        titles.shift();
                    }
                    
                    // Create trend objects
                    const trends = titles.slice(0, 10).map((title, index) => {
                        const trafficValue = traffic[index] || 0;
                        // Normalize traffic to score (0-100)
                        const maxTraffic = traffic.length > 0 ? Math.max(...traffic, 200000) : 200000;
                        const score = maxTraffic > 0 
                            ? Math.min(100, Math.round((trafficValue / maxTraffic) * 100))
                            : 70 + Math.floor(Math.random() * 20); // Default score if no traffic data
                        
                        return {
                            topic: title,
                            score: Math.max(60, score) // Ensure minimum visibility
                        };
                    });
                    
                    // Sort by score (descending)
                    trends.sort((a, b) => b.score - a.score);
                    
                    resolve(trends);
                } catch (error) {
                    reject(new Error(`Failed to parse Google Trends: ${error.message}`));
                }
            });
        }).on('error', (error) => {
            reject(error);
        });
    });
}

/**
 * Generate mock trending topics
 * Used as fallback when Google Trends is unavailable
 */
function getMockTrends() {
    const mockTopics = [
        { topic: "Bitcoin Price Surge", score: 95 },
        { topic: "AI Technology Breakthrough", score: 92 },
        { topic: "Tech Stock Market Rally", score: 88 },
        { topic: "Climate Summit 2026", score: 85 },
        { topic: "SpaceX Mars Mission Update", score: 82 },
        { topic: "Quantum Computing Progress", score: 78 },
        { topic: "Electric Vehicle Innovation", score: 75 },
        { topic: "Cryptocurrency Regulation", score: 72 },
        { topic: "5G Network Expansion", score: 68 },
        { topic: "Renewable Energy Investment", score: 65 }
    ];
    
    // Return 5-10 random topics sorted by score
    const count = Math.floor(Math.random() * 6) + 5; // 5-10 items
    return mockTopics.slice(0, count).sort((a, b) => b.score - a.score);
}

/**
 * Main function to fetch trending topics
 * Returns 5-10 trends sorted by popularity score
 */
async function fetchTrendingTopics() {
    try {
        console.log('Fetching from Google Trends...');
        const trends = await fetchGoogleTrends();
        
        if (trends && trends.length >= 5) {
            // Ensure we return 5-10 items
            const count = Math.min(trends.length, 10);
            return trends.slice(0, count);
        }
        
        throw new Error('Insufficient trends from Google');
    } catch (error) {
        console.log(`Using mock data (Google Trends unavailable: ${error.message})`);
        return getMockTrends();
    }
}

// Run as standalone script
if (require.main === module) {
    (async () => {
        try {
            const trends = await fetchTrendingTopics();
            
            console.log('\n📊 Trending Topics:\n');
            trends.forEach((trend, index) => {
                console.log(`${index + 1}. ${trend.topic}`);
                console.log(`   Score: ${trend.score}/100\n`);
            });
            
            console.log(`Total: ${trends.length} trends`);
            
            // Export as JSON for easy parsing
            console.log('\nJSON Output:');
            console.log(JSON.stringify(trends, null, 2));
        } catch (error) {
            console.error('Error:', error.message);
            process.exit(1);
        }
    })();
}

module.exports = { fetchTrendingTopics, getMockTrends };


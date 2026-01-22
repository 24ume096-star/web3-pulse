const https = require('https');
const http = require('http');

/**
 * Enhanced Trending Topics Fetcher
 * 
 * Fetches trending topics from multiple sources:
 * 1. Google Trends RSS (no API key needed)
 * 2. Mock data (fallback)
 * 
 * Returns: Array<{ topic: string, score: number }>
 */

/**
 * Fetch Google Trends RSS Feed
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
                    // Parse RSS XML (simple regex-based parsing)
                    const titleRegex = /<title>([^<]+)<\/title>/g;
                    const trafficRegex = /<ht:approx_traffic>([^<]+)<\/ht:approx_traffic>/g;

                    const titles = [];
                    const traffic = [];

                    let match;
                    while ((match = titleRegex.exec(data)) !== null) {
                        titles.push(match[1]);
                    }

                    while ((match = trafficRegex.exec(data)) !== null) {
                        traffic.push(match[1]);
                    }

                    // Skip first title (it's the feed title)
                    titles.shift();

                    // Combine titles and traffic into trend objects
                    const trends = titles.slice(0, 10).map((title, index) => {
                        // Convert traffic to score (normalize to 0-100)
                        const trafficValue = traffic[index] ? parseInt(traffic[index].replace(/[+,]/g, '')) : 0;
                        const maxTraffic = 200000; // Approximate max for normalization
                        const score = Math.min(100, Math.round((trafficValue / maxTraffic) * 100));

                        return {
                            topic: title,
                            score: Math.max(50, score) // Ensure minimum score of 50
                        };
                    });

                    resolve(trends);
                } catch (error) {
                    reject(error);
                }
            });
        }).on('error', (error) => {
            reject(error);
        });
    });
}

/**
 * Generate mock trending data
 * Used as fallback when real APIs fail
 */
function generateMockTrends() {
    const currentDate = new Date();
    const hour = currentDate.getHours();

    // Different topics based on time of day for variety
    const morningTopics = [
        { topic: "Bitcoin Price Surge", baseScore: 95 },
        { topic: "AI Breakthrough Announced", baseScore: 92 },
        { topic: "Tech Stocks Rally", baseScore: 88 },
        { topic: "Climate Summit 2026", baseScore: 85 },
        { topic: "SpaceX Mars Mission Update", baseScore: 82 },
        { topic: "Quantum Computing Milestone", baseScore: 78 },
        { topic: "Electric Vehicle Sales Record", baseScore: 75 },
        { topic: "Cryptocurrency Regulation News", baseScore: 72 },
        { topic: "5G Network Expansion", baseScore: 68 },
        { topic: "Renewable Energy Investment", baseScore: 65 }
    ];

    const afternoonTopics = [
        { topic: "Stock Market Analysis", baseScore: 94 },
        { topic: "Tech IPO Announcement", baseScore: 91 },
        { topic: "Global Economic Outlook", baseScore: 87 },
        { topic: "Cybersecurity Alert", baseScore: 84 },
        { topic: "Social Media Platform Update", baseScore: 80 },
        { topic: "Gaming Industry Trends", baseScore: 77 },
        { topic: "Healthcare Innovation", baseScore: 74 },
        { topic: "Streaming Service Wars", baseScore: 70 },
        { topic: "Remote Work Statistics", baseScore: 67 },
        { topic: "E-commerce Growth", baseScore: 63 }
    ];

    const eveningTopics = [
        { topic: "Ethereum Network Upgrade", baseScore: 96 },
        { topic: "AI Ethics Debate", baseScore: 93 },
        { topic: "Space Tourism Launch", baseScore: 89 },
        { topic: "Metaverse Development", baseScore: 86 },
        { topic: "Chip Shortage Update", baseScore: 81 },
        { topic: "Autonomous Vehicles Progress", baseScore: 79 },
        { topic: "Digital Privacy Concerns", baseScore: 76 },
        { topic: "Cloud Computing Trends", baseScore: 73 },
        { topic: "Blockchain Adoption", baseScore: 69 },
        { topic: "Green Technology Investment", baseScore: 64 }
    ];

    // Select topics based on time
    let baseTopics;
    if (hour < 12) {
        baseTopics = morningTopics;
    } else if (hour < 18) {
        baseTopics = afternoonTopics;
    } else {
        baseTopics = eveningTopics;
    }

    // Add random fluctuation to scores
    const trends = baseTopics.map(item => {
        const fluctuation = Math.floor(Math.random() * 15) - 7; // -7 to +7
        let score = item.baseScore + fluctuation;
        score = Math.max(50, Math.min(100, score)); // Clamp between 50-100

        return {
            topic: item.topic,
            score: score
        };
    });

    // Sort by score (descending)
    trends.sort((a, b) => b.score - a.score);

    return trends;
}

/**
 * Main function to fetch trending topics
 * Tries Google Trends first, falls back to mock data
 */
async function fetchTrendingTopics() {
    console.log("🔍 Fetching trending topics...");

    try {
        // Try Google Trends first
        console.log("📊 Attempting to fetch from Google Trends...");
        const trends = await fetchGoogleTrends();

        if (trends && trends.length > 0) {
            console.log(`✅ Successfully fetched ${trends.length} trends from Google Trends`);
            return trends;
        }
    } catch (error) {
        console.log("⚠️  Google Trends fetch failed:", error.message);
    }

    // Fallback to mock data
    console.log("🎲 Using mock trending data");
    const mockTrends = generateMockTrends();
    return mockTrends;
}

/**
 * Get top N trending topics
 */
async function getTopTrends(count = 10) {
    const allTrends = await fetchTrendingTopics();
    return allTrends.slice(0, count);
}

// ------------------------------------------------------------------
// CLI Execution
// ------------------------------------------------------------------
if (require.main === module) {
    (async () => {
        try {
            console.log("\n" + "=".repeat(60));
            console.log("🚀 Trending Topics Fetcher");
            console.log("=".repeat(60) + "\n");

            const trends = await fetchTrendingTopics();

            console.log("\n📈 TOP TRENDING TOPICS:\n");
            trends.forEach((trend, index) => {
                const bar = "█".repeat(Math.floor(trend.score / 5));
                console.log(`${index + 1}. ${trend.topic}`);
                console.log(`   Score: ${trend.score}/100 ${bar}`);
                console.log();
            });

            console.log("=".repeat(60));
            console.log(`✅ Total trends fetched: ${trends.length}`);
            console.log("=".repeat(60) + "\n");

        } catch (error) {
            console.error("❌ Error:", error);
            process.exit(1);
        }
    })();
}

module.exports = {
    fetchTrendingTopics,
    getTopTrends,
    fetchGoogleTrends,
    generateMockTrends
};

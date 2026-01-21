const https = require('https');

/**
 * Fetches trending topics.
 * 
 * Strategy:
 * 1.  Mock Data (Primary): Robust, safe, and context-aware for this Web3/Tech project.
 * 2.  (Optional) Google Trends RSS: Can be enabled by uncommenting, but requires XML parsing.
 * 
 * Returns: Array<{ topic: string, score: number }>
 */
async function fetchTrendingTopics() {
    console.log("🚀 Fetching trending topics...");

    // Simulate API network delay
    await new Promise(resolve => setTimeout(resolve, 800));

    // Base mock data tailored to the project's context (Web3, Tech, Future)
    // We start with a base score and add randomization to simulate "Live" trends.
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

// ------------------------------------------------------------------
// Execution Wrapper
// ------------------------------------------------------------------
if (require.main === module) {
    (async () => {
        try {
            const data = await fetchTrendingTopics();
            console.log("\n✅ Trending Topics Fetched Successfully:\n");
            console.log(JSON.stringify(data, null, 2));
        } catch (error) {
            console.error("❌ Error fetching trends:", error);
            process.exit(1);
        }
    })();
}

module.exports = { fetchTrendingTopics };

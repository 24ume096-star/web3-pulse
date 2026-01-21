/**
 * Converts trending topics into prediction market questions.
 * 
 * Rules:
 * - YES/NO format
 * - Time-bound (1h - 24h)
 * - Culturally/Contextually relevant
 */

const TEMPLATES = {
    crypto: [
        "Will {topic} break key resistance in the next 4 hours?",
        "Will {topic} volume spike > 20% in the next hour?",
        "Will {topic} drop below support by midnight?",
        "Will {topic} dominate social sentiment in the next 12h?"
    ],
    tech: [
        "Will {topic} stock close up > 2% today?",
        "Will {topic} maintain trending status for 24h?",
        "Will a major {topic} update drop in the next 6 hours?"
    ],
    general: [
        "Will {topic} search interest double in 24 hours?",
        "Will {topic} be the #1 trending hashtag in 1 hour?",
        "Will relevant news for {topic} break by 5 PM?"
    ]
};

// Simple keyword matching for categorization
const CATEGORIES = {
    crypto: ['bitcoin', 'btc', 'eth', 'ethereum', 'solana', 'monad', 'coin', 'token', 'wallet', 'defi'],
    tech: ['nvidia', 'apple', 'ai', 'google', 'spacex', 'tech', 'gpu', 'robot'],
};

function getCategory(topic) {
    const lower = topic.toLowerCase();
    if (CATEGORIES.crypto.some(k => lower.includes(k))) return 'crypto';
    if (CATEGORIES.tech.some(k => lower.includes(k))) return 'tech';
    return 'general';
}

function getRandomTimeframe() {
    const times = ['1 hour', '4 hours', '12 hours', '24 hours', 'end of day'];
    return times[Math.floor(Math.random() * times.length)];
}

function generateQuestion(topic) {
    const category = getCategory(topic);
    const templates = TEMPLATES[category];

    // Select random template
    const template = templates[Math.floor(Math.random() * templates.length)];

    // Generate Timeframe
    const timeframe = getRandomTimeframe();

    // specific replacements if needed, for now just simple string sub
    let questionText = template.replace('{topic}', topic);

    // Ensure timeframe is in the string if the template doesn't have specific time
    if (!questionText.match(/\d+h|hour|today|midnight|PM|AM/)) {
        questionText += ` within ${timeframe}?`;
    }

    return {
        topic: topic,
        question: questionText,
        type: "BINARY",
        options: ["YES", "NO"],
        category: category.toUpperCase(),
        deadline: timeframe
    };
}

/**
 * Batch processor
 */
function generateQuestionsForTrends(trendList) {
    return trendList.map(t => generateQuestion(t.topic || t));
}

// ------------------------------------------------------------------
// Demo Execution
// ------------------------------------------------------------------
if (require.main === module) {
    const sampleTrends = [
        "Bitcoin",
        "Nvidia AI",
        "Monad Testnet",
        "Global Warming",
        "DeepSeek LLM"
    ];

    console.log("🚀 Generating Questions for Trends...\n");
    const questions = generateQuestionsForTrends(sampleTrends);
    console.log(JSON.stringify(questions, null, 2));
}

module.exports = { generateQuestion, generateQuestionsForTrends };

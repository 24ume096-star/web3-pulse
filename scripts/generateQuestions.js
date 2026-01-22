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
        "Will {topic} be above its current price in the next {timeframe}?",
        "Will {topic} 24h trading volume exceed $500M by tomorrow?",
        "Will {topic} maintain its top-10 trending status for the next {timeframe}?",
        "Will {topic} network gas fees stay below 50 gwei today?"
    ],
    tech: [
        "Will {topic} stock close in the green by the end of the day?",
        "Will {topic} release a major software update in the next 24 hours?",
        "Will {topic} keyword search interest increase by >20% today?",
        "Will {topic} be mentioned in the top tech headlines in the next {timeframe}?"
    ],
    general: [
        "Will {topic} remain a top-3 search trend for the next {timeframe}?",
        "Will news related to {topic} break the front page of major news sites today?",
        "Will {topic} sentiment remain overwhelmingly positive for the next 12 hours?"
    ]
};

// Simple keyword matching for categorization
const CATEGORIES = {
    crypto: ['bitcoin', 'btc', 'eth', 'ethereum', 'solana', 'monad', 'coin', 'token', 'wallet', 'defi', 'crypto', 'blockchain'],
    tech: ['nvidia', 'apple', 'ai', 'google', 'spacex', 'tech', 'gpu', 'robot', 'software', 'chip', 'processor'],
};

function getCategory(topic) {
    const lower = topic.toLowerCase();
    if (CATEGORIES.crypto.some(k => lower.includes(k))) return 'crypto';
    if (CATEGORIES.tech.some(k => lower.includes(k))) return 'tech';
    return 'general';
}

function getRandomTimeframe() {
    const times = ['4 hours', '12 hours', '24 hours'];
    return times[Math.floor(Math.random() * times.length)];
}

export function generateQuestion(topic) {
    const category = getCategory(topic);
    const templates = TEMPLATES[category];

    // Select random template
    const template = templates[Math.floor(Math.random() * templates.length)];

    // Generate Timeframe
    const timeframe = getRandomTimeframe();

    // specific replacements
    let questionText = template
        .replace(/{topic}/g, topic)
        .replace(/{timeframe}/g, timeframe);

    // Final safety check to ensure it's a question
    if (!questionText.endsWith('?')) {
        questionText += '?';
    }

    return {
        topic: topic,
        question: questionText,
        type: "BINARY",
        options: ["YES", "NO"],
        category: category.toUpperCase(),
        timeframe: timeframe,
        timestamp: new Date().toISOString()
    };
}

/**
 * Batch processor
 */
export function generateQuestionsForTrends(trendList) {
    return trendList.map(t => {
        const topic = typeof t === 'string' ? t : (t.topic || t.name);
        return generateQuestion(topic);
    });
}

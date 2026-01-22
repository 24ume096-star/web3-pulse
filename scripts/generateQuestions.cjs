/**
 * Converts trending topics into prediction market questions.
 * 
 * Rules:
 * - YES/NO format
 * - Time-bound (1h - 24h)
 * - Culturally/Contextually relevant
 */

// Price thresholds for popular cryptocurrencies (in USD)
const CRYPTO_PRICE_RANGES = {
    bitcoin: { min: 40000, max: 120000, step: 5000 },
    btc: { min: 40000, max: 120000, step: 5000 },
    ethereum: { min: 2000, max: 6000, step: 200 },
    eth: { min: 2000, max: 6000, step: 200 },
    solana: { min: 100, max: 300, step: 10 },
    sol: { min: 100, max: 300, step: 10 },
    default: { min: 0.01, max: 100, step: 0.1 }
};

const TEMPLATES = {
    crypto: [
        "Will {topic} be above ${price} in the next {timeframe}?",
        "Will {topic} trading volume exceed ${volume}M in the next {timeframe}?",
        "Will {topic} gain more than {percent}% in the next {timeframe}?",
        "Is it finally moon season for {topic}? (above ${price} by {timeframe})",
        "Will {topic} hold the ${price} support line for the next {timeframe}?",
        "Are we early? Will {topic} hit ${price} within {timeframe}?"
    ],
    tech: [
        "Will {topic} stock price exceed ${price} by the end of {timeframe}?",
        "Is {topic} actually the next big thing? (Mainstream by tomorrow?)",
        "Will {topic} reveal a 'one more thing' update in the next {timeframe}?",
        "Will {topic} search interest spike {percent}% in the next {timeframe}?",
        "Is {topic} cooked or just getting started? (Up {percent}% in {timeframe}?)"
    ],
    general: [
        "Will {topic} remain in the top 5 trending topics for the next {timeframe}?",
        "Is {topic} going viral? (1M+ mentions in {timeframe})",
        "Will {topic} be the #1 headline on X (Twitter) within {timeframe}?",
        "Are people fading {topic}? (Sentiment above 60% in {timeframe}?)",
        "Will {topic} break the internet tonight? (Global trend in {timeframe})"
    ]
};

// Simple keyword matching for categorization
const CATEGORIES = {
    crypto: ['bitcoin', 'btc', 'eth', 'ethereum', 'solana', 'sol', 'monad', 'coin', 'token', 'wallet', 'defi', 'crypto', 'blockchain', 'chainlink', 'link', 'matic', 'polygon', 'avax', 'avalanche', 'ada', 'cardano'],
    tech: ['nvidia', 'apple', 'microsoft', 'google', 'meta', 'facebook', 'tesla', 'tsla', 'amazon', 'amd', 'intel', 'ai', 'spacex', 'tech', 'gpu', 'robot', 'software', 'chip', 'processor', 'llm', 'chatgpt'],
};

function getCategory(topic) {
    const lower = topic.toLowerCase();
    if (CATEGORIES.crypto.some(k => lower.includes(k))) return 'crypto';
    if (CATEGORIES.tech.some(k => lower.includes(k))) return 'tech';
    return 'general';
}

function getRandomTimeframe() {
    // Generate timeframe between 1-24 hours
    const hours = Math.floor(Math.random() * 24) + 1;
    return hours === 1 ? '1 hour' : `${hours} hours`;
}

function generateCryptoPrice(topic) {
    const lower = topic.toLowerCase();
    let range = CRYPTO_PRICE_RANGES.default;

    // Find matching crypto
    for (const [key, value] of Object.entries(CRYPTO_PRICE_RANGES)) {
        if (lower.includes(key) && key !== 'default') {
            range = value;
            break;
        }
    }

    // Generate a realistic price threshold
    const steps = Math.floor((range.max - range.min) / range.step);
    const stepIndex = Math.floor(Math.random() * steps);
    const price = range.min + (stepIndex * range.step);

    // Format price nicely
    if (price >= 1000) {
        return Math.round(price / 1000) + 'K';
    } else if (price >= 1) {
        return Math.round(price);
    } else {
        return price.toFixed(2);
    }
}

function generateQuestion(topic) {
    const category = getCategory(topic);
    const templates = TEMPLATES[category];

    // Select random template
    const template = templates[Math.floor(Math.random() * templates.length)];

    // Generate timeframe (1-24 hours)
    const timeframe = getRandomTimeframe();

    // Generate contextual values based on template placeholders
    let questionText = template
        .replace(/{topic}/g, topic)
        .replace(/{timeframe}/g, timeframe);

    // Replace price placeholders for crypto/tech
    if (questionText.includes('{price}')) {
        const price = category === 'crypto'
            ? generateCryptoPrice(topic)
            : (Math.floor(Math.random() * 500) + 50) + '';
        questionText = questionText.replace(/{price}/g, price);
    }

    // Replace volume placeholders (in millions)
    if (questionText.includes('{volume}')) {
        const volume = Math.floor(Math.random() * 900) + 100; // 100-1000M
        questionText = questionText.replace(/{volume}/g, volume);
    }

    // Replace percentage placeholders
    if (questionText.includes('{percent}')) {
        const percent = Math.floor(Math.random() * 30) + 5; // 5-35%
        questionText = questionText.replace(/{percent}/g, percent);
    }

    // Replace count placeholders (in thousands)
    if (questionText.includes('{count}')) {
        const count = Math.floor(Math.random() * 950) + 50; // 50-1000K
        questionText = questionText.replace(/{count}/g, count);
    }

    // Final safety check to ensure it's a question
    if (!questionText.endsWith('?')) {
        questionText += '?';
    }

    // Extract hours from timeframe for structured output
    const hoursMatch = timeframe.match(/(\d+)/);
    const hours = hoursMatch ? parseInt(hoursMatch[1]) : 24;

    return {
        topic: topic,
        question: questionText,
        type: "BINARY",
        options: ["YES", "NO"],
        category: category.toUpperCase(),
        timeframe: timeframe,
        timeframeHours: hours,
        timestamp: new Date().toISOString()
    };
}

/**
 * Batch processor
 */
function generateQuestionsForTrends(trendList) {
    return trendList.map(t => {
        const topic = typeof t === 'string' ? t : (t.topic || t.name);
        return generateQuestion(topic);
    });
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

    console.log("🚀 Generating Prediction Questions from Trending Topics...\n");
    console.log("=".repeat(70) + "\n");

    const questions = generateQuestionsForTrends(sampleTrends);

    questions.forEach((q, index) => {
        console.log(`${index + 1}. Topic: ${q.topic}`);
        console.log(`   Question: ${q.question}`);
        console.log(`   Category: ${q.category} | Timeframe: ${q.timeframe}`);
        console.log();
    });

    console.log("=".repeat(70));
    console.log("\n📋 Structured JSON Output:\n");
    console.log(JSON.stringify(questions, null, 2));

    // Test the example from requirements
    console.log("\n" + "=".repeat(70));
    console.log("\n🧪 Testing Example Input:\n");
    console.log('Input: "Bitcoin"');
    const bitcoinQuestion = generateQuestion("Bitcoin");
    console.log(`Output: "${bitcoinQuestion.question}"\n`);
    console.log(JSON.stringify(bitcoinQuestion, null, 2));
}

module.exports = { generateQuestion, generateQuestionsForTrends };

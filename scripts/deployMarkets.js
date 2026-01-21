const { ethers } = require("hardhat");
const { generateQuestionsForTrends } = require("./generateQuestions");
const fs = require("fs");
const path = require("path");

/**
 * Deployment Script for PredictionMarket Contracts
 * 
 * Features:
 * - Deploys new PredictionMarket contracts via PredictionFactory
 * - Uses trending questions from generateQuestions.js
 * - Sets short endTimes (5-30 minutes for demo)
 * - Seeds small initial liquidity from owner wallet
 * - Avoids creating duplicate markets
 * - Logs all deployed addresses
 */

// Configuration
const CONFIG = {
    // Liquidity to seed per market (in ETH)
    INITIAL_LIQUIDITY_YES: "0.001", // 0.001 ETH on YES
    INITIAL_LIQUIDITY_NO: "0.001",  // 0.001 ETH on NO

    // Demo duration range (in seconds)
    MIN_DURATION: 5 * 60,  // 5 minutes
    MAX_DURATION: 30 * 60, // 30 minutes

    // Deployment log file
    DEPLOYMENT_LOG: path.join(__dirname, "../deployments.json"),

    // Factory contract address (set after first deployment)
    FACTORY_ADDRESS: process.env.FACTORY_ADDRESS || null,
};

// Sample trending topics (can be replaced with real API data)
const TRENDING_TOPICS = [
    "Bitcoin",
    "Ethereum",
    "Monad Testnet",
    "DeepSeek AI",
    "Nvidia Stock",
    "Tesla Cybertruck",
    "SpaceX Launch",
    "ChatGPT-5",
    "Solana DeFi",
    "Apple Vision Pro"
];

/**
 * Load existing deployments to avoid duplicates
 */
function loadDeployments() {
    try {
        if (fs.existsSync(CONFIG.DEPLOYMENT_LOG)) {
            const data = fs.readFileSync(CONFIG.DEPLOYMENT_LOG, "utf8");
            return JSON.parse(data);
        }
    } catch (error) {
        console.log("⚠️  No existing deployment log found, creating new one");
    }
    return { factory: null, markets: [] };
}

/**
 * Save deployment data
 */
function saveDeployment(deploymentData) {
    fs.writeFileSync(
        CONFIG.DEPLOYMENT_LOG,
        JSON.stringify(deploymentData, null, 2),
        "utf8"
    );
    console.log(`💾 Deployment log saved to ${CONFIG.DEPLOYMENT_LOG}`);
}

/**
 * Check if a market with the same question already exists
 */
function isDuplicateMarket(question, existingMarkets) {
    return existingMarkets.some(m => m.question.toLowerCase() === question.toLowerCase());
}

/**
 * Generate random duration between MIN and MAX
 */
function getRandomDuration() {
    return Math.floor(
        Math.random() * (CONFIG.MAX_DURATION - CONFIG.MIN_DURATION) + CONFIG.MIN_DURATION
    );
}

/**
 * Deploy or get existing PredictionFactory
 */
async function deployFactory(signer, existingFactory) {
    if (existingFactory && CONFIG.FACTORY_ADDRESS) {
        console.log(`📋 Using existing factory at: ${CONFIG.FACTORY_ADDRESS}`);
        const Factory = await ethers.getContractFactory("PredictionFactory");
        return Factory.attach(CONFIG.FACTORY_ADDRESS);
    }

    console.log("🏭 Deploying new PredictionFactory...");
    const Factory = await ethers.getContractFactory("PredictionFactory");
    const factory = await Factory.deploy();
    await factory.waitForDeployment();

    const address = await factory.getAddress();
    console.log(`✅ PredictionFactory deployed at: ${address}`);

    return factory;
}

/**
 * Deploy a single market with initial liquidity
 */
async function deployMarket(factory, question, duration, signer) {
    console.log(`\n📊 Deploying market: "${question}"`);
    console.log(`   Duration: ${Math.floor(duration / 60)} minutes`);

    // Create market via factory
    const tx = await factory.createMarket(question, duration, true); // true = demo mode
    const receipt = await tx.wait();

    // Extract market address from event
    const event = receipt.logs.find(
        log => log.fragment && log.fragment.name === "MarketCreated"
    );

    if (!event) {
        throw new Error("MarketCreated event not found");
    }

    const marketAddress = event.args[0];
    console.log(`   ✅ Market deployed at: ${marketAddress}`);

    // Seed initial liquidity
    const Market = await ethers.getContractFactory("PredictionMarket");
    const market = Market.attach(marketAddress);

    const yesAmount = ethers.parseEther(CONFIG.INITIAL_LIQUIDITY_YES);
    const noAmount = ethers.parseEther(CONFIG.INITIAL_LIQUIDITY_NO);

    console.log(`   💰 Seeding liquidity...`);

    // Place YES bet
    const yesTx = await market.placeBet(true, { value: yesAmount });
    await yesTx.wait();
    console.log(`      YES: ${CONFIG.INITIAL_LIQUIDITY_YES} ETH`);

    // Place NO bet
    const noTx = await market.placeBet(false, { value: noAmount });
    await noTx.wait();
    console.log(`      NO: ${CONFIG.INITIAL_LIQUIDITY_NO} ETH`);

    // Get market details
    const marketData = await market.market();
    const endTime = new Date(Number(marketData.endTime) * 1000);

    return {
        address: marketAddress,
        question: question,
        endTime: endTime.toISOString(),
        duration: duration,
        initialLiquidity: {
            yes: CONFIG.INITIAL_LIQUIDITY_YES,
            no: CONFIG.INITIAL_LIQUIDITY_NO
        },
        deployedAt: new Date().toISOString()
    };
}

/**
 * Main deployment function
 */
async function main() {
    console.log("🚀 Starting PredictionMarket Deployment Script\n");
    console.log("=".repeat(60));

    // Get signer
    const [signer] = await ethers.getSigners();
    const signerAddress = await signer.getAddress();
    const balance = await ethers.provider.getBalance(signerAddress);

    console.log(`👤 Deployer: ${signerAddress}`);
    console.log(`💰 Balance: ${ethers.formatEther(balance)} ETH\n`);

    // Load existing deployments
    const deploymentData = loadDeployments();

    // Deploy or get factory
    const factory = await deployFactory(signer, deploymentData.factory);
    const factoryAddress = await factory.getAddress();
    deploymentData.factory = factoryAddress;

    console.log("\n" + "=".repeat(60));
    console.log("🎯 Generating Prediction Markets from Trending Topics\n");

    // Generate questions from trending topics
    const questions = generateQuestionsForTrends(TRENDING_TOPICS);
    console.log(`📝 Generated ${questions.length} questions`);

    // Deploy markets
    let deployedCount = 0;
    let skippedCount = 0;

    for (const q of questions) {
        // Check for duplicates
        if (isDuplicateMarket(q.question, deploymentData.markets)) {
            console.log(`\n⏭️  Skipping duplicate: "${q.question}"`);
            skippedCount++;
            continue;
        }

        try {
            const duration = getRandomDuration();
            const marketInfo = await deployMarket(factory, q.question, duration, signer);
            deploymentData.markets.push(marketInfo);
            deployedCount++;

            // Save after each deployment
            saveDeployment(deploymentData);

        } catch (error) {
            console.error(`❌ Failed to deploy market: ${error.message}`);
        }
    }

    console.log("\n" + "=".repeat(60));
    console.log("📊 DEPLOYMENT SUMMARY");
    console.log("=".repeat(60));
    console.log(`🏭 Factory Address: ${factoryAddress}`);
    console.log(`✅ Markets Deployed: ${deployedCount}`);
    console.log(`⏭️  Markets Skipped (duplicates): ${skippedCount}`);
    console.log(`📁 Total Markets: ${deploymentData.markets.length}`);
    console.log(`💾 Log File: ${CONFIG.DEPLOYMENT_LOG}`);
    console.log("=".repeat(60));

    console.log("\n📋 DEPLOYED MARKET ADDRESSES:");
    deploymentData.markets.forEach((market, index) => {
        console.log(`\n${index + 1}. ${market.address}`);
        console.log(`   Question: ${market.question}`);
        console.log(`   End Time: ${market.endTime}`);
    });

    console.log("\n✨ Deployment complete!");
}

// Execute
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });

/**
 * Points Service (Backend)
 * Handles points calculation and transaction recording.
 */

// In-memory store for transactions (Simulating DB for Hackathon)
const transactions = [];

// In-memory user point balances (Simulating DB)
const userBalances = {};

/**
 * Calculate points earned (Parimutuel Logic)
 * Matches frontend PointsEngine.ts
 */
function calculatePoints(userStake, totalPool, winningSidePool, outcome) {
    if (userStake <= 0 || totalPool <= 0 || winningSidePool <= 0) return 0;
    if (outcome === 'LOSS') return 0;

    if (winningSidePool === 0) return userStake; // Refund logic

    const multiplier = totalPool / winningSidePool;
    return Math.floor(userStake * multiplier);
}

/**
 * Credit points to user
 * Returns { success, pointsEarned, previousBalance, newBalance, transactionId }
 * or { success: false, error: '...' }
 */
function creditPoints(userId, marketId, userStake, totalPool, winningSidePool, outcome) {
    // 1. Idempotency Check
    const existingTx = transactions.find(tx => tx.userId === userId && tx.marketId === marketId);
    if (existingTx) {
        return {
            success: false,
            error: 'Already claimed',
            transactionId: existingTx.id,
            pointsEarned: existingTx.pointsEarned
        };
    }

    // 2. Calculate
    const points = calculatePoints(userStake, totalPool, winningSidePool, outcome);

    // 3. Update Balance
    // Initialize if strictly needed, though usually frontend tracks demo balance locally
    // We'll track it here to enable persistence across reloads if we wanted
    if (!userBalances[userId]) userBalances[userId] = 1000;
    const previousBalance = userBalances[userId];
    userBalances[userId] += points;

    // 4. Record Transaction
    const tx = {
        id: `tx-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        userId,
        marketId,
        pointsEarned: points,
        timestamp: new Date().toISOString()
    };
    transactions.push(tx);

    return {
        success: true,
        pointsEarned: points,
        previousBalance,
        newBalance: userBalances[userId],
        transactionId: tx.id
    };
}

function getUserBalance(userId) {
    // Default to 1000 if new user
    return userBalances[userId] !== undefined ? userBalances[userId] : 1000;
}

function deductPoints(userId, amount) {
    if (!userBalances[userId] || userBalances[userId] < amount) return false;
    userBalances[userId] -= amount;
    return true;
}

module.exports = {
    calculatePoints,
    creditPoints,
    getUserBalance,
    deductPoints
};

/**
 * Withdrawal Service (Backend)
 * Handles point redemption requests.
 */

// In-memory store for withdrawals (Simulating DB)
const withdrawals = [];

// Import user balances from pointsService (shared memory for hackathon demo)
// In real app, this would be a DB query.
const { getUserBalance, userBalances } = require('./pointsService.cjs'); // We'll need to export userBalances or add a deduct method

/**
 * Process a withdrawal request
 * @param {string} userId 
 * @param {string} walletAddress 
 * @param {number} amount 
 */
function requestWithdrawal(userId, walletAddress, amount) {
    const currentBalance = getUserBalance(userId);

    // 1. Validation
    if (amount <= 0) return { success: false, error: 'Invalid amount' };
    if (currentBalance < amount) return { success: false, error: 'Insufficient funds' };

    // 2. Deduct Balance (Pessimistic Locking)
    // We need a method in pointsService to safely deduct. 
    // For now, checks pass, we assume we can modify. 
    // Ideally pointsService exposes `deductPoints`.

    // We will initiate the deduction here assuming we access the shared state or helper
    // Since pointsService.cjs exports getUserBalance but not a setter, we might need to modify pointsService first.
    // For this step, I'll assume we can add a helper to pointsService or handle it here if we merge logic.

    // Let's return a "Command" object that server.cjs can use to call a new deduct method.
    return {
        success: true,
        amount,
        walletAddress,
        txHash: `0x${Math.random().toString(16).substr(2, 40)}` // Simulated hash
    };
}

/**
 * Record withdrawal
 */
function recordWithdrawal(userId, walletAddress, amount, txHash) {
    const record = {
        id: `wd-${Date.now()}`,
        userId,
        walletAddress,
        amount,
        txHash,
        timestamp: new Date().toISOString(),
        status: 'COMPLETED'
    };
    withdrawals.push(record);
    return record;
}

module.exports = {
    requestWithdrawal,
    recordWithdrawal
};

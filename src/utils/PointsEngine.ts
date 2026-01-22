/**
 * PointsEngine Module
 * Calculates points earned based on user stake, pool distribution, and outcome.
 * 
 * Rules:
 * - If user loses -> Returns 0
 * - If user wins -> Returns stake * (totalPool / winningSidePool)
 * - Helper: keeps logic simple and explainable
 */

export const calculatePointsEarned = (
    userStake: number,
    totalPool: number,
    winningSidePool: number,
    outcome: 'WIN' | 'LOSS'
): number => {
    // Rule 1: excessive protection against invalid inputs
    if (userStake <= 0 || totalPool <= 0 || winningSidePool <= 0) {
        return 0;
    }

    // Rule 2: If user loses, they get nothing
    if (outcome === 'LOSS') {
        return 0;
    }

    // Rule 3: Calculate Parimutuel Multiplier
    // Multiplier = Total Liquidity / Winning Side Liquidity
    // Example: Total=1000, Yes=200. Multiplier = 5x.
    // If you bet 10 on Yes, you own 10/210 of the pool? 
    // Simplified model for pre-calculation:
    // We assume the pools GIVEN include the user's potential bet if we are simulating?
    // Or if these are current pools, we add the user's stake to both for accurate estimation.

    // For this engine, we will take the raw numbers provided. 
    // If the integration passes "current pools", we should handle the "added liquidity" logic here or expect it pre-calculated.
    // To keep it simple as requested: Return stake * multiplier.

    // Safety check for divide by zero
    if (winningSidePool === 0) return userStake; // Refund if no one else bet? Or 1x.

    const multiplier = totalPool / winningSidePool;
    const pointsEarned = userStake * multiplier;

    return Math.floor(pointsEarned);
};

export const estimatePotentialWin = (
    betAmount: number,
    currentWinningSidePool: number,
    currentOppositeSidePool: number
): number => {
    const newWinningSidePool = currentWinningSidePool + betAmount;
    const newTotalPool = currentWinningSidePool + currentOppositeSidePool + betAmount;

    if (newWinningSidePool === 0) return 0;

    return calculatePointsEarned(betAmount, newTotalPool, newWinningSidePool, 'WIN');
};

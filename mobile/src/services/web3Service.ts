import { ethers } from 'ethers';

// ABIs
export const FACTORY_ABI = [
    "function getAllMarkets() external view returns (address[])",
    "function getMarketCount() external view returns (uint256)",
    "function createMarket(string memory _question, uint256 _duration, bool _isDemo) external",
    "event MarketCreated(address indexed marketAddress, string question, uint256 endTime, bool isDemo)"
];

export const MARKET_ABI = [
    "function market() external view returns (string question, uint256 endTime, uint256 totalYesPool, uint256 totalNoPool, bool resolved, bool outcome)",
    "function isDemoMode() external view returns (bool)",
    "function isResolvable() external view returns (bool)",
    "function autoResolve() external",
    "function placeBet(bool _isYes) external payable",
    "function resolveMarket(bool _outcome) external",
    "function claimWinnings() external",
    "function getPools() external view returns (uint256 yesPool, uint256 noPool)",
    "function bets(address) external view returns (uint256 yesAmount, uint256 noAmount, bool claimed)",
    "event BetPlaced(address indexed user, bool outcome, uint256 amount)",
    "event MarketResolved(bool outcome)",
    "event WinningsClaimed(address indexed user, uint256 amount)"
];

export const FACTORY_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3'; // Default Hardhat local address

export interface MarketDetails {
    address: string;
    question: string;
    endTime: number;
    totalYesPool: bigint;
    totalNoPool: bigint;
    resolved: boolean;
    outcome: boolean;
    isDemoMode: boolean;
}

export const getMarkets = async (provider: ethers.Provider): Promise<string[]> => {
    const factory = new ethers.Contract(FACTORY_ADDRESS, FACTORY_ABI, provider);
    return await factory.getAllMarkets();
};

export const getMarketDetails = async (marketAddress: string, provider: ethers.Provider): Promise<MarketDetails> => {
    const market = new ethers.Contract(marketAddress, MARKET_ABI, provider);
    const [data, isDemo] = await Promise.all([
        market.market(),
        market.isDemoMode().catch(() => false) // Fallback if old contract
    ]);

    return {
        address: marketAddress,
        question: data.question,
        endTime: Number(data.endTime),
        totalYesPool: data.totalYesPool,
        totalNoPool: data.totalNoPool,
        resolved: data.resolved,
        outcome: data.outcome,
        isDemoMode: isDemo,
    };
};

export const placeBet = async (
    marketAddress: string,
    signer: ethers.Signer,
    isYes: boolean,
    amount: string
) => {
    const market = new ethers.Contract(marketAddress, MARKET_ABI, signer);
    const tx = await market.placeBet(isYes, {
        value: ethers.parseEther(amount)
    });
    return await tx.wait();
};

export const resolveMarket = async (
    marketAddress: string,
    signer: ethers.Signer,
    outcome: boolean
) => {
    const market = new ethers.Contract(marketAddress, MARKET_ABI, signer);
    const tx = await market.resolveMarket(outcome);
    return await tx.wait();
};

export const claimWinnings = async (
    marketAddress: string,
    signer: ethers.Signer
) => {
    const market = new ethers.Contract(marketAddress, MARKET_ABI, signer);
    const tx = await market.claimWinnings();
    return await tx.wait();
};

export const getUserBet = async (
    marketAddress: string,
    userAddress: string,
    provider: ethers.Provider
) => {
    const market = new ethers.Contract(marketAddress, MARKET_ABI, provider);
    const bet = await market.bets(userAddress);
    return {
        yesAmount: bet.yesAmount,
        noAmount: bet.noAmount,
        claimed: bet.claimed
    };
};

export const createMarket = async (
    signer: ethers.Signer,
    question: string,
    duration: number,
    isDemo: boolean
) => {
    const factory = new ethers.Contract(FACTORY_ADDRESS, FACTORY_ABI, signer);
    const tx = await factory.createMarket(question, duration, isDemo);
    return await tx.wait();
};

export const autoResolve = async (
    marketAddress: string,
    signer: ethers.Signer
) => {
    const market = new ethers.Contract(marketAddress, MARKET_ABI, signer);
    const tx = await market.autoResolve();
    return await tx.wait();
};

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title PredictionMarket
 * @dev A simple prediction market contract for hackathons.
 * Users can bet on YES or NO outcomes using native ETH.
 * Winners can claim their proportional share of the losing pool.
 */
contract PredictionMarket {
    struct Bet {
        uint256 yesAmount;
        uint256 noAmount;
        bool claimed;
    }

    struct Market {
        string question;
        uint256 endTime;
        uint256 totalYesPool;
        uint256 totalNoPool;
        bool resolved;
        bool outcome; // true = YES, false = NO
    }

    address public owner;
    Market public market;
    bool public isDemoMode; // Flag for hackathon demo speed
    mapping(address => Bet) public bets;

    event BetPlaced(address indexed user, bool outcome, uint256 amount);
    event MarketResolved(bool outcome);
    event WinningsClaimed(address indexed user, uint256 amount);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call");
        _;
    }

    modifier marketActive() {
        require(!market.resolved, "Market already resolved");
        require(block.timestamp < market.endTime, "Market betting ended");
        _;
    }

    constructor(string memory _question, uint256 _duration, bool _isDemo) {
        owner = msg.sender;
        market.question = _question;
        market.endTime = block.timestamp + _duration;
        isDemoMode = _isDemo;
    }

    /**
     * @dev Resolution delay. Standard: 5 mins. Demo: 0 mins (instant after endTime).
     */
    function getResolutionDelay() public view returns (uint256) {
        return isDemoMode ? 0 : 5 minutes;
    }

    /**
     * @dev Place a bet on YES (true) or NO (false).
     */
    function placeBet(bool _isYes) external payable marketActive {
        require(msg.value > 0, "Bet amount must be > 0");

        if (_isYes) {
            bets[msg.sender].yesAmount += msg.value;
            market.totalYesPool += msg.value;
        } else {
            bets[msg.sender].noAmount += msg.value;
            market.totalNoPool += msg.value;
        }

        emit BetPlaced(msg.sender, _isYes, msg.value);
    }

    /**
     * @dev Checks if the market is currently resolvable.
     * Requirements:
     * 1. Market not already resolved.
     * 2. Current time >= endTime + delay.
     */
    function isResolvable() public view returns (bool) {
        return (!market.resolved && block.timestamp >= (market.endTime + getResolutionDelay()));
    }

    /**
     * @dev AUTO-RESOLUTION (DEMO ONLY)
     * Anyone can trigger this if isDemoMode is true and endTime has passed.
     * Uses block properties to generate a pseudo-random outcome.
     */
    function autoResolve() external {
        require(isDemoMode, "Auto-resolve only in demo mode");
        require(isResolvable(), "Betting period still active");
        
        // Pseudo-random outcome (demo purposes only!)
        bool _outcome = uint256(keccak256(abi.encodePacked(block.timestamp, block.prevrandao))) % 2 == 0;
        
        market.resolved = true;
        market.outcome = _outcome;

        emit MarketResolved(_outcome);
    }

    /**
     * @dev Resolve the market outcome manually. Only callable by owner.
     */
    function resolveMarket(bool _outcome) external onlyOwner {
        require(isResolvable(), "Resolution conditions not met (check delay)");

        market.resolved = true;
        market.outcome = _outcome;

        emit MarketResolved(_outcome);
    }

    /**
     * @dev Claim winnings proportional to the user's bet in the winning pool.
     */
    function claimWinnings() external {
        require(market.resolved, "Market not resolved");
        Bet storage userBet = bets[msg.sender];
        require(!userBet.claimed, "Already claimed");

        uint256 reward = 0;
        if (market.outcome) {
            // YES won
            require(userBet.yesAmount > 0, "No winning bet");
            // Reward = userShare * totalPool / totalWinningPool
            // Simplified: reward = userBet + (userBet * losingPool / winningPool)
            reward = (userBet.yesAmount * (market.totalYesPool + market.totalNoPool)) / market.totalYesPool;
        } else {
            // NO won
            require(userBet.noAmount > 0, "No winning bet");
            reward = (userBet.noAmount * (market.totalYesPool + market.totalNoPool)) / market.totalNoPool;
        }

        userBet.claimed = true;
        (bool success, ) = payable(msg.sender).call{value: reward}("");
        require(success, "Transfer failed");

        emit WinningsClaimed(msg.sender, reward);
    }

    /**
     * @dev View total pools helper.
     */
    function getPools() external view returns (uint256 yesPool, uint256 noPool) {
        return (market.totalYesPool, market.totalNoPool);
    }
}

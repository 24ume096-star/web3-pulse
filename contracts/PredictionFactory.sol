// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./PredictionMarket.sol";

/**
 * @title PredictionFactory
 * @dev Factory contract to deploy multiple PredictionMarket instances.
 */
contract PredictionFactory {
    address public owner;
    address[] public allMarkets;

    event MarketCreated(address indexed marketAddress, string question, uint256 endTime, bool isDemo);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    /**
     * @dev Deploys a new PredictionMarket contract.
     * @param _question The question for the prediction market.
     * @param _duration The duration of the market from now in seconds.
     * @param _isDemo Whether this is a fast-resolving demo market.
     */
    function createMarket(string memory _question, uint256 _duration, bool _isDemo) external onlyOwner {
        PredictionMarket newMarket = new PredictionMarket(_question, _duration, _isDemo);
        allMarkets.push(address(newMarket));
        
        emit MarketCreated(address(newMarket), _question, block.timestamp + _duration, _isDemo);
    }

    /**
     * @dev Returns all deployed market addresses.
     */
    function getAllMarkets() external view returns (address[] memory) {
        return allMarkets;
    }

    /**
     * @dev Returns the count of deployed markets.
     */
    function getMarketCount() external view returns (uint256) {
        return allMarkets.length;
    }
}

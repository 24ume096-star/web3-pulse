// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Treasury {
    address public owner;

    event Withdrawal(address indexed user, uint256 amount);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    // Function to receive native ETH/MON
    receive() external payable {}
    fallback() external payable {}

    function withdrawTo(address payable user, uint256 amount) external onlyOwner {
        require(address(this).balance >= amount, "Insufficient funds");
        (bool sent, ) = user.call{value: amount}("");
        require(sent, "Failed to send Ether");
        emit Withdrawal(user, amount);
    }
}

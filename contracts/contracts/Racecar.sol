// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Racecar is Ownable, Pausable, ReentrancyGuard {
    mapping(address => uint) public balanceOf;
    mapping(address => bool) public hasClaimed;

    constructor() Ownable(msg.sender) {}

    function whitelist(
        address[] calldata _account,
        uint[] calldata _quantity
    ) external onlyOwner {
        require(_account.length == _quantity.length, "Invalid array.");
        for (uint i = 0; i < _account.length; i++) {
            balanceOf[_account[i]] = _quantity[i];
        }
    }

    function mint(uint amount) external whenNotPaused nonReentrant {
        // require(balanceOf[msg.sender] >= amount, "Nothing to mint.");
        require(!hasClaimed[msg.sender], "Already claimed");

        // balanceOf[msg.sender] -= amount;

        hasClaimed[msg.sender] = true;
        (bool sent,) = payable(msg.sender).call{value: amount}("");
        require(sent, "Failed to send Ether");
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    function withdraw() public onlyOwner {
        (bool sent,) = payable(msg.sender).call{value: address(this).balance}("");
        require(sent, "Failed to send Ether");

    }

    receive() external payable {}

}

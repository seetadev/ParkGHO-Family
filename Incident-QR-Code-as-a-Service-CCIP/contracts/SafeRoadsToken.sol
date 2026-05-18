// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title SafeRoads Token (SRT) — ERC-20 reward token for citizen incident reporters
contract SafeRoadsToken is ERC20, ERC20Burnable, ERC20Permit, Ownable {
    uint256 public constant MAX_SUPPLY = 100_000_000 * 10 ** 18; // 100M SRT

    constructor()
        ERC20("SafeRoads Token", "SRT")
        ERC20Permit("SafeRoads Token")
        Ownable(msg.sender)
    {
        // Mint 10M to deployer; remainder reserved for IncidentManager rewards
        _mint(msg.sender, 10_000_000 * 10 ** 18);
    }

    function mint(address to, uint256 amount) external onlyOwner {
        require(totalSupply() + amount <= MAX_SUPPLY, "Exceeds max supply");
        _mint(to, amount);
    }
}

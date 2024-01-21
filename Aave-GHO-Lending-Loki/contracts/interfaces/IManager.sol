// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IManager {
    function getAddress (uint256 _key) external view returns (address);
}
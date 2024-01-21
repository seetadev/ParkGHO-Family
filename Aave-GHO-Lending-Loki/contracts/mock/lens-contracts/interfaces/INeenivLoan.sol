// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface INeenivLoan {
        function hasCollected (uint8 v, bytes32 r, bytes32 s) external;
}
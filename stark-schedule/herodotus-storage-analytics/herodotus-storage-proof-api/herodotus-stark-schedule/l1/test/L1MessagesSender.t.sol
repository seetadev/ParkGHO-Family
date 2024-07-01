// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "forge-std/Test.sol";

import {L1MessagesSender} from "../src/L1MessagesSender.sol";
import {IStarknetCore} from "../src/interfaces/IStarknetCore.sol";

contract L1MessagesSenderTest is Test {
    L1MessagesSender public sender;

    function setUp() public {
        vm.createSelectFork(vm.rpcUrl("goerli"));

        sender = new L1MessagesSender(
            IStarknetCore(0xde29d060D45901Fb19ED6C6e959EB22d8626708e),
            0x07bf6b32382276bFF5341f810A6811233A9591228642F60160129629448a21b6,
            0xB8Cb7707b5160eaE8931e0cf02B563a5CeA75F09
        );
    }

    function testSendExactParentHashToL2() public {
        uint256 prevBlock = block.number - 1;

        // Value must be greater than 0
        sender.sendExactParentHashToL2{value: 1}(prevBlock);
    }

    function testSendLatestParentHashToL2() public {
        // Value must be greater than 0
        sender.sendLatestParentHashToL2{value: 1}();
    }

    function testSendPoseidonMMRTreeToL2() public {
        // This aggregator id must exist in the factory
        uint256 aggregatorId = 1;

        // Value must be greater than 0
        sender.sendPoseidonMMRTreeToL2{value: 1}(aggregatorId);
    }
}

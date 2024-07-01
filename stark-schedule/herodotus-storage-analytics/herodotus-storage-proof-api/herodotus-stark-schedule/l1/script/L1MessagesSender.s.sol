// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "forge-std/Script.sol";
import "forge-std/console.sol";

import {L1MessagesSender} from "../src/L1MessagesSender.sol";
import {IStarknetCore} from "../src/interfaces/IStarknetCore.sol";

contract L1MessagesSenderDeployer is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        L1MessagesSender l1MessagesSender = new L1MessagesSender(
            IStarknetCore(vm.envAddress("STARKNET_CORE_ADDRESS")),
            vm.envUint("L2_RECIPIENT_ADDRESS"),
            vm.envAddress("AGGREGATORS_FACTORY_ADDRESS")
        );

        console.log("L1MessagesSender address: %s", address(l1MessagesSender));

        vm.stopBroadcast();
    }
}

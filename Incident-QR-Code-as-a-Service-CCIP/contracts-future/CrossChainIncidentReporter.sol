// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IRouterClient} from "@chainlink/contracts-ccip/src/v0.8/ccip/interfaces/IRouterClient.sol";
import {Client} from "@chainlink/contracts-ccip/src/v0.8/ccip/libraries/Client.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/// @title CrossChainIncidentReporter — sends incident data cross-chain via Chainlink CCIP
contract CrossChainIncidentReporter is Ownable {
    IRouterClient private immutable router;
    IERC20 private immutable linkToken;

    // Chainlink CCIP chain selectors
    uint64 public constant POLYGON_AMOY_SELECTOR = 16281711391670634445;
    uint64 public constant FILECOIN_CALIBRATION_SELECTOR = 2109123250; // placeholder

    event MessageSent(bytes32 indexed messageId, uint64 destinationChain, address recipient, bytes data);

    constructor(address _router, address _link) Ownable(msg.sender) {
        router = IRouterClient(_router);
        linkToken = IERC20(_link);
    }

    /// @notice Encode and send incident data to a destination chain
    /// @param destinationChainSelector  Chainlink CCIP chain selector of target chain
    /// @param receiverContract          IncidentManager address on destination chain
    /// @param incidentData              ABI-encoded incident payload
    function sendIncidentCrossChain(
        uint64 destinationChainSelector,
        address receiverContract,
        bytes calldata incidentData
    ) external returns (bytes32 messageId) {
        Client.EVM2AnyMessage memory message = Client.EVM2AnyMessage({
            receiver: abi.encode(receiverContract),
            data: incidentData,
            tokenAmounts: new Client.EVMTokenAmount[](0),
            extraArgs: Client._argsToBytes(Client.EVMExtraArgsV1({gasLimit: 200_000})),
            feeToken: address(linkToken)
        });

        uint256 fee = router.getFee(destinationChainSelector, message);
        require(linkToken.balanceOf(address(this)) >= fee, "Insufficient LINK for fee");
        linkToken.approve(address(router), fee);

        messageId = router.ccipSend(destinationChainSelector, message);
        emit MessageSent(messageId, destinationChainSelector, receiverContract, incidentData);
    }

    /// @notice Fund this contract with LINK for CCIP fees
    function fundWithLink(uint256 amount) external {
        linkToken.transferFrom(msg.sender, address(this), amount);
    }

    function withdrawLink() external onlyOwner {
        uint256 bal = linkToken.balanceOf(address(this));
        linkToken.transfer(owner(), bal);
    }
}

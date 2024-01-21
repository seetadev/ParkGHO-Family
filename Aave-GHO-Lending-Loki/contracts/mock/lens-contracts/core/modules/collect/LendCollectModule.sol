// SPDX-License-Identifier: MIT

pragma solidity ^0.8.10;

import {ICollectModule} from '../../../interfaces/ICollectModule.sol';
import {ModuleBase} from '../ModuleBase.sol';
import {FollowValidationModuleBase} from '../FollowValidationModuleBase.sol';
import {INeenivLoan} from '../../../interfaces/INeenivLoan.sol';

/**
 * @title LendCollectModule
 * @author Lens Protocol
 *
 * @notice This is a simple Lens CollectModule implementation, inheriting from the ICollectModule interface.
 *
 * This module works by allowing all collects.
 */
contract LendCollectModule is FollowValidationModuleBase, ICollectModule {
    constructor(address hub) ModuleBase(hub) {}

    mapping(uint256 => mapping(uint256 => bool)) internal _followerOnlyByPublicationByProfile;

    INeenivLoan public neenivLoan;

    /**
     * @dev In data we pass the address of the neeniv protocol loan contract
     */
    function initializePublicationCollectModule(
        uint256 profileId,
        uint256 pubId,
        bytes calldata data
    ) external override onlyHub returns (bytes memory) {
        bool followerOnly = abi.decode(data, (bool));
        if (followerOnly) _followerOnlyByPublicationByProfile[profileId][pubId] = true;
        return data;
    }

    /**
     * @dev Processes a lend collect by:
     *  1. Ensuring the collector is a follower, if needed and call the function on the neeniv protocol hascollected
     * here we need the implementation by lenster on the frontend. We need that the click on collect call this function and pass in data
     * v,r,s and the neenivLoan address of the contract
     */
    function processCollect(
        uint256 referrerProfileId,
        address collector,
        uint256 profileId,
        uint256 pubId,
        bytes calldata data
    ) external override {
        if (_followerOnlyByPublicationByProfile[profileId][pubId])
            _checkFollowValidity(profileId, collector);
        (uint8 v, bytes32 r, bytes32 s, address _neenivLoan) = abi.decode(data, (uint8, bytes32, bytes32, address));
        neenivLoan = INeenivLoan(_neenivLoan);
        neenivLoan.hasCollected(v,r,s);
    }
}

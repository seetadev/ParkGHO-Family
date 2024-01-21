// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {DataTypes} from '../libraries/DataTypes.sol';

interface ILensHub {
    /**
     * @notice Publishes a post to a given profile via signature with the specified parameters.
     *
     * @param vars A PostWithSigData struct containing the regular parameters and an EIP712Signature struct.
     *
     * @return uint256 An integer representing the post's publication ID.
     */
    function postWithSig(DataTypes.PostWithSigData calldata vars) external returns (uint256);

}
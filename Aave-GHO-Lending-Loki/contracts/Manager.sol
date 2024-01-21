// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// Import this file to use console.log
import "hardhat/console.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";


contract Manager is Ownable{
    
    //mapping user - credit scores
    mapping (address => uint256) public scorings;
    //list of addressess of protocol smart contracts
    // 1 => lensHub
    // 2 => aavePool
    // 3 => aaveDebtToken
    // 4 => superfluid
    // 5 => superfluidSuperToken
    // 6 => WETH
    // 7 => DAI
    mapping (uint256 => address) private addresses;


    constructor(address _lensHub, address _aavePool, address _aaveDebtToken, address _superfluid, address _superfluidSuperToken, address _weth, address _dai){
        addresses[1] = _lensHub;
        addresses[2] = _aavePool;
        addresses[3] = _aaveDebtToken;
        addresses[4] = _superfluid;
        addresses[5] = _superfluidSuperToken;
        addresses[6] = _weth;
        addresses[7] = _dai;
    }

    /**
     * @dev set the address of a contract
     * @param _key key of the address in the mapping
     * @param _contract address of the contract we need
     **/
    function setAddress(uint256 _key, address _contract) public onlyOwner {
        addresses[_key] = _contract;
    }

    /**
     * @dev set the score of a borrower
     * @param _user address of the user
     * @param _score score of the user
     **/
    function setScore (address _user, uint256 _score) onlyOwner public {
        require(_score<=10 && _score > 0, "The score is not betweeen 0 and 10");
        scorings[_user] = _score;
    }

     /**
     * @dev get the address of a contract
     * @param _key key in the mapping of the contract
     **/
    function getAddress (uint256 _key) public view returns (address){
        return addresses[_key];
    }
    
    /**
     * @dev compute the interest of a loan, not annualized
     * @param _amount amount of the loan
     * @param _expDate expiration date of the loan in milliseconds
     **/
    function computeInterest (uint256 _amount, uint256 _expDate) public view returns (uint256){
        require(_expDate > block.timestamp);
        
        //TODO compute interest
        uint256 interest= scorings[msg.sender] + (_amount%scorings[msg.sender]);
        //--
        
        return interest;
    }

   

}
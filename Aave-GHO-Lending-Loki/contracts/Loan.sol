// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { IERC20, SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import { ILensHub } from "./interfaces/ILensHub.sol";
import { DataTypes } from "./libraries/DataTypes.sol";
import { IAavePool } from "./interfaces/IAavePool.sol";
import { IAaveDebtToken } from "./interfaces/IAaveDebtToken.sol";
import { ISuperfluid } from "@superfluid-finance/ethereum-contracts/contracts/interfaces/superfluid/ISuperfluid.sol"; //"@superfluid-finance/ethereum-monorepo/packages/ethereum-contracts/contracts/interfaces/superfluid/ISuperfluid.sol";
import { ISuperfluidToken } from "@superfluid-finance/ethereum-contracts/contracts/interfaces/superfluid/ISuperfluidToken.sol";
import { ISuperToken } from "@superfluid-finance/ethereum-contracts/contracts/interfaces/superfluid/ISuperToken.sol";
import { IConstantFlowAgreementV1 } from "@superfluid-finance/ethereum-contracts/contracts/interfaces/agreements/IConstantFlowAgreementV1.sol";
import { CFAv1Library } from "@superfluid-finance/ethereum-contracts/contracts/apps/CFAv1Library.sol";

import { IManager } from "./interfaces/IManager.sol";

 
contract Loan is Ownable{

    uint256 public interest;
    uint256 public amount;
    uint256 public trancheSize;
    uint256 public expDate;
    int96 public flowRate;
    address public borrower;

    mapping (address => uint256) lenders;
    uint256 amountRaised;

    //set manager
    IManager private manager;
    //set lenster interface
    ILensHub private lensHub;
    //set aave interface
    IAavePool private aavePool;
    IAaveDebtToken private aaveDebtToken;
    //set superfluid interface
    ISuperfluid private host;
    ISuperToken private superTokenDai;
    using CFAv1Library for CFAv1Library.InitData;
    CFAv1Library.InitData public cfaV1;
    //set tokens
    using SafeERC20 for IERC20;
    IERC20 private weth; //weth ltv aave is 80%
    IERC20 private dai;

    /**
     * @dev create the loan a post on lens the announce for raise capital with the collect button
     * @param _interest interest of the loan 
     * @param _amount total amount of the loan to raise
     * @param _trancheSize the fixed investment tranche for a lender
     * @param _expDate expiration date of the loan 
     * @param _flowRate the flow rate per millisecond on superfluid on the stream of the interest from t0 to exp date
     * @param _manager address of the manager contract of neeniv protocol
     * @param postData data, with ecsda, to post on behalf of another account on lenster
     **/
    constructor (uint256 _interest, uint256 _amount, uint256 _trancheSize, uint256 _expDate, int96 _flowRate, address _manager, DataTypes.PostWithSigData memory postData){
        //set the loan variables
        interest = _interest;
        amount = _amount;
        trancheSize = _trancheSize;
        expDate = _expDate;
        flowRate = _flowRate;
        borrower = msg.sender;
        amountRaised=0;

        //set interfaces addresses
        manager = IManager(_manager);
        //lens
        lensHub = ILensHub(manager.getAddress(1));
        //aave
        aavePool = IAavePool(manager.getAddress(2));
        aaveDebtToken = IAaveDebtToken(manager.getAddress(3));
        //superfluid
        host = ISuperfluid(manager.getAddress(4));
        superTokenDai = ISuperToken(manager.getAddress(5));
        cfaV1 = CFAv1Library.InitData(
            host,
            IConstantFlowAgreementV1(
                address(
                    host.getAgreementClass(
                        keccak256("org.superfluid-finance.agreements.ConstantFlowAgreement.v1")
                    )
                )
            )
        );
        
        //erc20 tokens
        weth=IERC20(manager.getAddress(6));
        dai=IERC20(manager.getAddress(7));
        
        //post on lens the post with the data we need
        lensHub.postWithSig(postData);
        
    }

     /**
     * @dev called when a lender collect the post on lenster
     * @param v ecsda
     * @param r ecsda
     * @param s ecsda
     **/
    function hasCollected (uint8 v, bytes32 r, bytes32 s) public {
        //aave supply with permit
        aavePool.supplyWithPermit(address(weth), trancheSize, msg.sender, 0, block.timestamp + 1 days, v, r, s);
        //aave create delegation with permit on behalf of this contract
        aaveDebtToken.delegationWithSig(msg.sender, address(this), trancheSize, block.timestamp + 1 days, v, r, s);
        //this smart contract borrow from aave with the credit delegation
        //division is not so god // ltv of weth is 80% on aave
        uint256 amountToBorrow = (((trancheSize*80)/100))-1;
        aavePool.borrow(address(dai), amountToBorrow , 1, 0, address(this));
        //superfluid: streaming of the interests
        uint256 interestStream = (amountToBorrow/100)*interest;
        dai.safeApprove(address(superTokenDai), interestStream);
        superTokenDai.upgrade(interestStream);
        host.callAgreement(
            cfaV1.cfa,
            abi.encodeWithSelector(
                cfaV1.cfa.createFlow.selector,
                superTokenDai,
                borrower,
                flowRate,
                new bytes(0) // placeholder - always pass in bytes(0)
            ),
            "0x" //userData
        );
        //money that goes immediately to the borrower
        dai.safeTransfer(borrower, amountToBorrow - interestStream);
        //update contract data
        amountRaised += amountToBorrow;
        lenders[msg.sender] = amountToBorrow;
    }

    /**
     * @dev paying function for the borrower, called when at exp date he/she has to pay the principal (the interest is already streammed on superfluid)
     * @param _amountPrincipal the amount of the repayment
     **/
    function payPrincipal (uint256 _amountPrincipal) public {
        require (_amountPrincipal == amountRaised , "The amount of the repayment is wrong");
        dai.safeTransferFrom(msg.sender, address(this), _amountPrincipal);       
    }

    /**
     * @dev function called after the payPrincipal, it is called in a for loop by our frontend, with one call for each lender
     * @dev nb. in this function is repayed only the part of the tranche that has gone to the borrower, not the part deposited on aave
     * @dev the part deposited on aave is withdrawn after the repayment of the borrowed amount, done on frontend directly in the for loop mentined above
     * @param _lender the lender that has to be repayed
     **/
    function payLender (address _lender) public onlyOwner{
        require(lenders[_lender] > 0, "This address is not a lender");
        dai.transfer(_lender, lenders[_lender]);
        lenders[_lender] = 0;
    }


   
   

}
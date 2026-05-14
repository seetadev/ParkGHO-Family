// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract ATOSToken is ERC20, ERC20Burnable, ERC20Pausable, ERC20Permit, ERC20Votes, AccessControl, ReentrancyGuard {

    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant BURNER_ROLE = keccak256("BURNER_ROLE");

    uint256 public constant MAX_SUPPLY     = 1_000_000_000 * 10 ** 18;
    uint256 public constant INITIAL_SUPPLY =   100_000_000 * 10 ** 18;

    string public metadataCID;

    event MetadataCIDUpdated(string oldCID, string newCID);
    event TreasuryBurn(address indexed burner, address indexed from, uint256 amount);

    constructor(address initialAdmin, address initialMinter, string memory _metadataCID)
        ERC20("ATOS Token", "ATOS")
        ERC20Permit("ATOS Token")
    {
        require(initialAdmin  != address(0), "ATOSToken: admin is zero address");
        require(initialMinter != address(0), "ATOSToken: minter is zero address");

        _grantRole(DEFAULT_ADMIN_ROLE, initialAdmin);
        _grantRole(MINTER_ROLE,        initialMinter);
        _grantRole(PAUSER_ROLE,        initialAdmin);
        _grantRole(BURNER_ROLE,        initialAdmin);

        metadataCID = _metadataCID;
        _mint(initialAdmin, INITIAL_SUPPLY);
    }

    function mint(address to, uint256 amount) external onlyRole(MINTER_ROLE) nonReentrant {
        require(to != address(0), "ATOSToken: mint to zero address");
        require(totalSupply() + amount <= MAX_SUPPLY, "ATOSToken: exceeds max supply");
        _mint(to, amount);
    }

    function pause()   external onlyRole(PAUSER_ROLE) { _pause(); }
    function unpause() external onlyRole(PAUSER_ROLE) { _unpause(); }

    function burnFrom(address from, uint256 amount) public override nonReentrant {
        if (hasRole(BURNER_ROLE, msg.sender)) {
            _burn(from, amount);
            emit TreasuryBurn(msg.sender, from, amount);
        } else {
            super.burnFrom(from, amount);
        }
    }

    function setMetadataCID(string calldata newCID) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(bytes(newCID).length > 0, "ATOSToken: empty CID");
        emit MetadataCIDUpdated(metadataCID, newCID);
        metadataCID = newCID;
    }

    function remainingMintableSupply() external view returns (uint256) {
        return MAX_SUPPLY - totalSupply();
    }

    function _update(address from, address to, uint256 value)
        internal override(ERC20, ERC20Pausable, ERC20Votes) {
        super._update(from, to, value);
    }

    function nonces(address owner)
        public view override(ERC20Permit, Nonces) returns (uint256) {
        return super.nonces(owner);
    }
}

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/// @title IncidentManager — on-chain road incident registry with SRT token rewards
contract IncidentManager is Ownable, ReentrancyGuard {
    struct Incident {
        uint256 id;
        address reporter;
        string incidentType;   // "pothole", "accident", "parking_violation", etc.
        string ipfsCID;        // IPFS CID of the JSON report (uploaded via web3.storage)
        string location;       // "lat,lng" string
        uint256 timestamp;
        bool verified;
        bool rewardClaimed;
        uint8 severity;        // 1 = Low, 2 = Medium, 3 = High
    }

    IERC20 public rewardToken;
    uint256 public rewardAmount = 10 * 10 ** 18; // base: 10 SRT per report
    uint256 public incidentCount;

    mapping(uint256 => Incident) public incidents;
    mapping(address => uint256[]) public userIncidents;
    mapping(address => uint256) public userRewardBalance;

    event IncidentReported(uint256 indexed id, address indexed reporter, string incidentType, string ipfsCID);
    event IncidentVerified(uint256 indexed id, address verifier);
    event RewardClaimed(address indexed user, uint256 amount);

    constructor(address _rewardToken) Ownable(msg.sender) {
        rewardToken = IERC20(_rewardToken);
    }

    function reportIncident(
        string calldata _type,
        string calldata _ipfsCID,
        string calldata _location,
        uint8 _severity
    ) external returns (uint256) {
        require(_severity >= 1 && _severity <= 3, "Severity must be 1-3");

        incidentCount++;
        uint256 id = incidentCount;

        incidents[id] = Incident({
            id: id,
            reporter: msg.sender,
            incidentType: _type,
            ipfsCID: _ipfsCID,
            location: _location,
            timestamp: block.timestamp,
            verified: false,
            rewardClaimed: false,
            severity: _severity
        });

        userIncidents[msg.sender].push(id);
        emit IncidentReported(id, msg.sender, _type, _ipfsCID);
        return id;
    }

    /// @notice Verifies an incident and credits SRT rewards to the reporter (severity-weighted)
    function verifyIncident(uint256 _id) external onlyOwner {
        Incident storage incident = incidents[_id];
        require(!incident.verified, "Already verified");
        incident.verified = true;
        userRewardBalance[incident.reporter] += rewardAmount * incident.severity;
        emit IncidentVerified(_id, msg.sender);
    }

    function claimRewards() external nonReentrant {
        uint256 amount = userRewardBalance[msg.sender];
        require(amount > 0, "No rewards to claim");
        userRewardBalance[msg.sender] = 0;
        rewardToken.transfer(msg.sender, amount);
        emit RewardClaimed(msg.sender, amount);
    }

    function getUserIncidents(address _user) external view returns (uint256[] memory) {
        return userIncidents[_user];
    }

    function setRewardAmount(uint256 _amount) external onlyOwner {
        rewardAmount = _amount;
    }

    /// @notice Withdraw any leftover tokens (emergency use only)
    function withdrawTokens(uint256 _amount) external onlyOwner {
        rewardToken.transfer(owner(), _amount);
    }
}

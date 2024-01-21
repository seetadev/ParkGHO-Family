# Aave Credit Delegation and Improving Aave User Adoption

Workflow for enabling Aave credit delegation and user adoption using GHO based Aave lending and payments, Loki Protocol for Aave Credit Delegation: 

Citizens can invite their friends to join the transport volunteers community. Once they join, they need to deposit 9.90 GHO on a monthly basis. The money is automatically invested in Aave lending pools.

Volunteers who miss their payments are sent 3 reminders. They can withdraw what they deposited, but won't get any of the interest. Their interest is divided for remaining players.

Volunteers have a strong incentive to invite their friends and make the initiative go viral. For every referral they make, they get a 1.5% bonus, and for every second level referral they get another 1% bonus. The bonus is calculated on the interest.

Please visit https://drive.google.com/drive/u/1/folders/1fgDkLeLEqng1YvVU6XcCkdUm0ejmsTXZ

Main contracts: 
- Loan.sol
- Manager.sol
- LendCollectModule.sol

# Development using Loki's protocol Hardhat Project template

We are extending Loki's protocol Hardhat Project template

```shell
npx hardhat help
npx hardhat test
GAS_REPORT=true npx hardhat test
npx hardhat node
npx hardhat run scripts/deploy.js
```


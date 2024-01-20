# GHO Facilitator
We are developing a facilitator for the Aave GHO ecosystem to tackle both challenges of citizen participation for reporting road incidents and better incentivization for citizen developers focused on safe mobility solutions:

- Collaborative Decision by Aave Governance
This enables determination and allocation of a Facilitator to a specific Bucket capacity to enable bootstrapping of GHO liquidity and the GHO market.

Facilitator
- This role enables generation and burning of GHO tokens in a trustless manner;
- Each Facilitator is allocated a Bucket with a specified Capacity;
- Using Ethereum or Ethereum based ERC20 tokens as collateral for GHO; 
-  Collateral can be provided cross chain via Chainlink CCIP to mint GHO;
- Citizen is able to ERC20 tokens as collateral and they can send their assets (collateral) to Aave protocol to earn an interest.
- Cross chain interoperability using Chainlink CCIP.

We are also developing Mile Wallet built using Connectkit, Chainlink CCIP, AAVE protocol and GHO stable coins: 
- Effortless DeFi and NFT integration for a decentralized financial future.
- Securely send and redeem GHO based stable coins with an expiry for redemption.
- Purchase Ethereum based tokens using credit and debit cards, as well as various crypto assets for South Asian countries where the majority of tokens cannot be withdrawn from exchanges to wallets.
- Seamless management of fiat and crypto payment options across desktop and mobile platforms.
- User-friendly interface for convenient navigation and control over digital assets.



# Gho

This repository contains the source code, tests and deployments for both GHO itself and the first facilitator integrating Aave. The repository uses [Hardhat](https://hardhat.org/) development framework.

## Description

GHO is a decentralized, protocol-agnostic crypto-asset intended to maintain a stable value. GHO is minted and burned by approved entities named Facilitators.

The first facilitator is the Aave V3 Ethereum Pool, which allows users to mint GHO against their collateral assets, based on the interest rate set by the Aave Governance. In addition, there is a FlashMint module as a second facilitator, which facilitates arbitrage and liquidations, providing instant liquidity.

Furthermore, the Aave Governance has the ability to approve entities as Facilitators and manage the total amount of GHO they can generate (also known as bucket's capacity).

## Getting Started

Clone the repository and run the following command to install dependencies:

```sh
npm i
```

If you need to interact with GHO in the Goerli testnet, provide your Alchemy API key and mnemonic in the `.env` file:

```sh
cp .env.example .env
# Fill ALCHEMY_KEY and MNEMONIC in the .env file with your editor
code .env
```

Compile contracts:

```sh
npm run compile
```

Run the test suite:

```sh
npm run test
```

Deploy and setup GHO in a local Hardhat network:

```sh
npm run deploy-testnet
```

Deploy and setup GHO in Goerli testnet:

```sh
npm run deploy-testnet:goerli
```


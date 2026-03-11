# SafeRoads DAO

## Table of Contents

- [How Self Protocol is Used](#how-self-protocol-is-used)
- [Problem](#problem)
- [Solution](#solution)
- [Deployment & Demo](#deployment--demo)
 - [Telegram Mini App](#telegram-mini-app)
- [AI-Powered Feature Development](#ai-powered-feature-development)
- [Smart Contracts on Celo Sepolia](#smart-contracts-on-celo-sepolia)
- [Getting Started](#getting-started)

> Turning “why should I report?” into “heck yes, I’ll report!”

SafeRoads DAO is a decentralized platform built on the **Celo blockchain** that rewards citizens for reporting real road incidents — potholes, accidents, or other road hazards — and stores them **on-chain for transparency**.  
Once verified, reporters earn **Celo tokens** for their contribution to safer cities.



## Problem

In busy metro cities like **New Delhi**, road issues are everywhere — but no one reports them.  
People don’t have time, there’s no incentive, and existing systems lack transparency.  
As a result, governments don’t get reliable data, and citizens stop caring.

---


## Solution

SafeRoads DAO makes civic participation **rewarding and verifiable**.

- Citizens report road incidents through a simple **dApp** (location + image + description).  
- Reports are recorded on the **Celo blockchain**, ensuring public visibility and immutability.  
- Verified reports earn **Celo token rewards**.  
- [Self Protocol](https://docs.self.xyz/) ensures only real humans can report, verified via Aadhaar.

---



## Deployment & Demo

- **Deployment link of main dapp:**  
    https://self-road-report-celo.vercel.app/

- **Demo screencasts of the dapp:**  
    https://drive.google.com/drive/folders/1dCfET3D1Tt42aQ7yfovlCXsd5ued5IUk?usp=drive_link

----

## How Self Protocol is Used

In SafeRoads DAO, [Self Protocol](https://docs.self.xyz/) is integrated to ensure that only real, unique humans can submit road incident reports. When a user wants to report an incident, they must verify their identity using [Self Protocol](https://docs.self.xyz/), which leverages Aadhaar-based zero-knowledge proofs. This process confirms the user is a genuine individual without exposing any personal data. Only after successful verification can the user submit a report and become eligible for rewards, making the platform both secure and privacy-preserving.


---
## Telegram Mini App

- Report incidents directly from Telegram using the bot: https://t.me/saferoads_dao_bot
- Note: this bot is under active improvement — core reporting works now and better features will be added in the future.

---

## NoahAI-Powered Feature Development

To deliver a complete user experience, I am leveraging [Noah AI](https://trynoah.ai/) to rapidly develop and enhance features for SafeRoads DAO. One of the key additions is the **Incident Verification Portal**—a dedicated interface for verifying authorities to review incident reports and trigger rewards for reporters. This portal streamlines the verification process and ensures timely, transparent reward distribution.

- **Noah AI demo link:**  
    https://share.vidyard.com/watch/wUvHSew3pVXDFLG247Pzzq

## Smart Contracts on Celo Sepolia

SafeRoads DAO uses two main smart contracts, both deployed on the Celo Sepolia testnet:

### 1. ProofOfHuman Contract
- **Block Explorer:** [0xa46fbeC38d888c37b4310a145745CF947d83a0eB](https://celo-sepolia.blockscout.com/address/0xa46fbeC38d888c37b4310a145745CF947d83a0eB)
- **Purpose:** Handles user verification via [Self Protocol](https://docs.self.xyz/). When a user completes Aadhaar-based verification in the Self mobile app, this contract records their verified status on-chain. It ensures only real, unique humans (not bots or duplicates) can report incidents and claim rewards. The contract stores cryptographic attestations and provides a public method to check if a user is verified.

### 2. IncidentContract
- **Block Explorer:** [0x34b6921bfe6c4933a1Af79b5f36A5b6e28B1a081](https://celo-sepolia.blockscout.com/address/0x34b6921bfe6c4933a1Af79b5f36A5b6e28B1a081)
- **Purpose:** This is the main contract for the dApp. It manages the full lifecycle of incident reporting: accepting new reports, storing incident data, keeping a record of reporters, and distributing rewards to verified users. All actions are recorded on-chain for transparency and auditability.


## Getting Started

```bash
# Clone the repo
git clone https://github.com/virtualvasu/self-road-report-celo.git

# Navigate to dapp folder 
cd dapp

# Install dependencies
npm install

# Start development server
npm run dev
```

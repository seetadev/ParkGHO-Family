# Contributing to ParkGHO-Family

Thank you for your interest in contributing! ParkGHO-Family is a multi-chain Web3 infrastructure project covering transport safety, decentralized identity, and tokenized mobility.

## Repository Structure

```
ParkGHO-Family/
├── Aave-GHO-Lending-Loki/            # GHO lending protocol integration
├── Car-Auction-Dapp/                  # EVM car auction dApp
├── Car-Auction-Dapp-Optimism/         # Car auction ported to Optimism
├── Web3-road-incident/                # Road incident reporting (EVM)
├── web3-incident-dapp/                # Incident dApp frontend
├── saferoads-celo/                    # Road safety on Celo
├── saferoads-filecoin/                # Road safety on Filecoin
├── Filecoin/                          # Filecoin storage integrations
├── Incident-App-Filecoin/             # Incident reporting + Filecoin
├── eKYC-LIT-Storacha/                 # Decentralized identity (LIT + Storacha)
├── Invoice-LIT-Storacha/              # Invoicing with LIT Protocol
├── stark-schedule/                    # Starknet scheduling contracts
└── gho-facilitator-development/       # GHO facilitator contracts
```

## Prerequisites

- Node.js >= 18
- npm or yarn
- A wallet (MetaMask recommended) with testnet tokens for testing
- [Hardhat](https://hardhat.org/) for smart contract work
- [Foundry](https://book.getfoundry.sh/) (optional, for Solidity testing)

## Getting Started

### EVM sub-projects (Hardhat)

Most contract sub-projects follow this pattern:

```bash
cd <sub-project-folder>
npm install
npx hardhat compile
npx hardhat test
```

To deploy to a testnet (set your `.env` first):

```bash
cp .env.example .env   # fill in RPC_URL and PRIVATE_KEY
npx hardhat run scripts/deploy.js --network <network>
```

### Frontend dApps (React/Next.js)

```bash
cd <dapp-folder>
npm install
npm run dev
```

### Starknet sub-projects

```bash
cd stark-schedule
npm install
# Follow the Starknet devnet setup in the sub-project README
```

## Making a Contribution

1. Fork and create a branch:
   ```bash
   git checkout -b feat/your-feature-name
   ```
   Prefix conventions: `feat/`, `fix/`, `docs/`, `test/`

2. Commit your changes:
   ```bash
   git commit -m "[Tag]: Brief description"
   ```
   See merged PRs for the commit message style used in this repo.

3. Open a PR to `main` with a clear description. Link to the relevant issue if one exists.

## Code Style

- **TypeScript/JavaScript**: Respect existing TSConfig and ESLint rules in each sub-project.
- **Solidity**: Follow OpenZeppelin patterns. Contracts should compile without warnings.
- **General**: One PR per logical change. Keep diffs small for easier review.

## Useful Links

- [Project Issue #35 (DMP 2026)](https://github.com/seetadev/ParkGHO-Family/issues/35) — ERC-20 + multi-agent libp2p project
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts/)
- [Hardhat Documentation](https://hardhat.org/docs)
- [Aave GHO Documentation](https://docs.gho.xyz/)
- [Filecoin FVM Docs](https://docs.filecoin.io/smart-contracts/fundamentals/the-fvm)

## Questions

Comment on the relevant GitHub issue or open a Discussion. Maintainer: [@seetadev](https://github.com/seetadev).
# Herodotus on Starknet for Stark Schedule

We are using Herodotus’s Storage Proof API to enable patients to prove ownership of Medical Incident NFT they hold on Starknet using storage proofs. The Herodotus API is used to generate the needed storage proof and verify it on Starknet.


Herodotus’s Storage Proof API a service aims at providing:
■Secure data storage, transparent data movement and data authenticity.
■Improving Data Transparency in Medication


Data Integrity and Responsible AIOps using Herodotus’s Storage Proof API: We are extending the implementation of Herodotus’s Storage Proof API to verify data integrity and prioritize the ranking of actions (pending, in progress and completed) at the government hospital to be undertaken on medical incidents depending upon the status (pending, in progress and completed). We are developing custom Web3 storage and data analytics solutions using Herodotus and tools to enable no code, low code analytics tooling using an open source analytics and visualization tool, namely, HerodotusXLS, which enables tabulation, organization, collaboration, visualization, graphing and charting.


Please visit Demo, Screenshots and Screencasts at  https://drive.google.com/drive/u/1/folders/1jkIPsjj9zyy7SQ0Yp5pYwlca5a4ykqqZ


Components:

- Core - Implements the core logic behind Herodotus.
- Remappers - Implements a util allowing to map arbitrary timestamps to L1 block numbers.
- Turbo - Acts as a frontend to the Core contracts, provides great UX to developers and simplifies the integration.
- L1 - Smart contracts deployed on Ethereum L1 responsible for synchronizing with L1.

# Core

This module is responsible for:

- Processing new block headers and growing the MMR.
- Receiving and handling L1 messages containing blockhashes and Poseidon roots of the MMR which generation has been SHARP proven.
- Verifying state proofs and saving the proven values in the `FactsRegistry`

# Timestamps to block numbers mapper

This module implements the logic described in this doc:
https://herodotus.notion.site/Blocks-timestamp-to-number-mapper-6d6df20f31e24afdba89fe67c04ec5e2?pvs=4

# Turbo

WIP -> EVM implementation https://github.com/HerodotusDev/herodotus-evm

More info:
https://www.notion.so/herodotus/Herodotus-on-Starknet-Smart-contracts-flow-bb42da2b3f434c84900682ee8a954531

# Dependencies

This repository highly relies on the work implemented in:
https://github.com/HerodotusDev/cairo-lib

Herodotus Dev Ltd - 2023.

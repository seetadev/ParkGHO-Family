# STRK Schedule

Web3 tools for patients to enable management of diabetes easily by keeping a track of  blood sugar along with meals and exercise using Starknet, Voyager, Dynamic SDKs and Starknet ecosystem tools.

Further, the dapp uses verified medical incident data to mint NFTs on Voyager for users that will store an image and the insurance metadata, as well as a calculated diabetes score for the patients using Starknet and Argent Mobile. 

Features:
1. Track, record and share your diabetes medications on-chain securely and quickly using Starknet, Voyager and eco-system tools over the course of your medication. Comprehensive log sheets have been provided along with the month's calendar and meeting agenda sheets available in template formats. The monthly calendar helps you organize your medicines on a daily basis on-chain.

2. Add your medical appointments, notes and medical visits. This enables early stage detection and prevention of medical incidents and enables preventive care.

3. Add and edit details of your medicines like date, dosage times, quantities in Medication Log module on Starknet. Record other details like the due date of the medicine, prescribing physician, etc. as well as details regarding side effects, refill no. and the pharmacy phone number. 

4. Monitor your blood sugar level easily with the Blood Sugar Log dapp module.

5. Track and summarize the time spent on the physical activities. Plan and organize your meals on a weekly basis.


Each patient can opt to join the DAO and the DAO smart contract will utilize the metadata from the NFT to charge each user according to risk and at the end of a specified block, the DAO will pay distribute rewards that quarter in an airdrop.


# How we built it


# Blockchain Ecosystem

## Voyager API 

We are using Voyager API for smart contract verification and also for enabling scalable transaction views for smart contracts, transaction, blocks, events of  medical incidents created by patients and medical service personnel. Voyager’s API provides access to Starknet data on Mainnet and testnet Sepolia. Current endpoints include blocks, transactions, classes, contracts and events.

We are extending the Voyager APIs for validating and viewing the smart contracts, transactions, blocks, events generated for the medical incidents reported by patients and medical service personnel on Starknet.
Please visit demo and screenshots at https://drive.google.com/drive/u/1/folders/1pCbrSu7PEAluprTPHjL3SEkQjkEz06Sm

Voyager link: https://sepolia.voyager.online/contract/0x033b159ceA5C3Ec0A677cE68ACBA58813Aee53f9455aE36A68bCEeD74749e935#code

AIOps using Voyager API: We are extending the implementation of Voyager API to prioritize the ranking of actions (assignment, not assigned) at clinics, government hospitals to be undertaken on medical incidents depending upon the status (pending, in progress and completed).


## StarkWare

We are developing tools to enable tracing, monitoring and recording of medication log, blood sugar chart levels, medical work orders and invoices in a scalable manner across an entire supply chain for efficiency and sustainability and benefit the entire medical eco-system using Starkware's StarkEx L2 engine, custom zk rollapps, low code medical analytics and validation tools on Starknet. 

Demo, Screenshots and Screencasts at https://drive.google.com/drive/u/1/folders/18c80EvryJSkncQYRhmKWPlOd-oWLgufX

Usage of Scaffold Stark and Starkware's StarkEx L2 engine: https://github.com/seetadev/stark-schedule/tree/main/Stark-Medical-Incident-Report-NFT-gen

Automated Workflow for decentralized voting for medical service providers and DAOs in a scalable manner using Starkware's StarkEx L2 engine, Voyager, DID on Starknet:

DAOs create a RFP for providing medical service or medical device maintenance on the dapp.

Doctor can join a RFP by minting an NFT of that RFP. This NFT is created on-chain on Starknet.

Doctors that have a certain RFP's NFT are eligible to create proposals and vote on them.

Voting is gasless and the vote is stored on Starknet with the most recent vote linking to one before using DID.

Each patient can opt to join the DAO and the DAO smart contract will utilize the metadata from the NFT to charge each user according to risk and at the end of a specified block, the DAO will distribute rewards that quarter in an airdrop.

References: 

Low code dapp tooling: https://github.com/seetadev/stark-schedule/tree/main/Stark-Medical-Incident-Report-NFT-gen/starknet-voyager-dynamic

Transaction Links: 

https://sepolia.voyager.online/contract/0x033b159ceA5C3Ec0A677cE68ACBA58813Aee53f9455aE36A68bCEeD74749e935#code

https://sepolia.starkscan.co/contract/0x045ef38e7c2a57ed6374068c2de30c0861c129cdade8762b2c60dfa3d1857ec8

We are developing custom Web3 storage and data analytics solutions using Herodotus and tools to enable no code, low code analytics tooling using an open source analytics and visualization tool, which enables tabulation, organization, collaboration, visualization, graphing and charting. Please visit https://github.com/seetadev/stark-schedule/tree/main/Stark-Medical-Incident-Report-NFT-gen/starknet-voyager-dynamic

Benefits to patients, administrator and insurers:
1. Connect all medical stakeholders using Starkware's StarkEx, custom zk rollapps, low code medical analytics and validation tools on Starknet. 
2. Personalize care treatment.
3. Accurate and timely payments.
4. Reduce the cost of decentralized systems by Layer 2 Scaling.



## Argent

We are developing a PWA for Medication Log and Schedule with Argent wallet, which supports operations like sending STRK and Eth payment amounts, zk signing of the transaction and other cryptographic operations like NFT transfer across multiple platforms and Starknet based blockchains that improve the overall usability and interoperability. 
We are integrating Starknet's ZK features with Argent wallet that seamlessly works across key Starknet L2 tokens and leverages Zero Knowledge Proofs for Crypto-transactions and Identity proofs. 

Please visit Demo, Screenshots and Screencasts at  https://drive.google.com/drive/u/1/folders/189UF3LU8J638stH_tz_Ru_R2iiwB0h2p

Argent’s Multisig: Automated Workflow for decentralized voting for medical service providers and DAOs in a scalable manner using Argent’s Multisig, Starkware's StarkEx L2 engine, Voyager, DID on Starknet:

DAOs create a RFP for providing medical service or medical device maintenance on the dapp.

Doctor can join a RFP by minting an NFT of that RFP. This NFT is created on-chain on Starknet.

Doctors that have a certain RFP's NFT are eligible to create proposals and vote on them.

Voting is gasless and the vote is stored on Starknet with the most recent vote linking to one before using DID.

Each patient can opt to join the DAO and the DAO smart contract will utilize the metadata from the NFT to charge each user according to risk and at the end of a specified block, the DAO will distribute rewards that quarter in an airdrop.

Medication Suite PWA with Argent wallet enables personalized care treatment by enabling administrators and insurers:
1. Connect all stakeholders using Argent wallet and Starkware's StarkEx, custom zk rollapps, low code medical analytics and validation tools on Starknet. 
2. Personalize care treatment.
3. Accurate and timely payments.
4. Reduce the cost of decentralized systems by Layer 2 Scaling.


## Starknet Foundation

We are developing tools to enable tracing, monitoring and recording of medication log, dosage schedules and blood sugar levels for a diabetes patient using Starknet and its Web3 eco-system tools. We are further enabling the healthcare community & the medical eco-system to do medical counseling in case of emergency incidents, securely, and transparently on Starknet, thereby empowering the diabetic patients. 

Please visit Demo, Screenshots and Screencasts at https://drive.google.com/drive/u/1/folders/189UF3LU8J638stH_tz_Ru_R2iiwB0h2p


Also, we are able to provide personalized care treatment for diabetes patients on Starknet by developing low code on-chain tooling for the following features:
1. Track, record and share diabetes medications on-chain securely and quickly using Starknet, Voyager and eco-system tools over the course of medication. 

2. Add medical appointments, notes and medical visits. This enables early stage detection and prevention of medical incidents and enables preventive care.

3. Add and edit details of medicines like date, dosage times, quantities in Medication Log module on Starknet. Record other details like the due date of the medicine, prescribing physician, etc. as well as details regarding side effects, refill no. and the pharmacy phone number. 

4. Monitor blood sugar level easily with the Blood Sugar Log dapp module.

5. Track and summarize the time spent on the physical activities. Plan and organize meals on a weekly basis.

Benefits to patients, administrator and insurers:
1. Connect all medical stakeholders using Starkware's StarkEx, custom zk rollapps, low code medical analytics and validation tools on Starknet. 
2. Personalize care treatment.
3. Accurate and timely payments.
4. Reduce the cost of decentralized systems by Layer 2 Scaling.

A greater and more seamless flow of information within a medical infrastructure, created by electronic records as a Starknet service encompasses and leverages digital progress and can transform the way medicines are developed, tested and distributed to improve the global health economy and achievement of Sustainable Development Goals in Healthcare.

References: 

Usage of Scaffold Stark: https://github.com/seetadev/stark-schedule/tree/main/Stark-Medical-Incident-Report-NFT-gen

Low code dapp tooling: https://github.com/seetadev/stark-schedule/tree/main/Stark-Medical-Incident-Report-NFT-gen/starknet-voyager-dynamic

Transaction Links: 

https://sepolia.voyager.online/contract/0x033b159ceA5C3Ec0A677cE68ACBA58813Aee53f9455aE36A68bCEeD74749e935#code

https://sepolia.starkscan.co/contract/0x045ef38e7c2a57ed6374068c2de30c0861c129cdade8762b2c60dfa3d1857ec8



## Dynamic SDK 

We are using Dynamic SDKs to enable onboarding of Web2 users in Stark Schedule project. Integrating with Dynamic enables Web2 -> Web3 transition,  cryptographic operations
support across multiple platforms and Eth based blockchains that improve the overall usability and interoperability. 

Please visit the demo, screenshots and details at https://drive.google.com/drive/u/1/folders/1aD4XMvbUpnddJnKhfH375_ohiDFb3gk1

Initial Deployment using Dynamic tutorial: https://dynamic-stark-schedule-dapp.vercel.app/


# Herodotus

We are using Herodotus’s Storage Proof API to enable patients to prove ownership of Medical Incident NFT they hold on Starknet using storage proofs. The Herodotus API is used to generate the needed storage proof and verify it on Starknet. 

Herodotus’s Storage Proof API a service aims at providing:
■ Secure data storage, transparent data movement and data authenticity.
■ Improving Data Transparency in Medication

Data Integrity and Responsible AIOps using Herodotus’s Storage Proof API: We are extending the implementation of Herodotus’s Storage Proof API to verify data integrity and prioritize the ranking of actions (assigned, not assigned, in progress and completed) at the government hospital to be undertaken on medical incidents depending upon the status (pending, in progress and completed). We are developing custom Web3 storage and data analytics solutions using Herodotus and tools to enable no code, low code analytics tooling using an open source analytics and visualization tool, namely, HerodotusXLS, which enables tabulation, organization, collaboration, visualization, graphing and charting.

Please visit Demo, Screenshots and Screencasts at  https://drive.google.com/drive/u/1/folders/1jkIPsjj9zyy7SQ0Yp5pYwlca5a4ykqqZ





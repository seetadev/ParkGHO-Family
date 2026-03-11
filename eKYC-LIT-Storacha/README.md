# Web3 eKYC with LIT Protocol

This project enables Web3-based electronic KYC (eKYC) using the [LIT Protocol](https://developer.litprotocol.com/sdk/access-control/encryption) for secure access control and encryption.

## Official Documentation

Refer to the official LIT documentation for detailed API and SDK usage:
👉 [LIT Protocol Access Control & Encryption Docs](https://developer.litprotocol.com/sdk/access-control/encryption)

## Project Setup Guide


Follow the steps below to set up and run the WebApp locally.

## 1. Install Dependencies

```bash
npm install
```

---

## 2. Set Up Environment Variables

Create a `.env` file in the `webapp` directory by copying the provided `.env.template` file:

```bash
cp .env.template .env
```

Then, open `.env` and fill in the required values as per your configuration.

---

## 3. Start the Development Server

```bash
npm run dev
```

The development server should now be running at `http://localhost:5173` 


## Network Configuration

* **LIT Network**: `DatilDev`
* **Wallet Requirement**:

  * Ensure MetaMask (or any other Ethereum-compatible wallet) is installed in your browser.
  * Your wallet must hold at least `0.000001 ETH` on the **Sepolia testnet**.

## IPFS Storage with Storacha

This project uses **Storacha** as one of the  IPFS storage provider, following the official Lighthouse documentation:

> [Storacha Documentation](https://docs.storacha.network/)

Storacha provides decentralized and permanent file storage powered by **IPFS** and **Filecoin**.

## IPFS Storage with Lighthouse

This project uses **Lighthouse** as one of the IPFS storage provider, following the official Lighthouse documentation:

> [Lighthouse Documentation](https://docs.lighthouse.storage/lighthouse-1)



### Network Configuration

* **Testnet Used**: `DatilDev`

Ensure your wallet has a small amount of testnet ETH on the **Sepolia** network to interact with LIT protocol.






## App Demo

You can view a demo of the application using the link below:

[🔗 App Demo (Google Drive)](https://drive.google.com/drive/folders/1Ll51ZpJU-ttE0eKbE9r2nEIWpCrzuE8X)




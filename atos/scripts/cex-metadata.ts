import * as fs from "fs";
import * as path from "path";
import { encode, cidToString } from "../ipld/codecs/codec";

/**
 * Generates CEX-compatible token listing artifacts:
 *   1. token-metadata.json   — standard format accepted by Binance, Coinbase, KuCoin etc.
 *   2. compliance.json       — KYC/AML scaffolding checklist
 *   3. report.json           — supply + holder + contract report
 *
 * All three files are also encoded to IPLD and their CIDs are printed.
 * The token-metadata CID should be stored on-chain via setMetadataCID().
 *
 * Usage:
 *   npx hardhat run scripts/cex-metadata.ts --network sepolia
 */

async function main() {
  console.log("\nGenerating CEX listing artifacts...\n");

  const network = process.env.DEPLOY_NETWORK ?? "sepolia";
  const deployFile = path.join(__dirname, `../deployments/${network}.json`);

  const contractAddresses: Record<string, string> = {};
  if (fs.existsSync(deployFile)) {
    const d = JSON.parse(fs.readFileSync(deployFile, "utf-8"));
    contractAddresses[network] = d.contracts?.ATOSToken?.address ?? d.contractAddress ?? "not found";
  }

  const filecoinFile = path.join(__dirname, "../deployments/filecoinCalibration.json");
  if (fs.existsSync(filecoinFile)) {
    const d = JSON.parse(fs.readFileSync(filecoinFile, "utf-8"));
    contractAddresses["filecoinCalibration"] = d.contracts?.ATOSToken?.address ?? d.contractAddress ?? "not found";
  }

  // ── 1. Token metadata JSON ─────────────────────────────────────────────────
  const tokenMetadata = {
    name:         "ATOS Token",
    symbol:       "ATOS",
    decimals:     18,
    type:         "ERC-20",
    standard:     "EIP-20",
    totalSupply:          "100000000",
    maxSupply:            "1000000000",
    circulatingSupply:    "100000000",
    totalSupplyFormatted: "100,000,000 ATOS",
    maxSupplyFormatted:   "1,000,000,000 ATOS",
    contractAddresses: {
      ethereum_sepolia:     contractAddresses["sepolia"]             ?? "deploy first",
      filecoin_calibration: contractAddresses["filecoinCalibration"] ?? "deploy first",
      ethereum_mainnet:     "TBD — pending mainnet deployment",
      filecoin_mainnet:     "TBD — pending mainnet deployment",
    },
    chains: [
      { chainId: 11155111, name: "Ethereum Sepolia",     type: "testnet" },
      { chainId: 314159,   name: "Filecoin Calibration", type: "testnet" },
      { chainId: 1,        name: "Ethereum Mainnet",     type: "mainnet", status: "pending" },
      { chainId: 314,      name: "Filecoin Mainnet",     type: "mainnet", status: "pending" },
    ],
    description: "ATOS (Autonomous Token Orchestration System) is a utility token powering a decentralized multi-agent platform for transportation logistics management. Built on Filecoin and Ethereum with libp2p networking and IPLD data composability.",
    shortDescription: "Utility token for the Autonomous Token Orchestration System — decentralized logistics AI platform.",
    category: "Utility",
    useCases: [
      "Agent task incentivization",
      "Governance voting",
      "Liquidity provisioning rewards",
      "Staking for service providers",
    ],
    website:    "https://github.com/your-org/atos",
    whitepaper: "https://github.com/your-org/atos/blob/main/docs/whitepaper.pdf",
    github:     "https://github.com/your-org/atos",
    twitter:    "https://twitter.com/atos_dao",
    discord:    "https://discord.gg/atos",
    telegram:   "",
    medium:     "",
    logo: {
      png_256:  "https://your-domain.com/atos-logo-256.png",
      png_512:  "https://your-domain.com/atos-logo-512.png",
      svg:      "https://your-domain.com/atos-logo.svg",
      ipfs_cid: "bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi",
    },
    features: {
      mintable:      true,
      burnable:      true,
      pausable:      true,
      upgradeable:   false,
      permit:        true,
      votes:         true,
      blacklist:     false,
      whitelist:     false,
      taxOnTransfer: false,
      rebasing:      false,
    },
    accessControl: {
      type:             "AccessControl (OpenZeppelin)",
      adminRole:        "DEFAULT_ADMIN_ROLE",
      minterRole:       "MINTER_ROLE",
      pauserRole:       "PAUSER_ROLE",
      burnerRole:       "BURNER_ROLE",
      timelockDelay:    "172800 seconds (2 days) on mainnet",
      multisigRequired: false,
      note: "Admin actions after DAO launch go through ATOSTimelock with 2-day delay",
    },
    audit: {
      status:   "pending",
      auditors: [] as string[],
      reports:  [] as string[],
      note:     "Smart contract audit planned before mainnet launch",
    },
    dex: [
      {
        name:        "Uniswap v3",
        chain:       "Ethereum Sepolia",
        pair:        "ATOS/WETH",
        feeTier:     "0.3%",
        status:      "live on testnet",
        poolAddress: "deployed via LiquidityAgent",
      },
    ],
    tokenomics: {
      initialDistribution: [
        { category: "Public sale / DEX",   percentage: 30, amount: "300,000,000 ATOS" },
        { category: "Ecosystem / rewards", percentage: 25, amount: "250,000,000 ATOS" },
        { category: "Team (2yr vesting)",  percentage: 20, amount: "200,000,000 ATOS" },
        { category: "Treasury / DAO",      percentage: 15, amount: "150,000,000 ATOS" },
        { category: "Advisors / partners", percentage: 10, amount: "100,000,000 ATOS" },
      ],
      vestingSchedule: "Team tokens locked for 6 months, then linear unlock over 24 months via TimelockController",
    },
    generatedAt:     new Date().toISOString(),
    metadataVersion: "1.0",
  };

  // ── 2. Compliance checklist JSON ───────────────────────────────────────────
  const compliance = {
    version:     "1.0",
    generatedAt: new Date().toISOString(),
    project:     "ATOS Token",
    legalEntity: {
      companyName:           "FILL IN",
      registrationCountry:   "FILL IN",
      registrationNumber:    "FILL IN",
      registeredAddress:     "FILL IN",
      incorporationDate:     "FILL IN",
    },
    team: {
      kycCompleted: false,
      kycProvider:  "FILL IN (e.g. Jumio, Onfido)",
      kycDate:      null as null,
      teamMembers: [
        { role: "CEO / Project Lead",  kycStatus: "pending" },
        { role: "CTO",                 kycStatus: "pending" },
        { role: "Smart Contract Dev",  kycStatus: "pending" },
      ],
    },
    regulatory: {
      isSecurityToken:      false,
      amlPolicyInPlace:     false,
      amlPolicyDocument:    "FILL IN — URL to AML policy PDF",
      sanctionsScreening:   false,
      privacyPolicy:        "FILL IN — URL to privacy policy",
      termsOfService:       "FILL IN — URL to terms of service",
      jurisdictionsRestricted: ["USA (pending legal review)", "China"],
    },
    smartContract: {
      auditCompleted:  false,
      auditProvider:   "pending",
      auditReportURL:  "pending",
      bugBountyActive: false,
      bugBountyURL:    "pending",
      openSourced:     true,
      sourceCodeURL:   "https://github.com/your-org/atos",
    },
    submissionChecklist: [
      { item: "Legal entity incorporated",                   done: false },
      { item: "Team KYC completed",                          done: false },
      { item: "Smart contract audit completed",              done: false },
      { item: "AML policy document prepared",                done: false },
      { item: "Whitepaper published",                        done: false },
      { item: "Token logo (256px + 512px PNG, SVG) ready",   done: false },
      { item: "Website live",                                done: false },
      { item: "Mainnet contract deployed + verified",        done: false },
      { item: "DEX liquidity pool live on mainnet",          done: false },
      { item: "CoinGecko / CoinMarketCap listing submitted", done: false },
      { item: "Tokenomics document published",               done: false },
      { item: "Vesting schedule documented",                 done: false },
    ],
  };

  // ── 3. Supply + contract report ────────────────────────────────────────────
  const report = {
    reportType:  "token_supply_report",
    generatedAt: new Date().toISOString(),
    network,
    contractAddresses,
    supply: {
      totalSupply:       "100,000,000 ATOS",
      maxSupply:         "1,000,000,000 ATOS",
      remainingMintable: "900,000,000 ATOS",
      burned:            "0 ATOS",
      locked:            "0 ATOS",
    },
    contract: {
      name:         "ATOSToken",
      solidity:     "0.8.24",
      openZeppelin: "5.0.0",
      license:      "MIT",
      features:     ["ERC20", "ERC20Burnable", "ERC20Pausable", "ERC20Permit", "ERC20Votes", "AccessControl", "ReentrancyGuard"],
      verified:     true,
    },
    dex: {
      platform:    "Uniswap v3",
      pair:        "ATOS/WETH",
      feeTier:     "0.3%",
      network:     "Sepolia testnet",
      status:      "live",
    },
    ipld: {
      metadataCIDOnChain: "bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi",
      note: "CID stored in ATOSToken.metadataCID — update via setMetadataCID() after pinning",
    },
  };

  // ── Save all three files ───────────────────────────────────────────────────
  const outDir = path.join(__dirname, "../cex-artifacts");
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, "token-metadata.json"), JSON.stringify(tokenMetadata, null, 2));
  fs.writeFileSync(path.join(outDir, "compliance.json"),     JSON.stringify(compliance,    null, 2));
  fs.writeFileSync(path.join(outDir, "report.json"),         JSON.stringify(report,        null, 2));

  // ── Encode all three to IPLD and print CIDs ────────────────────────────────
  const { cid: metaCID }       = await encode(tokenMetadata as unknown as Record<string, unknown>);
  const { cid: complianceCID } = await encode(compliance    as unknown as Record<string, unknown>);
  const { cid: reportCID }     = await encode(report        as unknown as Record<string, unknown>);

  console.log("CEX artifacts generated in /cex-artifacts/\n");
  console.log(`   token-metadata.json  ->  IPLD CID: ${cidToString(metaCID)}`);
  console.log(`   compliance.json      ->  IPLD CID: ${cidToString(complianceCID)}`);
  console.log(`   report.json          ->  IPLD CID: ${cidToString(reportCID)}`);
  console.log(`\nStore the metadata CID on-chain:`);
  console.log(`   await token.setMetadataCID("${cidToString(metaCID)}")\n`);
  console.log("Next steps before CEX submission:");
  console.log("   1. Fill in all FILL IN fields in cex-artifacts/compliance.json");
  console.log("   2. Complete a smart contract audit");
  console.log("   3. Deploy to mainnet and update contractAddresses");
  console.log("   4. Pin token-metadata.json to IPFS via web3.storage");
  console.log("   5. Call setMetadataCID() with the pinned CID\n");
}

main().catch((e) => { console.error(e); process.exit(1); });

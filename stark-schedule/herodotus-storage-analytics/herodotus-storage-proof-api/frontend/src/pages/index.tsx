import Head from "next/head";
import Image from "next/image";
import { Inter } from "next/font/google";
import styles from "@/styles/Home.module.css";

// EVM
import { ConnectButton } from "@rainbow-me/rainbowkit";
import {
  useAccount,
  useContract,
  useContractWrite,
  usePrepareContractWrite,
  useSignMessage,
  useSigner,
} from "wagmi";

import { useEffect, useMemo, useState } from "react";
import {
  accessProof,
  accountStorageHash,
  handleGenerateProof,
} from "@/shared/axios";
import { recoverPublicKey } from "viem";
import { factRegistryAbi } from "@/shared/factRegistryAbi";
import { stringify } from "querystring";

const inter = Inter({ subsets: ["latin"] });
let contract_data = {
  address: "0xB6920Bc97984b454A2A76fE1Be5e099f461Ed9c8",
  mapping_storage_slot: 5,
  proof_blocknumber: 0,
};

export default function Home() {
  const { address, isConnected } = useAccount();
  const [result, setResult] = useState("");

  const clickGenerateProof = async () => {
    //generate proof of token number 16
    await handleGenerateProof(address as string, 16);
    console.log("clickGenerateProof");
  };

  const clickVerifyProof = async () => {
    const item: any = localStorage.getItem("proofs");
    const data = JSON.parse(item as string);
    console.log(data);
    console.log(
      address as string,
      data[16][1].block_number,
      data[16][1].slot,
      data[16][1].proof
    );

    // check the proof
    const res: any = await accessProof(
      contract_data.address,
      data[16][1].block_number,
      data[16][1].slot,
      data[16][1].proof
    );
    setResult(res);
    console.log(result, "result");
  };
  return (
    <>
      {" "}
      <div className={styles.signupWrapper}>
        <div>
          <div className={styles.step}>STEP 1 : Select zkSync Wallet</div>
          <ConnectButton />
        </div>
      </div>
      <div>
        {isConnected && (
          <div className={styles.proofbutton} onClick={clickGenerateProof}>
            Generate Proof of Latest Block for NFT #16 Ownership
          </div>
        )}
      </div>
      <br />
      <div>
        {isConnected && (
          <div className={styles.proofbutton} onClick={clickVerifyProof}>
            Verify Proof
          </div>
        )}
      </div>
      <div>{result !== "" && <div>{result}</div>}</div>
    </>
  );
}

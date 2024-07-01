import { handleOwnedNFTs } from "@/shared/axios";
import { everaiDuoABI } from "@/shared/everaiDuo";
import styles from "@/styles/Home.module.css";
import * as React from "react";
import {
  usePrepareContractWrite,
  useContractWrite,
  useWaitForTransaction,
  useAccount,
} from "wagmi";

export function MintNFT({ stateChanger }: any) {
  const {
    config,
    error: prepareError,
    isError: isPrepareError,
  } = usePrepareContractWrite({
    address: "0xB6920Bc97984b454A2A76fE1Be5e099f461Ed9c8",
    abi: everaiDuoABI,
    functionName: "freeMint",
  });
  const { data, error, isError, write } = useContractWrite(config);
  const { address } = useAccount();

  const { isLoading, isSuccess } = useWaitForTransaction({
    hash: data?.hash,
  });

  const updateNFTState = async () => {
    const res = await handleOwnedNFTs(address as string);
    stateChanger(res);
  };
  React.useEffect(() => {
    updateNFTState();
  }, [isSuccess]);
  return (
    <div>
      <div className={styles.explanation}>
        <button disabled={!write || isLoading} onClick={write}>
          {isLoading ? "Minting..." : "Mint"}
        </button>
      </div>

      {isSuccess && (
        <div style={{ display: "flex" }}>
          Successfully minted your NFT!
          <div>
            <a href={`https://goerli.etherscan.io/tx/${data?.hash}`}>
              Etherscan
            </a>
          </div>
        </div>
      )}
      {(isPrepareError || isError) && (
        <div>Error: {(prepareError || error)?.message}</div>
      )}
    </div>
  );
}

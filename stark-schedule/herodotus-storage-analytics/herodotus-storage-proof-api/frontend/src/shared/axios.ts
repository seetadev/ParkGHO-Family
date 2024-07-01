import axios from "axios";
import { createPublicClient, http } from 'viem'
import { mainnet, zkSync, zkSyncTestnet } from 'viem/chains'
import { factRegistryAbi } from "./factRegistryAbi";

const FACTREGISTERY_CONTRACT = '0x2eBAf969571f3814a230850FcCACCC82A932FB6E'
const metadata_endpoint = process.env.NEXT_PUBLIC_METADATA_URL as string

export const handleGenerateProof = async (address:string, selectedTokenId:number) => {
    const res = await axios.post("/api/everai", {
      addr: address,
      tokenId: selectedTokenId,
    });
    const original = localStorage.getItem("proofs") || "{}"
   const json_original = JSON.parse(original)
   if(json_original[selectedTokenId]){
    json_original[selectedTokenId].push({"block_number":res.data.block_number ,"proof": res.data.proof, "slot":res.data.slot, "contract":res.data.contract, "metadata": `${metadata_endpoint}${selectedTokenId}` })
   }else {
    json_original[selectedTokenId] =  [{"block_number":res.data.block_number ,"proof": res.data.proof, "slot":res.data.slot, "contract":res.data.contract,"metadata": `${metadata_endpoint}${selectedTokenId}`}]

   }
    localStorage.setItem("proofs",JSON.stringify( json_original ));
    return res.data
  };

const publicClient = createPublicClient({
  chain: zkSyncTestnet,
  transport: http()
})

  export const accessProof =async(contractAddress :string,block_number:number, slot: string, storageProof:string) => {
    const data = await publicClient.readContract({
      address: FACTREGISTERY_CONTRACT as `0x${string}`,
      abi: factRegistryAbi,
      functionName: 'proveStorage',
      args: [contractAddress as `0x${string}`, block_number,slot,storageProof]
    })
    return data
  }

  export const accountStorageHash =async() => {
      const data = await publicClient.readContract({
      address: '0x2eBAf969571f3814a230850FcCACCC82A932FB6E' as `0x${string}`,
      abi: factRegistryAbi,
      functionName: 'accountStorageHashes',
        args: ['0xB6920Bc97984b454A2A76fE1Be5e099f461Ed9c8'as `0x${string}`,9211149]
    })
  }
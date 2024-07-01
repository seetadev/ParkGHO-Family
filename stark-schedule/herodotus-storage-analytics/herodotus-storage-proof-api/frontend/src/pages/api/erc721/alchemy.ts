import axios from "axios";

const alchemy_endpoint = process.env.ALCHEMY_API as string

export const getTokenIds = async (address: string, contract_address : string) => {

// Alchemy URL
const url = `${alchemy_endpoint}/getNFTs/?owner=${address}&withMetadata=true`;

const config = {
    method: 'get',
    url: url,
};

// Make the request and print the formatted response:
const res = await axios(config)
const allOwnedNFTs= res.data.ownedNfts
let newArray = allOwnedNFTs.filter((nft: { contract: { address: string; }; }) => {
  return nft.contract.address == contract_address.toLowerCase();
} );

return (newArray)
}


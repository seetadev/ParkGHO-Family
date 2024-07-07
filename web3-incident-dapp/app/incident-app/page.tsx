"use client";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useState } from "react";
// import ABI from './services/abi.json';
import axios from "axios";
import { useAccount, useWriteContract, useSwitchChain } from "wagmi";
import addressData from "../../utils/address.json";
import AvalancheAbi from "../../utils/AvalancheAbi.json";
import OptimismAbi from "../../utils/OptimismAbi.json";
import ArbitrumAbi from "../../utils/ArbitrumAbi.json";
import PolygonAbi from "../../utils/PolygonAmoy.json";

import Image from "next/image";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { slice } from "viem";

const IncidentReporter = () => {
  const { address, isConnected, chain } = useAccount();
  const [selectedValue, setSelectedValue] = useState("");
  // State variables for incident details
  var ContractAbi: any;
  var ContractAddress: any;
  var _function: any;
  console.log(chain?.name);
  // Sepolia
  // Avalanche Fuji
  // OP Sepolia
  // Arbitrum Sepolia

  const [url , setUrl] = useState("");

  const [incidentName, setIncidentName] = useState("");
  const [reporterName, setReporterName] = useState("");
  const [incidentLevel, setIncidentLevel] = useState("medium");
  const [description, setDescription] = useState("");
  const [incidentImageUrl, setIncidentImageUrl] = useState<string | null>(null);
  const [tokenURI, setTokenURI] = useState<string | null>(null);

  const handleSelectChange = (value: any) => {
    console.log("Selected value:", value);
    setSelectedValue(value);
  };

  // State for file upload
  const [selectedFile, setSelectedFile] = useState<File | undefined>();

  const { writeContract } = useWriteContract();
  const { chains, switchChain } = useSwitchChain();

  const _chains = [
    { name: "OP Sepolia", chainId: 11155420 },
    { name: "Arbitrum Sepolia", chainId: 421614 },
    { name: "Avalanche Fuji", chainId: 43113 },
    { name: "Polygon Amoy", chainId: 80002 },
  ];

  if (selectedValue === "OP Sepolia") {
    ContractAbi = OptimismAbi;
    ContractAddress = addressData.ccipOptimismAddress;
    _function = "mintOnOptimism";
  }
  if (selectedValue === "Arbitrum Sepolia") {
    ContractAbi = ArbitrumAbi;
    ContractAddress = addressData.ccipArbitrumAddress;
    _function = "mintOnArbitrum";
  }
  if (selectedValue == "Avalanche Fuji") {
    ContractAbi = AvalancheAbi;
    ContractAddress = addressData.ccipAvalancheAddress;
    _function = "mintOnSepolia";
  }
  if (selectedValue == "Polygon Amoy") {
    ContractAbi = PolygonAbi;
    ContractAddress = addressData.ccipPolygonAmoyAddress;
    _function = "mintOnOptimism";
  }

  // name will changed properly

  const mint = async () => {
    try {
      if (!isConnected) throw new Error("User disconnected");

      const tx = await writeContract({
        abi: ContractAbi,
        // @ts-ignore
        address: ContractAddress,
        functionName: _function,
        // @ts-ignore
        args: [tokenURI, address],
      });

      
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const changeHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (selectedFile) {
      const ipfsUrl = await handleImageUpload(selectedFile);
      console.log("Incident Report:", {
        incidentName,
        reporterName,
        incidentLevel,
        description,
        incidentImageUrl: ipfsUrl,
      });
    }
  };

  const handleImageUpload = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const resFile = await axios({
        method: "post",
        url: "https://api.pinata.cloud/pinning/pinFileToIPFS",
        data: formData,
        headers: {
          pinata_api_Key: `d2f21938c99d34d106be`,
          pinata_secret_api_key: `06c3efb5358411001adc2d3c9dd4655aad47f9a29d206a29d7ca6cf2a595a891`,
          "Content-Type": "multipart/form-data",
        },
      });

      const ImgHash = `https://gateway.pinata.cloud/ipfs/${resFile.data.IpfsHash}`;
      setIncidentImageUrl(ImgHash);

      const jsonString = {
        name: `${incidentName}-By ${reporterName}`,
        description: description,
        image: ImgHash,
        attributes: [
          {
            trait_type: "Incident Level",
            value: incidentLevel,
          },
        ],
      };

      const jsonData = new Blob([JSON.stringify(jsonString)], {
        type: "application/json",
      });
      const metadataFile = new File([jsonData], "metadata.json", {
        type: "application/json",
      });
      const metadataFormData = new FormData();
      metadataFormData.append("file", metadataFile);

      const resMetadata = await axios({
        method: "post",
        url: "https://api.pinata.cloud/pinning/pinFileToIPFS",
        data: metadataFormData,
        headers: {
          pinata_api_Key: `d2f21938c99d34d106be`,
          pinata_secret_api_key: `06c3efb5358411001adc2d3c9dd4655aad47f9a29d206a29d7ca6cf2a595a891`,
          "Content-Type": "multipart/form-data",
        },
      });

      const metadataHash = `https://gateway.pinata.cloud/ipfs/${resMetadata.data.IpfsHash}`;
      setTokenURI(metadataHash);
      console.log("Metadata IPFS URL:", metadataHash);

      if(metadataHash){
        toast("Image Uploaded to IPFS");
      }

      return metadataHash;
    } catch (error) {
      alert("Unable to Upload Image and Metadata.");
      console.error("Error:", error);
    }
  };

  return (
    <div className=" flex-col  gap-3 bg-black min-h-screen flex  items-center justify-center">
      <div className="max-w-md w-full mx-auto bg-white rounded-lg shadow-md p-6 sm:p-8 md:p-10">
        <h1 className="text-2xl font-bold mb-6 text-center">
          {" "}
          Medical Incident Reporter
        </h1>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="incidentName" className="block font-bold mb-2">
              Incident Name
            </label>
            <input
              type="text"
              id="incidentName"
              value={incidentName}
              onChange={(e) => setIncidentName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="reporterName" className="block font-bold mb-2">
              Your name
            </label>
            <input
              type="text"
              id="reporterName"
              value={reporterName}
              onChange={(e) => setReporterName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="incidentLevel" className="block font-bold mb-2">
              Incident Level
            </label>
            <select
              id="incidentLevel"
              value={incidentLevel}
              onChange={(e) => setIncidentLevel(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="medium">Medium</option>
              <option value="critical">Critical</option>
            </select>
          </div>
          <div className="mb-4">
            <label htmlFor="description" className="block font-bold mb-2">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={4}
              required
            />
          </div>
          <div className="mb-6">
            <label htmlFor="incidentImage" className="block font-bold mb-2">
              Incident Image
            </label>
            <input
              type="file"
              id="incidentImage"
              onChange={changeHandler}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              accept="image/*"
            />
          </div>
          {tokenURI ? (
            <div className="flex flex-col gap-4">
              <Select onValueChange={handleSelectChange}>
                <SelectTrigger className="w-full">
                  <SelectValue
                    className="font-bold"
                    placeholder="Select Your Source Chain"
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Source-Chain</SelectLabel>
                    <SelectItem value="OP Sepolia">
                      <div className="flex items-center justify-between gap-3">
                        <Image
                          src="/optimism.png"
                          alt="imge not found"
                          width={20}
                          height={20}
                        ></Image>
                        <span className="">Optimism</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="Arbitrum Sepolia">
                      <div className="flex items-center justify-between gap-3">
                        <Image
                          src="/arbitrum.png"
                          alt="imge not found"
                          width={20}
                          height={20}
                        ></Image>
                        <span className="">Arbitrum</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="Avalanche Fuji">
                      <div className="flex items-center justify-between gap-3">
                        <Image
                          src="/avalanche.png"
                          alt="imge not found"
                          width={20}
                          height={20}
                        ></Image>
                        <span className="">Avalanche Fuji</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="Polygon Amoy">
                      <div className="flex items-center justify-between gap-3">
                        <Image
                          src="/PolygonAmoy.png"
                          alt="imge not found"
                          width={20}
                          height={20}
                        ></Image>
                        <span className="">Polygon Amoy</span>
                      </div>
                    </SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>

              {selectedValue !== chain?.name && (
                <button
                  className=" lowercase  bg-blue-500 text-white font-bold py-2 rounded-lg"
                  onClick={() => {
                    const selectedChain = _chains.find(
                      (c) => c.name === selectedValue
                    );
                    if (selectedChain) {
                      switchChain({ chainId: selectedChain.chainId });
                    }
                  }}
                >
                  switch to {selectedValue}
                </button>
              )}

              <button
                type="button"
                onClick={mint}
                className="w-full py-2 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors duration-300 font-extrabold"
              >
                Create Incident NFT
              </button>
            </div>
          ) : (
            <button
              type="submit"
              className="w-full py-2 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors duration-300 font-extrabold"
            >
              Submit Data
            </button>
          )}
        </form>
      </div>
      <ToastContainer />
      <p>check your trasaction Status</p>
      <div className="flex gap-4 py-8">
        <input className="p-2 px-4"  placeholder="transaction hash" type="text" value={url} onChange={(e)=>{
          setUrl(e.target.value);
        }}/>
        <button className="text-white bg-blue-500 px-3" onClick={()=>{
          if(url){
            window.location.href =`https://ccip.chain.link/msg/${url}`
          }
        }}>Go</button>
      </div>
    </div>
  );
};

export default IncidentReporter;
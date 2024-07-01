"use client";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useState } from "react";
import axios from "axios";
import Image from "next/image";

const IncidentReporter = () => {
  const [selectedValue, setSelectedValue] = useState("");


  const [url, setUrl] = useState("");

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

      if (metadataHash) {
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
          Road  Incident Reporter
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
            <div>
              <button
                type="button"
                // onClick={mint}
                className="w-full py-2 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors duration-300 font-extrabold"
              >
                Yet to be Implimented 
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
        <input
          className="p-2 px-4"
          placeholder="transaction hash"
          type="text"
          value={url}
          onChange={(e) => {
            setUrl(e.target.value);
          }}
        />
        <button
          className="text-white bg-blue-500 px-3"
          onClick={() => {
            if (url) {
              window.location.href = `https://ccip.chain.link/msg/${url}`;
            }
          }}
        >
          Go
        </button>
      </div>
    </div>
  );
};

export default IncidentReporter;

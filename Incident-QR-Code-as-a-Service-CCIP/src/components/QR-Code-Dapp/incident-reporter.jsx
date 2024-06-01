import { useState } from 'react';
import ABI from './services/abi.json';
import axios from 'axios';
import { useAccount } from 'wagmi'

import { useWriteContract } from 'wagmi'

const IncidentReporter = () => {

  const { address,isConnected } = useAccount()


  // State variables for incident details
  const [incidentName, setIncidentName] = useState('');
  const [reporterName, setReporterName] = useState('');
  const [metamaskAddress, setMetamaskAddress] = useState('');
  const [incidentLevel, setIncidentLevel] = useState('medium');
  const [description, setDescription] = useState('');
  const [incidentImageUrl, setIncidentImageUrl] = useState(null);
  const [tokenURI, setTokenURI] = useState(null);



  const ContractAddress = '0xEc609677Cd0cb0f6D1B49eCf8eEE2528e2d77cF4';
  // State and functions for file upload
  const [selectedFile, setSelectedFile] = useState();
  console.log("this is incident image url", incidentImageUrl);


  const { data, isLoading, writeContract } = useWriteContract();


  const getBalance = async () => {
    try {
      if (!isConnected) throw new Error('User disconnected');

      const tx = writeContract({
        abi:ABI,
        address: ContractAddress,
        functionName: 'safeMint',
        args: [address, tokenURI],
      });

      console.log('Transaction hash:', tx);
    } catch (error) {
      console.error('Error:', error);
    }
  };


  const changeHandler = async (event) => {
    setSelectedFile(event.target.files[0]);
    console.log(selectedFile);

  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Upload the image to IPFS
    const ipfsUrl = await handleImageUpload(selectedFile);

    // Here, you can add the logic to submit the incident report to the blockchain or any other desired action.
    console.log('Incident Report:', {
      incidentName,
      reporterName,
      metamaskAddress,
      incidentLevel,
      description,
      incidentImageUrl: ipfsUrl,
    });
  };



  const handleImageUpload = async (file) => {
    if (file) {
      try {
        // Create a FormData object to send the file
        const formData = new FormData();
        formData.append("file", file);

        // Send a POST request to Pinata API to pin the file to IPFS
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

        // Construct the image URL with the IPFS hash
        const ImgHash = `https://gateway.pinata.cloud/ipfs/${resFile.data.IpfsHash}`;

        // Call the contract's add function to store the image URL
        setIncidentImageUrl(ImgHash);

        // Upload the JSON metadata to IPFS
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

        const jsonData = new Blob([JSON.stringify(jsonString)], { type: "application/json" });
        const metadataFile = new File([jsonData], "metadata.json", { type: "application/json" });
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
        return metadataHash;
      } catch (error) {
        alert("Unable to Upload Image and Metadata.");
        console.error("Error:", error);
      }
    }
  };




  return (
    <div className="bg-gray-100 min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full mx-auto bg-white rounded-lg shadow-md p-6 sm:p-8 md:p-10">
        <h1 className="text-2xl font-bold mb-6 text-center">Incident Reporter</h1>
        {/* <form onSubmit={handleSubmit}> */}
        {/* Incident Name */}
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
        {/* Reporter Name */}
        <div className="mb-4">
          <label htmlFor="reporterName" className="block font-bold mb-2">
            Reporter Name
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
        {/* Incident Level */}
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
        {/* Description */}
        <div className="mb-4">
          <label htmlFor="description" className="block font-bold mb-2">
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="4"
            required
          />
        </div>
        {/* Incident Image */}
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
        {/* Submit Button */}

        {
          tokenURI ? (
            <button
              onClick={
                getBalance
              }

              className="w-full py-2 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors duration-300 font-extrabold"
            >
              Create Incident NFT
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              className="w-full py-2 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors duration-300 font-extrabold"
            >
              Submit Data
            </button>
          )
        }

       

        {/* </form> */}
      </div>
    </div>
  );
};

export default IncidentReporter;
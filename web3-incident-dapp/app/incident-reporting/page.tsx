// /app/components/IncidentReportForm.tsx
"use client";
import { useState, FormEvent, useRef } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import "react-toastify/dist/ReactToastify.css";

import Image from "next/image";
import {
  useAccount,
  useWriteContract,
  useSwitchChain,
  useSendTransaction,
} from "wagmi";
import addressData from "../../utils/address.json";
import AvalancheAbi from "../../utils/AvalancheAbi.json";
import OptimismAbi from "../../utils/OptimismAbi.json";
import ArbitrumAbi from "../../utils/ArbitrumAbi.json";
import PolygonAbi from "../../utils/PolygonAmoy.json";
import { ToastContainer, toast } from "react-toastify";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const IncidentReportForm: React.FC = () => {
  var ContractAbi: any;
  var ContractAddress: any;
  var _function: any;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedValue, setSelectedValue] = useState("");
  const [incidentType, setIncidentType] = useState<string>("");
  const [date, setDate] = useState<string>("");
  const [time, setTime] = useState<string>("");
  const [loader, setLoader] = useState<Boolean>(false);
  const [severity, setSeverity] = useState<string>("Minor");
  const [reporterName, setReporterName] = useState<string>("");
  const [submitButtonText, setSubmitButtonText] = useState<string>("");
  const [contactInfo, setContactInfo] = useState<string>("");
  const [tokenURI, setTokenURI] = useState<string>("");
  const [vehicleType, setVehicleType] = useState<string>("");
  const [licensePlate, setLicensePlate] = useState<string>("");
  const [insuranceInfo, setInsuranceInfo] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [weather, setWeather] = useState<string>("");
  const [roadConditions, setRoadConditions] = useState<string>("");
  const [trafficConditions, setTrafficConditions] = useState<string>("");
  const [nftImage, setNftImage] = useState<FileList | null>(null);
  const [mediaFiles, setMediaFiles] = useState<FileList | null>(null);
  const [message, setMessage] = useState<string>("");
  const [uploadStatus, setUploadStatus] = useState<string>("");
  const [cid, setCid] = useState<string>("");
  const { address, isConnected, chain } = useAccount();
  const { writeContract } = useWriteContract();

  const { chains, switchChain } = useSwitchChain();

  const _chains = [
    { name: "OP Sepolia", chainId: 11155420 },
    { name: "Arbitrum Sepolia", chainId: 421614 },
    { name: "Avalanche Fuji", chainId: 43113 },
    { name: "Polygon Amoy", chainId: 80002 },
  ];

  if (selectedValue === "11155420") {
    ContractAbi = OptimismAbi;
    ContractAddress = addressData.ccipOptimismAddress;
    _function = "mintOnOptimism";
  }
  if (selectedValue === "421614") {
    ContractAbi = ArbitrumAbi;
    ContractAddress = addressData.ccipArbitrumAddress;
    _function = "mintOnArbitrum";
  }
  if (selectedValue == "43113") {
    ContractAbi = AvalancheAbi;
    ContractAddress = addressData.ccipAvalancheAddress;
    _function = "mintOnSepolia";
  }
  if (selectedValue == "80002") {
    ContractAbi = PolygonAbi;
    ContractAddress = addressData.ccipPolygonAmoyAddress;
    _function = "mintOnOptimism";
  }

  const handleSelectChange = (value: any) => {
    switchChain({ chainId: Number(value) });
    setSelectedValue(value);
  };
  console.log(address, tokenURI, cid, ContractAbi, ContractAddress, _function);

  const mint = async () => {
    try {
      if (!isConnected) toast("User disconnected");

      const tx = writeContract({
        abi: ContractAbi,
        address: ContractAddress,
        functionName: _function,
        // @ts-ignore
        args: [tokenURI, address],
      });
      toast("Minting NFT");
    } catch (error) {
      toast("Trasaction failed , try changing rpc network");
      console.error("Error:", error);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("incidentType", incidentType);
    formData.append("date", date);
    formData.append("time", time);

    formData.append("severity", severity);
    formData.append("name", reporterName);
    formData.append("contactInfo", contactInfo);
    formData.append("vehicleType", vehicleType);
    formData.append("licensePlate", licensePlate);
    formData.append("insuranceInfo", insuranceInfo);
    formData.append("description", description);
    formData.append("weather", weather);
    formData.append("roadConditions", roadConditions);
    formData.append("trafficConditions", trafficConditions);

    if (cid) {
      formData.append("image", cid);
    }

    const requiredFields = [
      "incidentType",
      "date",
      "time",
      "reporterName",
      "severity",
      "contactInfo",
      "vehicleType",
      "licensePlate",
      "insuranceInfo",
      "description",
      "weather",
      "roadConditions",
      "trafficConditions",
    ];

    for (const field of requiredFields) {
      if (!eval(field) || eval(field).trim() === "") {
        toast(`Please fill in the ${field} field.`);
      }
    }

    if (formData) {
      try {
        const response = await fetch("https://parkgho-family.onrender.com/upload-json", {
          method: "POST",
          body: formData,
        });

        const result = await response.json();

        if (response.ok) {
          setMessage("Data saved successfully!");
          console.log(result?.ipfsUrl);
          setTokenURI(result?.ipfsUrl);
        } else {
          setMessage(result.error || "Something went wrong.");
        }
      } catch (error) {
        setMessage("An error occurred while saving the data.");
      }
    }

    if (tokenURI) {
      setSubmitButtonText(" MetaData Uploaded, mint NFT now");
    }

    // Log FormData entries for debugging
    // @ts-ignore
    for (let pair of formData.entries()) {
      console.log(`${pair[0]}: ${pair[1]}`, message);
    }
  };

  const uploadFile = async () => {
    const fileInput = fileInputRef.current;
    if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
      alert("Please select a file to upload");
      return;
    }

    const file = fileInput.files[0];
    setUploadStatus("Uploading...");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("https://parkgho-family.onrender.com/upload-image", {
        method: "POST",
        body: formData
      });

      if (!response.ok) {
        throw new Error("Failed to upload file");
      }

      const result = await response.json();
      console.log("Upload result:", result.ipfsUrl);
      toast("data uploaded to ipfs");

      setUploadStatus(`Upload completed. Your CID is ${result.ipfsCid}`);
      setCid(result.ipfsUrl);
    } catch (error) {
      console.error("Error uploading file:", error);
      toast("error uploading file");
      setUploadStatus("Upload failed. Please try again.");
    }
  };

  return (
    <div className=" mx-3 md:mx-auto mb-4 max-w-4xl mx-auto p-3 bg-white rounded-lg shadow-lg mt-8 mx-3">
      <h1 className="text-2xl font-bold mb-4">Road Incident Report</h1>
      <form onSubmit={handleSubmit} className="md:grid md:grid-cols-2 gap-4">
        <div className="form-group">
          <label className="block text-sm font-medium text-gray-700">
            Incident Type
          </label>
          <select
            value={incidentType}
            onChange={(e) => setIncidentType(e.target.value)}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            <option value="">Select incident type</option>
            <option value="collision">Collision</option>
            <option value="hit-and-run">Hit and Run</option>
            <option value="vehicle-breakdown">Vehicle Breakdown</option>
            <option value="road-hazard">Road Hazard</option>bgt
            <option value="other">Other</option>
          </select>
        </div>
        <div className="form-group">
          <label className="block text-sm font-medium text-gray-700">
            Date
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        <div className="form-group">
          <label className="block text-sm font-medium text-gray-700">
            Time
          </label>
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        {/* {  <div className="form-group block  ">
          <label className="block text-sm font-medium text-gray-700">
            Enter Your Loaction
          </label>
          <Dialog>
            <DialogTrigger asChild>
              <Button
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm py-2 "
                variant="outline"
              >
                {marker
                  ? `${marker.lat}, ${marker.lng}`
                  : "Select Your Loaction"}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[825px]">
              <DialogHeader>
                <DialogTitle>Loaction</DialogTitle>
                <DialogDescription>
                  Enter the incident Loaction here
                </DialogDescription>
              </DialogHeader>
              <Map />
              <DialogFooter>
                <Button type="submit">Save changes</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div> *} */}
        <div className="form-group">
          <label className="block text-sm font-medium text-gray-700">
            Severity
          </label>
          <select
            value={severity}
            onChange={(e) => setSeverity(e.target.value)}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            <option value="Minor">Minor</option>
            <option value="Moderate">Moderate</option>
            <option value="Severe">Severe</option>
          </select>
        </div>
        <div className="form-group">
          <label className="block text-sm font-medium text-gray-700">
            Reporter Name
          </label>
          <input
            type="text"
            value={reporterName}
            onChange={(e) => setReporterName(e.target.value)}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        <div className="form-group">
          <label className="block text-sm font-medium text-gray-700">
            Contact Information
          </label>
          <input
            type="text"
            value={contactInfo}
            onChange={(e) => setContactInfo(e.target.value)}
            placeholder="Phone or Email"
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        <div className="form-group">
          <label className="block text-sm font-medium text-gray-700">
            Vehicle Type
          </label>
          <input
            type="text"
            value={vehicleType}
            onChange={(e) => setVehicleType(e.target.value)}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        <div className="form-group">
          <label className="block text-sm font-medium text-gray-700">
            License Plate Number
          </label>
          <input
            type="text"
            value={licensePlate}
            onChange={(e) => setLicensePlate(e.target.value)}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        <div className="form-group">
          <label className="block text-sm font-medium text-gray-700">
            Insurance Information
          </label>
          <input
            type="text"
            value={insuranceInfo}
            onChange={(e) => setInsuranceInfo(e.target.value)}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>

        <div className="form-group">
          <label className="block text-sm font-medium text-gray-700">
            Incident Image
          </label>
          <input
            type="file"
            ref={fileInputRef}
            id="fileUpload"
            onChange={uploadFile}
            className="mt-1 mb-2 md:mb-0 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>

        <div className="form-group col-span-2">
          <label className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        <div className="form-group">
          <label className="block text-sm font-medium text-gray-700">
            Weather Conditions
          </label>
          <input
            type="text"
            value={weather}
            onChange={(e) => setWeather(e.target.value)}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        <div className="form-group">
          <label className="block text-sm font-medium text-gray-700">
            Road Conditions
          </label>
          <input
            type="text"
            value={roadConditions}
            onChange={(e) => setRoadConditions(e.target.value)}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        <div className="form-group">
          <label className="block text-sm font-medium text-gray-700">
            Traffic Conditions
          </label>
          <input
            type="text"
            value={trafficConditions}
            onChange={(e) => setTrafficConditions(e.target.value)}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>

        <div className="mt-6 mb-6">
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
                <SelectItem
                  disabled={!isConnected}
                  value={_chains[0].chainId.toString()}
                >
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
                <SelectItem
                  disabled={!isConnected}
                  value={_chains[1].chainId.toString()}
                >
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
                <SelectItem
                  disabled={!isConnected}
                  value={_chains[2].chainId.toString()}
                >
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
                <SelectItem
                  disabled={!isConnected}
                  value={_chains[3].chainId.toString()}
                >
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
        </div>

        <div>
          
        </div>


        {!tokenURI ? (
            <button
              disabled={!selectedValue || !cid}
              type="submit"
              className="w-full   py-2 px-4 bg-indigo-600 text-white font-semibold rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-red-400 disabled:cursor-not-allowed"
            >
              {!submitButtonText ? " Submit Report" : submitButtonText}
            </button>
        ) : (
          <button
            disabled={!selectedValue || !cid}
            // type="submit"
            onClick={mint}
            className="w-full py-2 px-4 bg-indigo-600 text-white font-semibold rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-red-400 disabled:cursor-not-allowed"
          >
            Mint NFT
          </button>
        )}
      </form>
      {message && <p className="mt-4 text-center text-green-600">{message}</p>}
      <ToastContainer />
    </div>
  );
};

export default IncidentReportForm;

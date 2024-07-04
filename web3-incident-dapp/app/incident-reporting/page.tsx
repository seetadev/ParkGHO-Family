// /app/components/IncidentReportForm.tsx
"use client";
import { useState, FormEvent } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Image from "next/image";
import { useAccount, useWriteContract, useSwitchChain } from "wagmi";
import addressData from "../../utils/address.json";
import AvalancheAbi from "../../utils/AvalancheAbi.json";
import OptimismAbi from "../../utils/OptimismAbi.json";
import ArbitrumAbi from "../../utils/ArbitrumAbi.json";
import PolygonAbi from "../../utils/PolygonAmoy.json";
import { ToastContainer, toast } from "react-toastify";

const IncidentReportForm: React.FC = () => {
  var ContractAbi: any;
  var ContractAddress: any;
  var _function: any;

  const [selectedValue, setSelectedValue] = useState("");
  const [incidentType, setIncidentType] = useState<string>("");
  const [date, setDate] = useState<string>("");
  const [time, setTime] = useState<string>("");
  const [location, setLocation] = useState<string>("");
  const [severity, setSeverity] = useState<string>("Minor");
  const [reporterName, setReporterName] = useState<string>("");
  const [contactInfo, setContactInfo] = useState<string>("");
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

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("incidentType", incidentType);
    formData.append("date", date);
    formData.append("time", time);
    formData.append("location", location);
    formData.append("severity", severity);
    formData.append("reporterName", reporterName);
    formData.append("contactInfo", contactInfo);
    formData.append("vehicleType", vehicleType);
    formData.append("licensePlate", licensePlate);
    formData.append("insuranceInfo", insuranceInfo);
    formData.append("description", description);
    formData.append("weather", weather);
    formData.append("roadConditions", roadConditions);
    formData.append("trafficConditions", trafficConditions);

    if (nftImage) {
      formData.append("nftImage", nftImage[0]);
    }

    if (mediaFiles) {
      Array.from(mediaFiles).forEach((file) => {
        formData.append("mediaFiles", file);
      });
    }

    // Log FormData entries for debugging
    // @ts-ignore
    for (let pair of formData.entries()) {
      console.log(`${pair[0]}: ${pair[1]}`);
    }
  };

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

  const handleSelectChange = (value: any) => {
    console.log("Selected value:", value);
    setSelectedValue(value);
    switchChain({ chainId: Number(value) });
  };


  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg mt-8">
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
            <option value="">Select Type</option>
            <option value="Accident">Accident</option>
            <option value="Traffic Violation">Traffic Violation</option>
            <option value="Road Hazard">Road Hazard</option>
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
        <div className="form-group">
          <label className="block text-sm font-medium text-gray-700">
            Location
          </label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Address or Coordinates"
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
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
        <div className="form-group">
          <label className="block text-sm font-medium text-gray-700">
            NFT Image
          </label>
          <input
            type="file"
            onChange={(e) => setNftImage(e.target.files)}
            className="mt-1 mb-2 md:mb-0 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        

        <div>
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
                <SelectItem value={_chains[0].chainId.toString()}>
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
                <SelectItem value={_chains[1].chainId.toString()}>
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
                <SelectItem value={_chains[2].chainId.toString()}>
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
                <SelectItem value={_chains[3].chainId.toString()}>
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


        <button
          type="submit"
          className="w-full py-2 px-4 bg-indigo-600 text-white font-semibold rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          Submit Report
        </button>
      </form>
      {message && <p className="mt-4 text-center text-green-600">{message}</p>}
      <ToastContainer />
    </div>
  );
};

export default IncidentReportForm;

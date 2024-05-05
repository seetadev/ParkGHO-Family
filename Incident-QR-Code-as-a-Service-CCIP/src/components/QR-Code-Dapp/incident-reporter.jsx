
import { useState } from 'react';

const IncidentReporter = () => {
  // State variables for incident details
  const [incidentName, setIncidentName] = useState('');
  const [reporterName, setReporterName] = useState('');
  const [metamaskAddress, setMetamaskAddress] = useState('');
  const [incidentLevel, setIncidentLevel] = useState('medium');
  const [description, setDescription] = useState('');
  const [incidentImage, setIncidentImage] = useState(null);

  // Function to handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    // Here, you can add the logic to submit the incident report to the blockchain or any other desired action.
    console.log('Incident Report:', {
      incidentName,
      reporterName,
      metamaskAddress,
      incidentLevel,
      description,
      incidentImage,
    });
  };

  return (
    <div className="bg-gray-100 min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full mx-auto bg-white rounded-lg shadow-md p-6 sm:p-8 md:p-10">
        <h1 className="text-2xl font-bold mb-6 text-center">Incident Reporter</h1>
        <form onSubmit={handleSubmit}>
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
          {/* Metamask Address */}
          <div className="mb-4">
            <label htmlFor="metamaskAddress" className="block font-bold mb-2">
              Metamask Address
            </label>
            <input
              type="text"
              id="metamaskAddress"
              value={metamaskAddress}
              onChange={(e) => setMetamaskAddress(e.target.value)}
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
              onChange={(e) => setIncidentImage(e.target.files[0])}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              accept="image/*"
            />
          </div>
          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-2 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors duration-300"
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
};

export default IncidentReporter;

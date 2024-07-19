const express = require('express');
const multer = require('multer');
const fs = require('fs/promises');
const path = require('path');
const os = require('os');
const lighthouse = require('@lighthouse-web3/sdk');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 5000;

// CORS Configuration
app.use(cors({
  origin: '*' // Allow requests from this origin
  // You can also use '*' to allow all origins but it's not recommended for production
}));

// Multer configuration
const upload = multer({ storage: multer.memoryStorage() });

// Upload image to IPFS
app.post('/upload-image', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const buffer = req.file.buffer;
    const relativeUploadDir = `/uploads/${Date.now()}`;
    const uploadDir = path.join(os.tmpdir(), relativeUploadDir);

    await fs.mkdir(uploadDir, { recursive: true });

    const filePath = path.join(uploadDir, req.file.originalname);
    await fs.writeFile(filePath, buffer);

    const apiKey = "fcbfd699.ae5a55ea035c49afbd948162e1a38f9a";
    const uploadResponse = await lighthouse.upload(filePath, apiKey);

    // Clean up: remove the temporary file
    await fs.unlink(filePath);

    res.json({
      message: 'File uploaded successfully',
      fileName: req.file.originalname,
      ipfsCid: uploadResponse.data.Hash,
      ipfsUrl: `https://gateway.lighthouse.storage/ipfs/${uploadResponse.data.Hash}`
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ error: 'Error uploading file to IPFS' });
  }
});

// Upload JSON metadata to IPFS
app.post('/upload-json', upload.none(), async (req, res) => {
  try {
    const {
      incidentType,
      date,
      time,
      severity,
      name,
      contactInfo,
      vehicleType,
      licensePlate,
      insuranceInfo,
      description,
      weather,
      roadConditions,
      trafficConditions,
      image
    } = req.body;

    // Validate required fields
    if (
      !incidentType ||
      !date ||
      !time ||
      !severity ||
      !name ||
      !contactInfo ||
      !vehicleType ||
      !licensePlate ||
      !insuranceInfo ||
      !description ||
      !weather ||
      !roadConditions ||
      !trafficConditions ||
      !image
    ) {
      return res.status(400).json({ error: 'Incomplete data provided' });
    }

    const relativeUploadDir = `/uploads/${Date.now()}`;
    const uploadDir = path.join(os.tmpdir(), relativeUploadDir);
    await fs.mkdir(uploadDir, { recursive: true });

    const jsonData = {
      incidentType,
      date,
      time,
      severity,
      name,
      contactInfo,
      vehicleType,
      licensePlate,
      insuranceInfo,
      description,
      weather,
      roadConditions,
      trafficConditions,
      image
    };

    const jsonFilePath = path.join(uploadDir, 'data.json');
    await fs.writeFile(jsonFilePath, JSON.stringify(jsonData, null, 2));

    const apiKey = "fcbfd699.ae5a55ea035c49afbd948162e1a38f9a";
    const uploadResponse = await lighthouse.upload(jsonFilePath, apiKey);

    // Clean up: remove the temporary JSON file
    await fs.unlink(jsonFilePath);

    res.json({
      message: 'Data and file saved successfully',
      ipfsCid: uploadResponse.data.Hash,
      ipfsUrl: `https://gateway.lighthouse.storage/ipfs/${uploadResponse.data.Hash}`
    });
  } catch (error) {
    console.error('Error saving data:', error);
    res.status(500).json({ error: 'Error saving data' });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

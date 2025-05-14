const express = require("express");
const fileUpload = require("express-fileupload");
const pinataSDK = require("@pinata/sdk");
const cors = require("cors");
const { Readable } = require("stream"); // Import Readable to create streams from Buffer
require("dotenv").config();

const app = express();
const port = 5000;

// Initialize Pinata SDK
const pinata = new pinataSDK({
  pinataApiKey: process.env.PINATA_API_KEY,
  pinataSecretApiKey: process.env.PINATA_API_SECRET,
});

// Middleware
app.use(cors({ origin: "http://localhost:3000" })); // Explicitly allow frontend origin
app.use(fileUpload()); // Handle file uploads
app.use(express.json());

// Test endpoint
app.get("/", (req, res) => {
  res.send("Pinata Upload Backend is running");
});

// Upload endpoint
app.post("/upload", async (req, res) => {
  try {
    // Check if a file is uploaded
    if (!req.files || !req.files.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const file = req.files.file;

    // Validate file type (only PDFs)
    if (file.mimetype !== "application/pdf") {
      return res.status(400).json({ error: "Only PDF files are allowed" });
    }

    // Convert Buffer to Readable stream
    const stream = Readable.from(file.data);

    // Upload to Pinata
    const options = {
      pinataMetadata: {
        name: file.name,
      },
      pinataOptions: {
        cidVersion: 0,
      },
    };

    const result = await pinata.pinFileToIPFS(stream, options);
    const ipfsHash = result.IpfsHash;

    res.json({ ipfsHash });
  } catch (error) {
    console.error("Error uploading to Pinata:", error.message, error.response?.data);
    res.status(500).json({ error: "Failed to upload file to Pinata" });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
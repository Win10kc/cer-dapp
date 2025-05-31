const express = require("express");
const fileUpload = require("express-fileupload");
const pinataSDK = require("@pinata/sdk");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { Readable } = require("stream");
require("dotenv").config();

const app = express();
const port = 5000;

// Initialize Pinata SDK
const pinata = new pinataSDK({
  pinataApiKey: process.env.PINATA_API_KEY,
  pinataSecretApiKey: process.env.PINATA_API_SECRET,
});

// Hardcoded user list (for demo purposes)
const users = [
  {
    username: "admin",
    // Password: admin123 (hashed using bcrypt)
    password: "$2a$12$Jn0JyOTEQGHrciASrKI7juPV/2TpDw6qb7yEsSqtjdOcq0TQ9p22e", // bcrypt hash of "admin123"
    role: "admin",
  },
];

// JWT Secret (should be stored in .env for production)
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key";

// Middleware
app.use(cors({ origin: "http://localhost:3000" }));
app.use(fileUpload());
app.use(express.json());

// Middleware to verify JWT token and role
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer <token>

  if (!token) {
    return res.status(401).json({ error: "Access denied: No token provided" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;

    // Check if the user has the admin role
    if (decoded.role !== "admin") {
      return res.status(403).json({ error: "Access denied: Admin role required" });
    }

    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
};

// Login endpoint
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required" });
  }

  const user = users.find(u => u.username === username);
  if (!user) {
    return res.status(401).json({ error: "Invalid username or password" });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return res.status(401).json({ error: "Invalid username or password" });
  }

  // Generate JWT token
  const token = jwt.sign({ username: user.username, role: user.role }, JWT_SECRET, { expiresIn: "1h" });
  res.json({ token, role: user.role });
});

// Test endpoint
app.get("/", (req, res) => {
  res.send("Pinata Upload Backend is running");
});

// Protected upload endpoint
app.post("/upload", authenticateToken, async (req, res) => {
  try {
    if (!req.files || !req.files.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const file = req.files.file;
    if (file.mimetype !== "application/pdf") {
      return res.status(400).json({ error: "Only PDF files are allowed" });
    }

    const stream = Readable.from(file.data);
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
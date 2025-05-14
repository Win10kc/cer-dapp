const pinataSDK = require("@pinata/sdk");
const fs = require("fs");
require("dotenv").config();

const pinata = new pinataSDK({
  pinataApiKey: process.env.PINATA_API_KEY,
  pinataSecretApiKey: process.env.PINATA_API_SECRET,
});

async function uploadToIPFS(filePath) {
  try {
    const stream = fs.createReadStream(filePath);
    const options = {
      pinataMetadata: {
        name: "certificate.pdf",
      },
      pinataOptions: {
        cidVersion: 0,
      },
    };

    const result = await pinata.pinFileToIPFS(stream, options);
    console.log("File uploaded to IPFS with CID:", result.IpfsHash);
    return result.IpfsHash;
  } catch (error) {
    console.error("Error uploading to IPFS:", error);
    throw error;
  }
}

// Example usage
uploadToIPFS("./sample-certificate.pdf")
  .then((cid) => console.log("Success! CID:", cid))
  .catch((error) => console.error(error));
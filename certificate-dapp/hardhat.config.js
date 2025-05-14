require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
  solidity: "0.8.0",
  networks: {
    sepolia: {
      url: process.env.SEPOLIA_URL || "https://sepolia.infura.io/v3/16b5394a180a40ea9cfc5f5cdbbeaaf0",
      accounts: [process.env.PRIVATE_KEY]
    }
  }
};
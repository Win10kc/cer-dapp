const hre = require("hardhat");

async function main() {
  // Get the contract factory
  const EducationCertificate = await hre.ethers.getContractFactory("EducationCertificate");
  
  // Deploy the contract
  const certificate = await EducationCertificate.deploy();
  
  // Wait for the deployment transaction to be mined
  await certificate.waitForDeployment();
  
  // Get the deployed contract address
  const contractAddress = await certificate.getAddress();
  console.log("EducationCertificate deployed to:", contractAddress);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
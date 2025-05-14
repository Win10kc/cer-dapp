// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract EducationCertificate {
    struct Certificate {
        string level; // e.g., Bachelor, Master
        uint256 issueDate; // Timestamp
        string ipfsHash; // IPFS hash of the PDF
        address issuer; // Address of the issuing institution
    }

    mapping(address => Certificate) public certificates;
    address public admin;

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }

    constructor() {
        admin = msg.sender; // Set deployer as admin
    }

    function issueCertificate(
        address student,
        string memory level,
        string memory ipfsHash
    ) public onlyAdmin {
        certificates[student] = Certificate(
            level,
            block.timestamp,
            ipfsHash,
            msg.sender
        );
    }

    function getCertificate(address student)
        public
        view
        returns (
            string memory level,
            uint256 issueDate,
            string memory ipfsHash,
            address issuer
        )
    {
        Certificate memory cert = certificates[student];
        return (cert.level, cert.issueDate, cert.ipfsHash, cert.issuer);
    }
}
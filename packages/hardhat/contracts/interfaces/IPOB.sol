//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

interface IPOB {
  struct PobCollectionContract {
    address pobAddress; // Pob Collection contract address
    string name; // Name of the Pob Collection
    string symbol; // Symbol of the Pob Collection ("POB")
    string globalTokenUri; // URI of the base URI metadata
    uint256 maxSupply; // Maximum number of tokens available for minting
    uint256 mintExpirationDate; // Date limit for minting
    uint256 pobCollectionId; // Pob Collection "tokenId"-like identifier
    uint256 tokenId; // Minted NFT tokenId by user and saved into profile
    bool isApprovedByProfile; // Determines if POB will be shown in Profile
  }
}

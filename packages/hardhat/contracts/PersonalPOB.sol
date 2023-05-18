//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import {MerkleProof} from "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "./interfaces/IPersonalPOB.sol";
import "./interfaces/IPOEPProfileFactory.sol";
import "./interfaces/IPOEPProfile.sol";

contract PersonalPOB is IPersonalPOB, ERC721, ERC721Enumerable, ERC721URIStorage, Ownable {
  using Counters for Counters.Counter;

  Counters.Counter private _tokenIdCounter;
  address private _pobAdmin;
  address private _POBProfileFactoryAddress;
  string public globalTokenURI;
  uint256 public collectionId;
  uint256 public maxSupply;
  uint256 public mintExpirationDate;
  mapping(address => uint256) userAddressToTokenId;
  mapping(address => uint256) profileAddressToTokenId;
  bytes32 immutable qrMerkleRoot;
  mapping(address => bool) public hasClaimed;

  constructor(
    string memory name_,
    string memory symbol_,
    string memory globalTokenURI_,
    address pobAdmin_,
    uint256 collectionId_,
    uint256 maxSupply_,
    uint256 mintExpirationPeriod_,
    address POBProfileFactoryAddress_,
    bytes32 qrMerkleRoot_
  ) ERC721(name_, symbol_) {
    _pobAdmin = pobAdmin_;
    _POBProfileFactoryAddress = POBProfileFactoryAddress_;
    globalTokenURI = globalTokenURI_;
    collectionId = collectionId_;
    maxSupply = maxSupply_;
    mintExpirationDate = block.timestamp + mintExpirationPeriod_;
    qrMerkleRoot = qrMerkleRoot_; // NB: Also fine to omit
  }

  function safeMint(address to) external {
    require(qrMerkleRoot == 0, "POB requires key to mint");
    mintInternal(to);
  }

  function safeMintWithMerkleProof(address to, bytes calldata signature, bytes32[] calldata merkleProof) external {
    require(qrMerkleRoot != 0, "POB does not require key to mint");
    bytes32 hash = keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n20", to));
    address qrPubKey = ECDSA.recover(
      hash,
      uint8(bytes1(signature[64:65])),
      bytes32(signature[0:32]),
      bytes32(signature[32:64])
    );
    bytes32 leaf = keccak256(abi.encodePacked(qrPubKey));
    require(MerkleProof.verify(merkleProof, qrMerkleRoot, leaf), "Invalid proof(s)");
    require(!hasClaimed[qrPubKey], "QR code already claimed");
    hasClaimed[qrPubKey] = true;
    mintInternal(to);
  }

  function mintInternal(address to_) internal {
    uint256 tokenId = _tokenIdCounter.current() + 1;
    _tokenIdCounter.increment();
    require(tokenId <= maxSupply, "PersonalPOB: Maximum supply reached");
    require(this.balanceOf(to_) == 0, "PersonalPOB: Only one POB per address");

    address toProfileAddress = IPOEPProfileFactory(_POBProfileFactoryAddress).getUserAddressToProfile(to_);
    _safeMint(to_, tokenId);
    _setTokenURI(tokenId, globalTokenURI);

    PobCollectionContract memory newPobCollectionContract = PobCollectionContract({
      pobAddress: address(this),
      name: name(),
      symbol: symbol(),
      globalTokenUri: globalTokenURI,
      maxSupply: maxSupply,
      mintExpirationDate: mintExpirationDate,
      pobCollectionId: collectionId,
      tokenId: tokenId,
      isApprovedByProfile: false
    });

    if (toProfileAddress != address(0)) {
      profileAddressToTokenId[toProfileAddress] = tokenId;
      IPOEPProfile(toProfileAddress).addMintedPob(newPobCollectionContract);
    }
    IPOEPProfileFactory(_POBProfileFactoryAddress).addMintedPob(to_, newPobCollectionContract);

    userAddressToTokenId[toProfileAddress] = tokenId;
  }

  function setGlobalTokenURI(string memory newGlobalTokenURI_) external onlyAdmin {
    globalTokenURI = newGlobalTokenURI_;
  }

  modifier onlyAdmin() {
    require(_msgSender() == _pobAdmin, "Personal POB: Caller is not the Admin");
    _;
  }

  // The following functions are overrides required by Solidity.

  function _beforeTokenTransfer(
    address from_,
    address to_,
    uint256 tokenId_,
    uint256 batchSize_
  ) internal override(ERC721, ERC721Enumerable) {
    super._beforeTokenTransfer(from_, to_, tokenId_, batchSize_);
  }

  function _burn(uint256 tokenId_) internal override(ERC721, ERC721URIStorage) {
    super._burn(tokenId_);
  }

  function tokenURI(uint256 tokenId_) public view override(ERC721, ERC721URIStorage) returns (string memory) {
    return super.tokenURI(tokenId_);
  }

  function supportsInterface(bytes4 interfaceId_) public view override(ERC721, ERC721Enumerable) returns (bool) {
    return super.supportsInterface(interfaceId_);
  }
}

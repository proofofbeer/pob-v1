//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import {MerkleProof} from "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "./interfaces/IPOB.sol";
import "./interfaces/IPOBFactory.sol";

contract POB is IPOB, ERC721, ERC721Enumerable, ERC721URIStorage, Ownable {
  using Counters for Counters.Counter;

  Counters.Counter private _tokenIdCounter;
  address private _pobFactoryAddress;
  string public globalTokenURI;
  uint256 public collectionId;
  uint256 public maxSupply;
  bytes32 immutable qrMerkleRoot;
  mapping(address => uint256) userAddressToTokenId;
  mapping(address => bool) public hasClaimed;

  constructor(
    string memory name_,
    string memory symbol_,
    string memory globalTokenURI_,
    uint256 maxSupply_,
    uint256 collectionId_,
    bytes32 qrMerkleRoot_
  ) ERC721(name_, symbol_) {
    globalTokenURI = globalTokenURI_;
    collectionId = collectionId_;
    maxSupply = maxSupply_;
    qrMerkleRoot = qrMerkleRoot_;
  }

  function safeMint(address to_) external {
    require(qrMerkleRoot == 0, "POB: A key is required to mint");
    mintInternal(to_);
  }

  function safeMintWithMerkleProof(address to_, bytes calldata signature_, bytes32[] calldata merkleProof_) external {
    require(qrMerkleRoot != 0, "POB: There is no key required to mint");
    bytes32 hash = keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n20", to_));
    address qrPubKey = ECDSA.recover(
      hash,
      uint8(bytes1(signature_[64:65])),
      bytes32(signature_[0:32]),
      bytes32(signature_[32:64])
    );
    bytes32 leaf = keccak256(abi.encodePacked(qrPubKey));
    require(MerkleProof.verify(merkleProof_, qrMerkleRoot, leaf), "POB: Invalid proof(s)");
    require(!hasClaimed[qrPubKey], "POB: QR code already claimed");
    hasClaimed[qrPubKey] = true;
    mintInternal(to_);
  }

  function mintInternal(address to_) internal {
    uint256 tokenId = _tokenIdCounter.current() + 1;
    _tokenIdCounter.increment();
    require(tokenId <= maxSupply, "POB: Maximum supply reached");

    _safeMint(to_, tokenId);
    _setTokenURI(tokenId, globalTokenURI);

    PobCollectionContract memory newPobCollectionContract = PobCollectionContract({
      pobAddress: address(this),
      name: name(),
      symbol: symbol(),
      globalTokenUri: globalTokenURI,
      maxSupply: maxSupply,
      pobCollectionId: collectionId,
      tokenId: tokenId
    });

    userAddressToTokenId[_msgSender()] = tokenId;
    IPOBFactory(_pobFactoryAddress).addMintedPob(newPobCollectionContract, to_);
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

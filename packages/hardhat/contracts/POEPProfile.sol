//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

// Useful for debugging. Remove when deploying to a live network.
import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "./interfaces/IPOEPProfile.sol";

contract POEPProfile is IPOEPProfile, ERC721, ERC721Enumerable, ERC721URIStorage, Ownable {
  using Counters for Counters.Counter;

  Counters.Counter private _tokenIdCounter;
  string public globalTokenURI;
  uint256 public timeUntilNextChange;
  uint256 public requestChangeGlobalTokenURIPrice;
  address payable public paymentAddress;
  address[] public mintedPobAddresses;

  constructor(
    string memory name_,
    string memory symbol_,
    uint256 changePeriod_,
    uint256 requestChangeGlobalTokenURIPrice_,
    address paymentAddress_
  ) ERC721(name_, symbol_) {
    timeUntilNextChange = changePeriod_;
    requestChangeGlobalTokenURIPrice = requestChangeGlobalTokenURIPrice_;
    paymentAddress = payable(paymentAddress_);
  }

  function safeMint(address to) public {
    uint256 tokenId = _tokenIdCounter.current();
    _tokenIdCounter.increment();
    _safeMint(to, tokenId);
    _setTokenURI(tokenId, globalTokenURI);
  }

  function changeGlobalTokenURI(string memory newGlobalTokenURI_) public onlyOwner {
    require(block.timestamp > timeUntilNextChange, "POEPProfile: Profile URI change not ready");
    _setGlobalTokenURI(newGlobalTokenURI_);
  }

  function requestChangeGlobalTokenURI(string memory newGlobalTokenURI_) public payable onlyOwner {
    require(msg.value > requestChangeGlobalTokenURIPrice, "POEPProfile: Not enough MATIC to request token URI change");
    paymentAddress.transfer(msg.value);
    _setGlobalTokenURI(newGlobalTokenURI_);
  }

  function addMintedPobAddress(address pobAddress_, address msgSender_) external {
    require(msgSender_ == owner(), "POEPProfile: Only Profile owner can trigger this function");
    mintedPobAddresses.push(pobAddress_);
  }

  function _setGlobalTokenURI(string memory newGlobalTokenURI_) private {
    globalTokenURI = newGlobalTokenURI_;
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

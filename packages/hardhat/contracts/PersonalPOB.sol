//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

// Useful for debugging. Remove when deploying to a live network.
import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "./interfaces/IPersonalPOB.sol";
import "./interfaces/IPOEPProfile.sol";

contract PersonalPOB is IPersonalPOB, ERC721, ERC721Enumerable, ERC721URIStorage, Ownable {
  using Counters for Counters.Counter;

  Counters.Counter private _tokenIdCounter;
  address private _pobAdmin;
  string public globalTokenURI;
  uint256 public maxSupply = 25;

  constructor(string memory name_, string memory globalTokenURI_, address pobAdmin_) ERC721(name_, "POB") {
    globalTokenURI = globalTokenURI_;
    _pobAdmin = pobAdmin_;
  }

  function safeMint(address to_, address profileAddress_) external {
    uint256 tokenId = _tokenIdCounter.current();
    require(tokenId < maxSupply - 1, "PersonalPOB: Maximum supply reached");
    require(this.balanceOf(to_) == 0, "PersonalPOB: Only one POB per address");
    _safeMint(to_, tokenId);
    _setTokenURI(tokenId, globalTokenURI);
    _tokenIdCounter.increment();
    IPOEPProfile(profileAddress_).addMintedPobAddress(address(this), _msgSender());
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

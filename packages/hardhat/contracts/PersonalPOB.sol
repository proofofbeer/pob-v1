//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

// Useful for debugging. Remove when deploying to a live network.
import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract PersonalPOB is ERC721, ERC721Enumerable, ERC721URIStorage, Ownable {
  using Counters for Counters.Counter;

  Counters.Counter private _tokenIdCounter;
  string public globalTokenURI;
  uint256 public maxSupply = 25;

  constructor(string memory _name, string memory _globalTokenURI) ERC721(_name, "POB") {
    globalTokenURI = _globalTokenURI;
  }

  function safeMint(address _to) public {
    uint256 tokenId = _tokenIdCounter.current();
    require(tokenId < maxSupply - 1, "PersonalPOB: Maximum supply reached");
    require(this.balanceOf(_to) == 0, "PersonalPOB: Only one POB per address");
    _safeMint(_to, tokenId);
    _setTokenURI(tokenId, globalTokenURI);
    _tokenIdCounter.increment();
  }

  // The following functions are overrides required by Solidity.

  function _beforeTokenTransfer(address from, address to, uint256 tokenId, uint256 batchSize)
        internal
        override(ERC721, ERC721Enumerable)
    {
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
    }

    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function setGlobalTokenURI(string memory _uri) public onlyOwner {
        console.log(_uri);
        globalTokenURI = _uri;
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}

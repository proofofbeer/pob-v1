//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "./PersonalPOB.sol";
import "./interfaces/IPOEPProfileFactory.sol";
import "./interfaces/IPersonalPOB.sol";

contract PersonalPOBFactory is Ownable {
  struct PobCollectionContract {
    address pobAddress; // Pob Collection contract address
    string name; // Name of the Pob Collection
    string symbol; // Symbol of the Pob Collection ("POB")
    string globalTokenUri; // URI of the base URI metadata
    uint256 maxSupply; // Maximum number of tokens available for minting
    uint256 mintExpirationDate; // Date limit for minting
    uint256 pobCollectionId; // Pob Collection "tokenId"-like identifier
    uint256 tokenId; // tokenId = 0 always for creator of POBCollectionContract
  }

  string private _pobVersion;
  uint256 public pobTotalSupply;
  uint256 public pobContractPrice;
  uint256 public pobContractMaxSupply;
  uint256 public mintExpirationPeriod;
  address private _POBProfileFactoryAddress;
  address private _withdrawFundsAddress;
  PobCollectionContract[] public pobCollectionContractList;
  mapping(address => PobCollectionContract[]) public userAddressToPobCollectionContract;
  mapping(address => PobCollectionContract[]) public profileAddressToPobCollectionContract;

  constructor(
    string memory deployedPobVersion_,
    address deployedPOBProfileFactoryAddress_,
    uint256 pobContractPrice_,
    uint256 pobContractMaxSupply_,
    uint256 mintExpirationPeriod_
  ) {
    _pobVersion = deployedPobVersion_;
    _POBProfileFactoryAddress = deployedPOBProfileFactoryAddress_;
    _withdrawFundsAddress = deployedPOBProfileFactoryAddress_;
    pobContractPrice = pobContractPrice_ * 10 ** 18;
    pobContractMaxSupply = pobContractMaxSupply_;
    mintExpirationPeriod = mintExpirationPeriod_;
    pobTotalSupply = 0;
  }

  function createNewPersonalPob(
    string memory pobCollectionName_,
    string memory pobCollectionSymbol_,
    address userAddress_,
    address profileAddress_,
    string memory globalTokenURI_
  ) public payable {
    require(msg.value >= pobContractPrice, "POBFactory: Not enough MATIC to purchase POB Contract");
    require(
      IPOEPProfileFactory(_POBProfileFactoryAddress).getUserAddressToProfile(userAddress_) != address(0),
      "POBFactory: User does not have Profile"
    );
    PersonalPOB newPersonalPob = new PersonalPOB(
      pobCollectionName_,
      pobCollectionSymbol_,
      globalTokenURI_,
      owner(),
      pobTotalSupply,
      pobContractMaxSupply,
      mintExpirationPeriod,
      _POBProfileFactoryAddress
    );
    newPersonalPob.transferOwnership(_msgSender());
    newPersonalPob.safeMint(_msgSender());
    PobCollectionContract memory newPobCollectionContract = PobCollectionContract({
      pobAddress: address(newPersonalPob),
      name: pobCollectionName_,
      symbol: pobCollectionSymbol_,
      globalTokenUri: globalTokenURI_,
      maxSupply: pobContractMaxSupply,
      mintExpirationDate: block.timestamp + mintExpirationPeriod,
      pobCollectionId: pobTotalSupply,
      tokenId: 0
    });
    pobCollectionContractList.push(newPobCollectionContract);
    ++pobTotalSupply;
    userAddressToPobCollectionContract[userAddress_].push(newPobCollectionContract);
    profileAddressToPobCollectionContract[profileAddress_].push(newPobCollectionContract);
  }

  function getUserPobCollections(address userAddress_) public view returns (PobCollectionContract[] memory) {
    uint256 arrayLength = userAddressToPobCollectionContract[userAddress_].length;
    PobCollectionContract[] memory userPobCollections = new PobCollectionContract[](arrayLength);

    for (uint256 i = 0; i < arrayLength; i++) {
      userPobCollections[i] = userAddressToPobCollectionContract[userAddress_][i];
    }

    return userPobCollections;
  }

  function getProfilePobCollections(address profileAddress_) public view returns (PobCollectionContract[] memory) {
    uint256 arrayLength = profileAddressToPobCollectionContract[profileAddress_].length;
    PobCollectionContract[] memory profilePobCollections = new PobCollectionContract[](arrayLength);

    for (uint256 i = 0; i < arrayLength; i++) {
      profilePobCollections[i] = userAddressToPobCollectionContract[profileAddress_][i];
    }

    return profilePobCollections;
  }

  function withdraw(uint256 amount_) public onlyOwner {
    require(amount_ <= address(this).balance, "POBFactory:Insufficient balance in the contract");
    payable(_withdrawFundsAddress).transfer(amount_);
  }

  receive() external payable {}

  fallback() external payable {}
}

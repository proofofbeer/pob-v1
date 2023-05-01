//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "./PersonalPOB.sol";
import "./interfaces/IPOEPProfileFactory.sol";
import "./interfaces/IPersonalPOB.sol";

contract PersonalPOBFactory is Ownable {
  string private _pobVersion;
  uint256 public pobTotalSupply;
  uint256 public pobContractPrice;
  uint256 public mintExpirationPeriod;
  address private _POBProfileFactoryAddress;
  address private _withdrawFundsAddress;
  PersonalPOB[] public personalPobArray;
  mapping(address => address[]) public userAddressToPobAddresses;
  mapping(address => address[]) public profileAddressToPobAddresses;

  constructor(
    string memory deployedPobVersion_,
    address deployedPOBProfileFactoryAddress_,
    uint256 pobContractPrice_,
    uint256 mintExpirationPeriod_
  ) {
    _pobVersion = deployedPobVersion_;
    _POBProfileFactoryAddress = deployedPOBProfileFactoryAddress_;
    _withdrawFundsAddress = deployedPOBProfileFactoryAddress_;
    pobContractPrice = pobContractPrice_;
    mintExpirationPeriod = mintExpirationPeriod_;
    pobTotalSupply = 0;
  }

  function createNewPersonalPob(
    string memory collectionName_,
    address userAddress_,
    address profileAddress_,
    string memory globalTokenURI_
  ) public payable {
    require(msg.value >= pobContractPrice, "POBFactory: Not enough MATIC to purchase POB Contract");
    require(
      IPOEPProfileFactory(_POBProfileFactoryAddress).getUserAddressToProfile(userAddress_) != address(0),
      "POBFactory: User does not have Profile"
    );
    PersonalPOB newPersonalPob = new PersonalPOB(collectionName_, globalTokenURI_, owner(), mintExpirationPeriod);
    newPersonalPob.transferOwnership(_msgSender());
    personalPobArray.push(newPersonalPob);
    ++pobTotalSupply;
    userAddressToPobAddresses[userAddress_].push(address(newPersonalPob));
    profileAddressToPobAddresses[profileAddress_].push(address(newPersonalPob));
  }

  function getUserPobAddresses(address userAddress_) public view returns (address[] memory) {
    return userAddressToPobAddresses[userAddress_];
  }

  function getProfilePobAddresses(address userAddress_) public view returns (address[] memory) {
    return profileAddressToPobAddresses[userAddress_];
  }

  function withdraw(uint256 amount_) public onlyOwner {
    require(amount_ <= address(this).balance, "POBFactory:Insufficient balance in the contract");
    payable(_withdrawFundsAddress).transfer(amount_);
  }

  receive() external payable {}

  fallback() external payable {}
}

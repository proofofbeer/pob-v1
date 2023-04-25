//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "./PersonalPOB.sol";
import "./interfaces/IPOEPProfileFactory.sol";

contract PersonalPOBFactory is Ownable {
  string private _pobVersion;
  uint256 public pobTotalSupply;
  uint256 public pobContractPrice;
  address private _POBProfileFactoryAddress;
  PersonalPOB[] public personalPobArray;
  mapping (address => address) public userAddressToPobAddress;
  mapping (address => address) public profileAddressToPobAddress;
  mapping (address => uint256) public profileAddressToPobExpiration;

  constructor(string memory _deployedPobVersion, address _deployedPOBProfileFactoryAddress, uint256 _pobContractPrice) {
    _pobVersion = _deployedPobVersion;
    _POBProfileFactoryAddress = _deployedPOBProfileFactoryAddress;
    pobContractPrice = _pobContractPrice;
    pobTotalSupply = 0;
  }

  function createNewPersonalPob(string memory _collectionName, address _userAddress, address _profileAddress, string memory _globalTokenURI) public payable {
    address msgSender = _msgSender();
    require(msg.value >= pobContractPrice, "POBFactory: Not enough MATIC to purchase POB Contract");
    require(IPOEPProfileFactory(_POBProfileFactoryAddress).getUserAddressToProfile(_userAddress) != address(0), "POBFactory: User does not have POB Profile");
    require(block.timestamp > profileAddressToPobExpiration[_profileAddress], "POBFactory: Sender already has an active Personal POB");
    PersonalPOB newPersonalPob = new PersonalPOB(_collectionName, _globalTokenURI);
    newPersonalPob.transferOwnership(msgSender);
    personalPobArray.push(newPersonalPob);
    ++pobTotalSupply;
    userAddressToPobAddress[_userAddress] = address(newPersonalPob);
    profileAddressToPobAddress[_profileAddress] = msgSender;
    profileAddressToPobExpiration[_profileAddress] = block.timestamp + 604800;
  }

  receive() external payable {}

  fallback() external payable {}
}
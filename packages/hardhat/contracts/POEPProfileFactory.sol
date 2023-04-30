//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "./POEPProfile.sol";
import "./interfaces/IPOEPProfileFactory.sol";

contract POEPProfileFactory is Ownable, IPOEPProfileFactory {
  string private _poepVersion;
  POEPProfile[] public poepProfilesArray;
  mapping (string => address) public profileHandleToProfile;
  mapping (string => address) public profileHandleToUserAddress;
  mapping (address => address) public userAddressToProfile;

  constructor(string memory _deployedPoepVersion) {
    _poepVersion = _deployedPoepVersion;
  }

  function createNewPoepProfile(string memory _name, string memory _symbol) public {
    address msgSender = _msgSender();

    require(userAddressToProfile[msgSender] == address(0), "POEPProfileFactory: Only one Profile per address");
    require(profileHandleToProfile[_name] == address(0), "POEPProfileFactory: Profile handle has been taken");

    POEPProfile newPoepProfile = new POEPProfile(_name, _symbol);
    newPoepProfile.transferOwnership(msgSender);
    poepProfilesArray.push(newPoepProfile);
    profileHandleToProfile[_name] = address(newPoepProfile);
    profileHandleToUserAddress[_name] = msgSender;
    userAddressToProfile[msgSender] = address(newPoepProfile);
  }

  function getUserAddressToProfile(address _userAddress) external view returns (address) {
    return userAddressToProfile[_userAddress];
  }

  receive() external payable {}

  fallback() external payable {}
}
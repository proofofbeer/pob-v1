//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "./POEPProfile.sol";
import "./interfaces/IPOEPProfileFactory.sol";

contract POEPProfileFactory is Ownable, IPOEPProfileFactory {
  string private _poepVersion;
  uint256 private _changeGlobalTokenPrice;
  uint256 private _changePeriod;

  uint256 public poepProfileTotalSupply;
  POEPProfile[] public poepProfilesArray;

  mapping(string => address) public profileHandleToProfile;
  mapping(string => address) public profileHandleToUserAddress;
  mapping(address => address) public userAddressToProfile;

  constructor(string memory deployedPoepVersion_, uint256 changePeriod_, uint256 changeGlobalTokenPrice_) {
    _poepVersion = deployedPoepVersion_;
    _changeGlobalTokenPrice = changeGlobalTokenPrice_ * 10 ** 18;
    _changePeriod = changePeriod_;
    poepProfileTotalSupply = 0;
  }

  function createNewPoepProfile(string memory name_, string memory symbol_) public {
    address msgSender = _msgSender();

    require(userAddressToProfile[msgSender] == address(0), "POEPProfileFactory: Only one Profile per address");
    require(profileHandleToProfile[name_] == address(0), "POEPProfileFactory: Profile handle has been taken");

    POEPProfile newPoepProfile = new POEPProfile(name_, symbol_, _changePeriod, _changeGlobalTokenPrice, address(this));
    newPoepProfile.transferOwnership(msgSender);
    ++poepProfileTotalSupply;
    poepProfilesArray.push(newPoepProfile);
    profileHandleToProfile[name_] = address(newPoepProfile);
    profileHandleToUserAddress[name_] = msgSender;
    userAddressToProfile[msgSender] = address(newPoepProfile);
  }

  function getUserAddressToProfile(address userAddress_) external view returns (address) {
    return userAddressToProfile[userAddress_];
  }

  receive() external payable {}

  fallback() external payable {}
}

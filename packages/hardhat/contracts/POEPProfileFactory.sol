//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "./POEPProfile.sol";
import "./interfaces/IPOEPProfileFactory.sol";

contract POEPProfileFactory is Ownable, IPOEPProfileFactory {
  string private _poepVersion;
  uint256 private changeGlobalTokenPrice;
  uint256 public changePeriod;

  uint256 public poepProfileTotalSupply;
  POEPProfile[] public poepProfilesArray;

  mapping(string => address) public profileHandleToProfile;
  mapping(string => address) public profileHandleToUserAddress;
  mapping(address => address) public userAddressToProfile;

  constructor(string memory deployedPoepVersion_, uint256 changePeriod_, uint256 changeGlobalTokenPrice_) {
    _poepVersion = deployedPoepVersion_;
    changeGlobalTokenPrice = changeGlobalTokenPrice_ * 10 ** 18;
    changePeriod = changePeriod_;
    poepProfileTotalSupply = 0;
  }

  function createNewPoepProfile(string memory name_, string memory symbol_) public {
    require(userAddressToProfile[_msgSender()] == address(0), "POEPProfileFactory: Only one Profile per address");
    require(profileHandleToProfile[name_] == address(0), "POEPProfileFactory: Profile handle has been taken");

    POEPProfile newPoepProfile = new POEPProfile(name_, symbol_, changePeriod, changeGlobalTokenPrice, address(this));
    newPoepProfile.transferOwnership(_msgSender());
    poepProfilesArray.push(newPoepProfile);
    profileHandleToProfile[name_] = address(newPoepProfile);
    profileHandleToUserAddress[name_] = _msgSender();
    userAddressToProfile[_msgSender()] = address(newPoepProfile);
    ++poepProfileTotalSupply;
  }

  function setChangePeriod(uint256 changePeriod_) external onlyOwner {
    changePeriod = changePeriod_;
  }

  function getUserAddressToProfile(address userAddress_) external view returns (address) {
    return userAddressToProfile[userAddress_];
  }

  receive() external payable {}

  fallback() external payable {}
}

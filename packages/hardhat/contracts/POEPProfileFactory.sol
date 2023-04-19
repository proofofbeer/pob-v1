//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "./POEPProfile.sol";

contract POEPProfileFactory is Ownable {
  string private _poepVersion;
  POEPProfile[] public poepProfilesArray;
  mapping (string => address) public profileHandleToProfile;
  mapping (string => address) public profileHandleToWallet;
  mapping (address => address) public walletToProfile;

  constructor(string memory _deployedPoepVersion) {
    _poepVersion = _deployedPoepVersion;
  }

  function createNewPoepProfile(string memory _name, string memory _symbol) public {
    address msgSender = _msgSender();

    require(walletToProfile[msgSender] == address(0), "POEPProfileFactory: Only one POEP Profile per address");
    require(profileHandleToProfile[_name] == address(0), "POEPProfileFactory: Profile handle has been taken");

    POEPProfile newPoepProfile = new POEPProfile(_name, _symbol);
    newPoepProfile.transferOwnership(msgSender);
    poepProfilesArray.push(newPoepProfile);
    profileHandleToProfile[_name] = address(newPoepProfile);
    profileHandleToWallet[_name] = msgSender;
    walletToProfile[msgSender] = address(newPoepProfile);
  }

  receive() external payable {}

  fallback() external payable {}
}
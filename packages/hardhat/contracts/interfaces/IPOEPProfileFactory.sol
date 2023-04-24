//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

interface IPOEPProfileFactory {
  function getUserAddressToProfile(address _userAddress) external view returns (address profileAddress);
}
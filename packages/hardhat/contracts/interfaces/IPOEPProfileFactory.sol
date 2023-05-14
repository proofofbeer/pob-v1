//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;
import "./IPOB.sol";

interface IPOEPProfileFactory is IPOB {
  function getUserAddressToProfile(address userAddress_) external view returns (address profileAddress);

  function addMintedPob(address userAddress_, PobCollectionContract memory newMintedPobCollection_) external;
}

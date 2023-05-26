//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "./IPOB.sol";

interface IPOBFactory is IPOB {
  function addMintedPob(PobCollectionContract memory newMintedPobCollection_, address userAddress_) external;
}

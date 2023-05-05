//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "./IPOB.sol";

interface IPersonalPOB is IPOB {
  function setGlobalTokenURI(string memory newGlobalTokenURI_) external;
}

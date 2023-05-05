//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "./IPOB.sol";

interface IPOEPProfile is IPOB {
  function addMintedPob(PobCollectionContract memory newMintedPobCollection_) external;

  function addMintedPobOnlyOwner(PobCollectionContract memory newMintedPobCollection_, address msgSender_) external;
}

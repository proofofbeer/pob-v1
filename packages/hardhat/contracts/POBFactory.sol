//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "./interfaces/IPOBFactory.sol";
import "./POB.sol";

contract POBFactory is IPOBFactory, Ownable {
  string private _pobVersion;
  uint256 public deployedPobContracts;
  uint256 public pobTokenPrice;
  address private _withdrawFundsAddress;
  PobCollectionContract[] public pobCollectionContractList;
  mapping(address => PobCollectionContract[]) public userAddressToPobCollectionContract;

  constructor(string memory deployedPobVersion_, address withdrawFundsAddress_, uint256 pobTokenPrice_) {
    _pobVersion = deployedPobVersion_;
    _withdrawFundsAddress = withdrawFundsAddress_;
    pobTokenPrice = pobTokenPrice_;
    deployedPobContracts = 0;
  }

  function createNewPob(
    string memory pobCollectionName_,
    string memory pobCollectionSymbol_,
    string memory globalTokenURI_,
    uint256 pobCollectionMaxSupply_,
    bytes32 qrMerkleRoot_
  ) public payable {
    require(
      msg.value >= pobCollectionMaxSupply_ * pobTokenPrice,
      "POBFactory: Not enough MATIC to create POB Contract with required quantity"
    );
    POB newPob = new POB(
      pobCollectionName_,
      pobCollectionSymbol_,
      globalTokenURI_,
      deployedPobContracts + 1,
      pobCollectionMaxSupply_,
      qrMerkleRoot_
    );
    newPob.transferOwnership(_msgSender());
    ++deployedPobContracts;
    emit DeployPOBContract(address(this), address(newPob), _msgSender());
    PobCollectionContract memory newPobCollectionContract = PobCollectionContract({
      pobAddress: address(newPob),
      name: pobCollectionName_,
      symbol: pobCollectionSymbol_,
      globalTokenUri: globalTokenURI_,
      pobCollectionId: deployedPobContracts,
      maxSupply: pobCollectionMaxSupply_,
      tokenId: 0
    });
    pobCollectionContractList.push(newPobCollectionContract);
    userAddressToPobCollectionContract[_msgSender()].push(newPobCollectionContract);
  }

  function getUserPobCollections(address userAddress_) public view returns (PobCollectionContract[] memory) {
    uint256 arrayLength = userAddressToPobCollectionContract[userAddress_].length;
    PobCollectionContract[] memory userPobCollections = new PobCollectionContract[](arrayLength);

    for (uint256 i = 0; i < arrayLength; i++) {
      userPobCollections[i] = userAddressToPobCollectionContract[userAddress_][i];
    }

    return userPobCollections;
  }

  function addMintedPob(PobCollectionContract memory newMintedPobCollection_, address userAddress_) external {
    userAddressToPobCollectionContract[userAddress_].push(newMintedPobCollection_);
  }

  function withdraw(uint256 amount_) public onlyOwner {
    require(amount_ <= address(this).balance, "POBFactory:Insufficient balance in the contract");
    payable(_withdrawFundsAddress).transfer(amount_);
  }

  receive() external payable {}

  fallback() external payable {}
}

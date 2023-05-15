import { expect } from "chai";
import { ethers } from "hardhat";
import { POEPProfileFactory, POEPProfileFactory__factory, PersonalPOB, PersonalPOB__factory } from "../typechain-types";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

describe("PersonalPOBFactory", function () {
  // We define a fixture to reuse the same setup in every test.

  let pob: PersonalPOB;
  let poepFactory: POEPProfileFactory;
  const collectionId = 1;
  const collectionName = "Test POB Collection";
  const collectionSymbol = "POB";
  const changePeriod = 0; // Time period required before next metadata change is free
  const changeGlobalTokenPrice = 0; // Price to change metadata before changePeriod limit
  const maxSupply = 25;
  before(async () => {
    const [deployer] = await ethers.getSigners();
    poepFactory = await new POEPProfileFactory__factory(deployer).deploy("1", changePeriod, changeGlobalTokenPrice);
    pob = await new PersonalPOB__factory(deployer).deploy(
      collectionName,
      collectionSymbol,
      "ipfs://blabla",
      deployer.address,
      collectionId,
      maxSupply,
      Math.floor(Date.now() / 1000) + 86400 /** 1 day */,
      poepFactory.address,
      ethers.constants.HashZero,
    );
    await pob.deployed();
  });

  describe("Deployment", function () {
    it("Should have the right symbol on deploy", async function () {
      expect(await pob.name()).to.equal(collectionName);
    });

    it("Should have the right symbol on deploy", async function () {
      expect(await pob.symbol()).to.equal(collectionSymbol);
    });

    it("Should have a max supply on deploy", async function () {
      expect(await pob.maxSupply()).to.equal(maxSupply);
    });
  });

  describe("Mint functions and conditions", function () {
    before(async () => {
      const [, addr1] = await ethers.getSigners();
      await pob.safeMint(addr1.getAddress());
    });
    it("Should show correct balance for minted POB", async function () {
      const [, addr1] = await ethers.getSigners();
      expect(await pob.balanceOf(addr1.getAddress())).to.equal(1);
    });
    it("Should limit mint to 1 per address", async function () {
      const [, addr1] = await ethers.getSigners();
      await expect(pob.safeMint(addr1.getAddress())).to.be.revertedWith("PersonalPOB: Only one POB per address");
    });
    it("Should limit the number of mints according to maxSupply (25)", async function () {
      let wallet;
      for (let i = 0; i < maxSupply - 1; i++) {
        // Get a new wallet
        wallet = ethers.Wallet.createRandom();
        await pob.safeMint(wallet.address);
      }
      wallet = ethers.Wallet.createRandom();

      await expect(pob.safeMint(wallet.address)).to.be.revertedWith("PersonalPOB: Maximum supply reached");
    });
  });
});

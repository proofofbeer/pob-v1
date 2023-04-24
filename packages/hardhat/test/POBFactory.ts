import { expect } from "chai";
import { ethers } from "hardhat";
import { PersonalPOB } from "../typechain-types";

describe("Personal POB Contract", function () {
  // We define a fixture to reuse the same setup in every test.

  let pobContract: PersonalPOB;
  const collectionName = "Test POB Collection";
  const collectionSymbol = "POB";
  const maxSupply = 25;
  before(async () => {
    // const [owner] = await ethers.getSigners();
    const pobContractFactory = await ethers.getContractFactory("PersonalPOB");
    pobContract = (await pobContractFactory.deploy(collectionName)) as PersonalPOB;
    await pobContract.deployed();
  });

  describe("Deployment", function () {
    it("Should have the right symbol on deploy", async function () {
      expect(await pobContract.name()).to.equal(collectionName);
    });

    it("Should have the right symbol on deploy", async function () {
      expect(await pobContract.symbol()).to.equal(collectionSymbol);
    });

    it("Should have a max supply on deploy", async function () {
      expect(await pobContract.maxSupply()).to.equal(maxSupply);
    });
  });

  describe("Mint functions and conditions", function () {
    before(async () => {
      const [, addr1] = await ethers.getSigners();
      await pobContract.safeMint(addr1.getAddress());
    });
    it("Should show correct balance for minted POB", async function () {
      const [, addr1] = await ethers.getSigners();
      expect(await pobContract.balanceOf(addr1.getAddress())).to.equal(1);
    });
    it("Should limit mint to 1 per address", async function () {
      const [, addr1] = await ethers.getSigners();
      await expect(pobContract.safeMint(addr1.getAddress())).to.be.revertedWith(
        "PersonalPOB: Only one POB per address",
      );
    });
    it("Should limit the number of mints according to maxSupply (25)", async function () {
      let wallet;
      for (let i = 0; i < 23; i++) {
        // Get a new wallet
        wallet = ethers.Wallet.createRandom();
        await pobContract.safeMint(wallet.address);
      }
      wallet = ethers.Wallet.createRandom();

      await expect(pobContract.safeMint(wallet.address)).to.be.revertedWith("PersonalPOB: Maximum supply reached");
    });
  });
});

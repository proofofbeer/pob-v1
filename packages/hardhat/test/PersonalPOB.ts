import { expect } from "chai";
import { ethers } from "hardhat";
import { POEPProfileFactory, POEPProfileFactory__factory, PersonalPOB, PersonalPOB__factory } from "../typechain-types";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import MerkleTree from "merkletreejs";
import { arrayify, keccak256, solidityPack, splitSignature } from "ethers/lib/utils";

describe("Personal POB Contract", () => {
  // We define a fixture to reuse the same setup in every test.

  let pob: PersonalPOB;
  let poepFactory: POEPProfileFactory;
  const collectionId = 1;
  const collectionName = "Test POB Collection";
  const collectionSymbol = "POB";
  const changePeriod = 0; // Time period required before next metadata change is free
  const changeGlobalTokenPrice = 0; // Price to change metadata before changePeriod limit
  const maxSupply = 25;
  let deployer: SignerWithAddress;
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

  describe("Mint functions and conditions", () => {
    let addr1: SignerWithAddress;
    before(async () => {
      [deployer, addr1] = await ethers.getSigners();
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
      // NB: 1 already minted in the before hook
      for (let i = 0; i < maxSupply - 1; i++) {
        // Get a new wallet
        wallet = ethers.Wallet.createRandom();
        await pob.safeMint(wallet.address);
      }

      wallet = ethers.Wallet.createRandom();
      await expect(pob.safeMint(wallet.address)).to.be.revertedWith("PersonalPOB: Maximum supply reached");
    });

    it("mint with merkle proof", async () => {
      // 1. Create 25 ephemeral wallets. The private keys will be encoded in QR codes.
      const qrWallets = Array(25)
        .fill(0)
        .map(() => ethers.Wallet.createRandom());
      const qrPubKeys = qrWallets.map(wallet => wallet.address);

      // 2. Create Merkle tree from pubkeys (addresses)
      const merkleTree = new MerkleTree(qrPubKeys, keccak256, {
        sort: true,
        hashLeaves: true,
      });

      // 3. Deploy POB with Merkle root
      pob = await new PersonalPOB__factory(deployer).deploy(
        collectionName,
        collectionSymbol,
        "ipfs://blabla",
        deployer.address,
        1,
        maxSupply,
        Math.floor(Date.now() / 1000) + 86400 /** 1 day */,
        poepFactory.address,
        merkleTree.getHexRoot() /** Merkle root of QR pub keys */,
      );

      // 4. User visits page pointed to by QR code and wishes to claim.
      //    The QR code encodes the private key in the query string.
      for (const qrWallet of qrWallets) {
        //  4.2: The user inputs a wallet address that she wishes to claim to.
        const addressToClaimTo = ethers.Wallet.createRandom().address;

        //  4.3: The app automatically signs a message containing the wallet
        //      address using the private key. This is the `signature`.
        const rawSig = await qrWallet.signMessage(arrayify(addressToClaimTo));
        const { v, r, s } = splitSignature(rawSig);
        const signature = solidityPack(["bytes32", "bytes32", "uint8"], [r, s, v]);

        //  4.4: The app also supplies a Merkle proof for the corresponding
        //      QR public key.
        const merkleProof = merkleTree.getHexProof(keccak256(qrWallet.address));

        //  4.5: The user may now mint to their desired address using the computed
        //      signature & merkleProof.
        await pob.safeMintWithMerkleProof(addressToClaimTo, signature, merkleProof);

        // Can't do it twice
        await expect(pob.safeMintWithMerkleProof(addressToClaimTo, signature, merkleProof)).to.be.revertedWith(
          "QR code already claimed",
        );
      }
    });
  });
});

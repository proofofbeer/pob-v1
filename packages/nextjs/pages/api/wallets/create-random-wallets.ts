import { ethers } from "ethers";
import { keccak256 } from "ethers/lib/utils.js";
import MerkleTree from "merkletreejs";
import { NextApiRequest, NextApiResponse } from "next";
import nextConnect from "next-connect";

const createRandomWalletsApi = nextConnect<NextApiRequest, NextApiResponse>({
  onError: (error, _req, res) => {
    console.log(error);
    res.status(500);
    res.json({ error });
  },
});

createRandomWalletsApi.post(async (req, res) => {
  const { pob_quantity } = req.body;

  const qrWallets = Array(pob_quantity)
    .fill(0)
    .map(() => ethers.Wallet.createRandom());
  const qrPubKeys = qrWallets.map(wallet => wallet.address);

  const merkleTree = new MerkleTree(qrPubKeys, keccak256, {
    sort: true,
    hashLeaves: true,
  });

  res.status(200).json({ merkleTree });
});

export default createRandomWalletsApi;

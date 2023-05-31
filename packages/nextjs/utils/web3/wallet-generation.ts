import { getBaseUrl } from "../url-formatting";
import { ethers } from "ethers";
import { keccak256 } from "ethers/lib/utils.js";
import MerkleTree from "merkletreejs";

export const createRandomWallets = async (pobQuantity: number) => {
  const qrWalletsArray = Array(pobQuantity)
    .fill(0)
    .map(() => ethers.Wallet.createRandom());

  const qrPubKeys = qrWalletsArray.map(wallet => wallet.address);
  const qrPrivKeysArray = qrWalletsArray.map(wallet => wallet.privateKey);

  const merkleTreeWithQrPubKeys = new MerkleTree(qrPubKeys, keccak256, {
    sort: true,
    hashLeaves: true,
  });

  return { merkleTreeWithQrPubKeys, qrWalletsArray, qrPrivKeysArray };
};

export const generateUrlsForQrCodes = (pobContractAddress: string, privKeysArray: any[]) => {
  const urlsArray: string[] = [];

  const baseUrl = getBaseUrl();

  if (privKeysArray.length === 0) {
    urlsArray.push(`${baseUrl}/mint/${pobContractAddress}?key=null`);
    return urlsArray;
  } else {
    for (let i = 0; i < privKeysArray.length; i++) {
      urlsArray.push(`${baseUrl}/mint/${pobContractAddress}?key=${privKeysArray[i]}&index=${i}`);
    }
    return urlsArray;
  }
};

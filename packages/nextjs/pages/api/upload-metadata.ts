import { NextApiRequest, NextApiResponse } from "next";
import nextConnect from "next-connect";
import { File, NFTStorage } from "nft.storage";

const token = process.env.NFT_STORAGE_API_KEY || "";

const uploadMetadataApi = nextConnect<NextApiRequest, NextApiResponse>({
  onError: (error, _req, res) => {
    console.log(error);
    res.status(500);
    res.json({ error });
  },
});

uploadMetadataApi.post(async (req, res) => {
  console.log(req.body);
  const { metadata } = req.body;

  const imageUrl = `https://nftstorage.link/ipfs/${metadata.image}/image-0`;
  metadata["image"] = imageUrl;

  const nftStorage = new NFTStorage({ token });

  const cid = await nftStorage.storeDirectory([new File([JSON.stringify(metadata)], `nft-${1}`) as any]);
  const status = await nftStorage.status(cid);

  const nftUrl = `https://${cid}.ipfs.nftstorage.link/nft-1`;

  res.status(200).json({ cid, nftUrl, status });
});

export default uploadMetadataApi;

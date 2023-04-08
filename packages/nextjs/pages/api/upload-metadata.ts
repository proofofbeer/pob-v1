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

const erc1155Metadata = (metadata: any, imageCid: string, imgName: string) => ({
  name: metadata.name,
  description: metadata.description,
  image: `ipfs://${imageCid}/${imgName}`,
  attributes: metadata.attributes,
});

uploadMetadataApi.post(async (req, res) => {
  console.log(req.body);
  const { metadata } = req.body;

  const imageCid = "bafybeianjkjjbeeo5dufy3sfur3g4jqhfq63dglfqtylk5zr6crfx3jtw4";
  const imgName = "image";
  const nftStorage = new NFTStorage({ token });

  const directoryCid = await nftStorage.storeDirectory([
    new File([JSON.stringify(erc1155Metadata(metadata, imageCid, imgName))], `nft-${1}`) as any,
  ]);
  const status = await nftStorage.status(directoryCid);

  res.status(200).json({ cid: `ipfs://${directoryCid}/nft-${1}`, status });
});

export default uploadMetadataApi;

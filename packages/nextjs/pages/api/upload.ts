import multer from "multer";
import { NextApiRequest, NextApiResponse } from "next";
import nextConnect from "next-connect";
import { File, NFTStorage } from "nft.storage";

const token = process.env.NFT_STORAGE_API_KEY || "";

const uploadApi = nextConnect<NextApiRequest & { files: any }, NextApiResponse>({
  onError: (error, _req, res) => {
    res.status(500);
    res.json({ error });
  },
});

const upload = multer({
  storage: multer.memoryStorage(),
});

uploadApi.use(upload.array("files"));

uploadApi.post(async (req, res) => {
  const { files } = req;
  const nftStorage = new NFTStorage({ token });

  const cid = await nftStorage.storeDirectory([
    ...files.map((file: any, index: any) => new File([file.buffer], `image-${index}`)),
  ]);

  const status = await nftStorage.status(cid);

  res.json({ cid, status });
});

export default uploadApi;

export const config = {
  api: {
    bodyParser: false,
  },
};

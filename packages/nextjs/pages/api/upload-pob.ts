import multer from "multer";
import { NextApiRequest, NextApiResponse } from "next";
import nextConnect from "next-connect";
import { File, NFTStorage } from "nft.storage";
import { getBaseUrl } from "~~/utils/url-formatting";

const token = process.env.NFT_STORAGE_API_KEY || "";

const uploadApi = nextConnect<NextApiRequest & { files: any }, NextApiResponse>({
  onError: (error, _req, res) => {
    console.log(error);
    res.status(500);
    res.json({ error });
  },
});

const upload = multer({
  storage: multer.memoryStorage(),
});

uploadApi.use(upload.array("files"));

const getPersonalPOBMetadata = (metadata: any, imgCid: string) => {
  const baseUrl = getBaseUrl();
  return {
    name: metadata.name,
    description: metadata.description,
    image: `ipfs://${imgCid}/image-0`,
    external_url: `${baseUrl}/user/${metadata.user_address}`,
    whitelist: `${metadata.whitelist}`,
    attributes: {
      start_date: metadata.event_start_date,
      end_date: metadata.event_end_date,
    },
  };
};

uploadApi.post(async (req, res) => {
  const files = req.files;
  const nftStorage = new NFTStorage({ token });

  const imageCid = await nftStorage.storeDirectory([
    ...files.map((file: any, index: number) => new File([file.buffer], `image-${index}`)),
  ]);

  const imageStatus = await nftStorage.status(imageCid);

  const metadata = getPersonalPOBMetadata(req.body, imageCid);

  const cid = await nftStorage.storeDirectory([new File([JSON.stringify(metadata)], `nft-0`)]);
  const status = await nftStorage.status(cid);

  const nftUrl = `ipfs://${cid}/nft-0`;

  res.json({ cid, imageCid, imageStatus, nftUrl, status });
});

export default uploadApi;

export const config = {
  api: {
    bodyParser: false,
  },
};

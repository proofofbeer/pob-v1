import multer from "multer";
import { NextApiRequest, NextApiResponse } from "next";
import nextConnect from "next-connect";
import { File, NFTStorage } from "nft.storage";

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
  if (metadata.event_type === "Virtual") {
    return {
      name: metadata.name,
      description: metadata.description,
      image: `ipfs://${imgCid}/image-0`,
      external_url: `https://pob.lol/pob/${metadata.profileAddress}`,
      attributes: {
        start_date: metadata.event_start_date,
        end_date: metadata.event_end_date,
        event_type: metadata.event_type,
        event_platform: metadata.event_platform,
        event_channel: metadata.event_channel,
      },
    };
  } else if (metadata.event_type === "In-person") {
    return {
      name: metadata.name,
      description: metadata.description,
      image: `ipfs://${imgCid}/image-0`,
      external_url: `https://pob.lol/pob/${metadata.profileAddress}`,
      attributes: {
        start_date: metadata.event_start_date,
        end_date: metadata.event_end_date,
        event_type: metadata.event_type,
        event_city: metadata.event_city,
        event_country: metadata.event_country,
      },
    };
  }
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

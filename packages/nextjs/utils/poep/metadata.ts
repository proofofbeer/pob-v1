import { INFTMetadata } from "~~/types/nft-metadata/nft-metadata";

export type TGetPersonalPOEPMetadataParams = {
  imgCid: string;
  profileAddress: string;
  username: string;
};

export const getPersonalPOEPMetadata = ({
  imgCid,
  profileAddress,
  username,
}: TGetPersonalPOEPMetadataParams): INFTMetadata => {
  const today = new Date(Date.now());
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  return {
    name: `${username.toUpperCase()}'s Personal POEP`,
    description: `We met on ${currentMonth} '${currentYear - 2000}`,
    image: imgCid,
    external_url: `https://pob.lol/profile/${profileAddress}`,
    attributes: {
      start_date: `${currentMonth} '${currentYear - 2000}`,
      end_date: `${currentMonth} '${currentYear - 2000}`,
    },
  };
};

import { MONTHS } from "../date/Months";
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
    name: `${username} - Profile POB`,
    description: `We met on ${MONTHS[currentMonth]} '${currentYear - 2000}`,
    image: imgCid,
    external_url: `https://pob.lol/profile/${profileAddress}`,
    attributes: {
      start_date: `${MONTHS[currentMonth]} '${currentYear - 2000}`,
      end_date: `${MONTHS[currentMonth]} '${currentYear - 2000}`,
    },
  };
};

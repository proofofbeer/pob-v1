import Image from "next/image";
import { HeartIcon } from "@heroicons/react/24/outline";

type TNFTImageProps = {
  chain?: string;
  imageURI: string;
};

const NFTImage = ({ chain, imageURI }: TNFTImageProps) => {
  return (
    <div className="w-full border-base-300 bg-base-200 border-2 rounded-lg">
      <div className="text-sm py-1 px-4 rounded-t-lg flex justify-between items-center">
        <p>Chain: {chain || "Sepolia"}</p> <HeartIcon className="h-4 w-4" />
      </div>
      <div className="w-full aspect-square rounded-b-lg relative">
        <Image
          className="rounded-b-lg"
          src={imageURI || "No image found :("}
          alt="Your NFT image preview"
          fill={true}
        />
      </div>
    </div>
  );
};

export default NFTImage;

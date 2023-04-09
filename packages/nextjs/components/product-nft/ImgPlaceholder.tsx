import Image from "next/image";
import { HeartIcon, PhotoIcon } from "@heroicons/react/24/outline";

type TImgPlaceholderProps = {
  chain?: string;
  ipfsCid?: string;
  previewImage: any;
};

const ImgPlaceholder = ({ chain, ipfsCid, previewImage }: TImgPlaceholderProps) => {
  return (
    <div className="flex flex-col items-start justify-center w-full md:w-3/5 mb-4 lg:mb-4">
      {previewImage ? (
        <div className="w-full border-base-300 bg-base-200 border-2 rounded-lg">
          <div className="text-sm py-1 px-4 rounded-t-lg flex justify-between items-center">
            <p>Chain: {chain || "Sepolia"}</p> <HeartIcon className="h-4 w-4" />
          </div>
          <Image
            className="w-full rounded-b-lg"
            src={ipfsCid ? `https://nftstorage.link/ipfs/${ipfsCid}/image` : previewImage}
            alt="Your NFT image preview"
            width={288}
            height={288}
          />
        </div>
      ) : (
        <div className="w-full border-base-300 bg-base-200 border-2 rounded-lg">
          <div className="text-sm py-1 px-4 rounded-t-lg flex justify-between items-center">
            <p>Chain: {chain || "Ethereum"}</p> <HeartIcon className="h-4 w-4" />
          </div>
          <div className="flex flex-col items-center justify-center w-full h-64 border-b-2 border-t-2 border-l-2 border-r-2 border-base-300 border-dashed bg-base-200 rounded-lg text-accent cursor-pointer py-2">
            <div className="flex flex-col md:flex-row items-center justify-center">
              <p className="text-accent/50 font-medium text-center flex flex-col items-center justify-center">
                <PhotoIcon className="h-16 w-16" />
                No image selected
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImgPlaceholder;

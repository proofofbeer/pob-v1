import Image from "next/image";
import Loader from "../common/Loader";

type TNFTImageProps = {
  imageURI: string;
};

const POBImage = ({ imageURI }: TNFTImageProps) => {
  return (
    <div className={`w-full aspect-square relative`}>
      {imageURI ? (
        <Image
          className={`rounded-full border-blue-900 border-2`}
          src={imageURI || "No image found :("}
          alt="Your NFT image preview"
          fill={true}
        />
      ) : (
        <div className="aspect-square w-full h-full flex justify-center items-center p-8 md:p-16 lg:p-8">
          <Loader loaderWidth="full" />
        </div>
      )}
    </div>
  );
};

export default POBImage;

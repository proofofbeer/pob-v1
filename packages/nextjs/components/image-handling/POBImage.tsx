import Image from "next/image";
import styles from "./POBImage.module.css";

type TNFTImageProps = {
  imageURI: string;
};

const POBImage = ({ imageURI }: TNFTImageProps) => {
  return (
    <div className={`w-full aspect-square relative`}>
      <Image
        className={`rounded-full`}
        src={imageURI || "No image found :("}
        alt="Your NFT image preview"
        fill={true}
      />
    </div>
  );
};

export default POBImage;

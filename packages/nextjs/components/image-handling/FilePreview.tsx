import { Dispatch, SetStateAction } from "react";
import Image from "next/image";
import FileUpload from "./FileUpload";
import { HeartIcon, PencilIcon } from "@heroicons/react/24/outline";

type TFilePreviewProps = {
  chain?: string;
  fileFormKey: string;
  ipfsCid?: string;
  previewImage: any;
  setImgObj: Dispatch<SetStateAction<any>>;
};

const FilePreview = ({ chain, fileFormKey, ipfsCid, previewImage, setImgObj }: TFilePreviewProps) => {
  return (
    <div className="flex flex-col items-center justify-center w-full md:w-3/5 p-4">
      {previewImage ? (
        <>
          <div className="w-full border-base-300 bg-base-200 border-2 rounded-lg">
            <div className="text-sm py-1 px-4 rounded-t-lg flex justify-between items-center">
              <p>Chain: {chain || "Sepolia"}</p> <HeartIcon className="h-4 w-4" />
            </div>
            <div className="w-full aspect-square rounded-b-lg relative">
              <Image
                className="rounded-b-lg"
                src={ipfsCid ? `https://nftstorage.link/ipfs/${ipfsCid}/image` : previewImage}
                alt="Your NFT image preview"
                fill={true}
              />
            </div>
          </div>
          <div className="w-full flex items-center justify-end m-4 mb-2 px-2">
            <button className="flex items-center dark:hover:text-orange-600" onClick={() => setImgObj(undefined)}>
              Change image <PencilIcon className="h-4 w-4 ml-2" />
            </button>
          </div>
        </>
      ) : (
        <>
          <FileUpload setImgObj={setImgObj} fileFormKeyState={fileFormKey} />
          <div className="w-full flex items-center justify-center m-4 mb-2 px-2">Select an image</div>
        </>
      )}
    </div>
  );
};

export default FilePreview;

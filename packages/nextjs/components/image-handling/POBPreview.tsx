import { Dispatch, SetStateAction } from "react";
import FileUpload from "./FileUpload";
import POBImage from "./POBImage";
import { PencilIcon } from "@heroicons/react/24/outline";

type TFilePreviewProps = {
  fileFormKey: string;
  ipfsCid?: string;
  previewImage: any;
  setImgObj: Dispatch<SetStateAction<any>>;
};

const POBPreview = ({ fileFormKey, ipfsCid, previewImage, setImgObj }: TFilePreviewProps) => {
  return (
    <div className="flex flex-col items-center justify-center w-full">
      {previewImage ? (
        <>
          <POBImage imageURI={ipfsCid || previewImage} />
          <div className="w-full flex items-center justify-center m-4 mb-2 px-2">
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

export default POBPreview;

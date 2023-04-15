import { useMemo, useState } from "react";
import FilePreview from "~~/components/image-handling/FilePreview";

const CreatePOEP = () => {
  const fileFormKey = "poap_image_file";
  const [imageObj, setImgObj] = useState<any>(undefined);

  const previewImage = useMemo(() => {
    if (imageObj) {
      return URL.createObjectURL(new Blob([imageObj]));
    }
    return null;
  }, [imageObj]);

  return (
    <div className="flex flex-col py-8 px-4 lg:px-8 lg:py-12 justify-center items-center min-h-full">
      <h1 className="text-4xl font-semibold text-center mb-4">Create POEP Drop</h1>
      <div
        id="preview-container"
        className="w-full md:w-4/5 mb-4 rounded-lg flex flex-col items-center bg-base-100 border-base-300 border shadow-md shadow-secondary"
      >
        <FilePreview fileFormKey={fileFormKey} previewImage={previewImage} setImgObj={setImgObj} />
      </div>
      <div id="form-container" className="w-full md:w-4/5 bg-red-300 mb-4 rounded-lg flex flex-col items-center">
        <p>Here goes the form</p>
      </div>
    </div>
  );
};

export default CreatePOEP;

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
      <div id="preview-container">
        <FilePreview fileFormKey={fileFormKey} previewImage={previewImage} setImgObj={setImgObj} />
      </div>
      <div id="form-container">
        <p>Here goes the form</p>
      </div>
    </div>
  );
};

export default CreatePOEP;

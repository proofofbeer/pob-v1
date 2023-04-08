import { Dispatch, SetStateAction, useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { CloudArrowUpIcon, PencilIcon } from "@heroicons/react/24/outline";
import { useAppStore } from "~~/services/store/store";

type TFileType = {
  path: string;
  lastModified: number;
  lastModifiedDate: Date;
  name: string;
  size: number;
  type: string;
  webkitRelativePath: string;
};

type FileInputProps = {
  setImgObj: Dispatch<SetStateAction<any>>;
  stateObjectKey: string;
  stateFileNameKey: string;
};

const FileInput = ({ setImgObj, stateObjectKey }: FileInputProps) => {
  const [file, setFile] = useState<TFileType[]>([]);
  const setCurrentImgName = useAppStore(state => state.setCurrentImgName);

  const handleFile = (selectedFile: any[]) => {
    console.log(selectedFile);
    if (selectedFile.length > 0) {
      const reader = new FileReader();
      reader.onabort = () => console.log("file reading was aborted");
      reader.onerror = () => console.log("file reading has failed");
      reader.onload = () => {
        console.log("Saving in imgObj:", reader.result);
        setImgObj(reader.result);
        setCurrentImgName("image");
        setFile(selectedFile);
      };
      reader.readAsArrayBuffer(selectedFile[0]);
    }
  };

  const onDrop = useCallback(handleFile, [setCurrentImgName, setImgObj]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <div className="flex flex-col items-start justify-center w-full mb-2 lg:mb-4" {...getRootProps()}>
      <p className="font-medium break-words mb-1 ml-2">Image</p>
      {file.length < 1 ? (
        <label className="flex flex-col items-center justify-center w-full border-2 border-base-300 border-dashed bg-base-200 rounded-lg text-accent cursor-pointer hover:bg-gray-100 dark:hover:border-accent dark:hover:bg-base-300 dark:hover:bg-opacity-30 py-2">
          <div className="flex flex-col md:flex-row items-center justify-center">
            <>
              <CloudArrowUpIcon className="h-8 w-8 mr-2" />
              {isDragActive ? (
                <p className="text-accent/50 font-medium text-center">Drop the files here ...</p>
              ) : (
                <p className="text-accent/50 font-medium text-center">
                  Drag and drop or <br className="lg:hidden" />
                  click to select files
                </p>
              )}

              <input
                className={file.length > 0 ? "hidden" : ""}
                name={stateObjectKey}
                id={stateObjectKey}
                type="file"
                {...getInputProps()}
              />
            </>
          </div>
        </label>
      ) : (
        <div className="flex items-center justify-center w-full border-2 border-base-300 border-dashed bg-base-200 rounded-lg text-accent cursor-pointer hover:bg-gray-100 dark:hover:border-accent dark:hover:bg-base-300 dark:hover:bg-opacity-30 py-3 relative">
          <p className="text-accent/50 font-medium">{file[0].name}</p>
          <PencilIcon className="h-4 w-4 right-0 absolute mr-6" />
        </div>
      )}
    </div>
  );
};

export default FileInput;

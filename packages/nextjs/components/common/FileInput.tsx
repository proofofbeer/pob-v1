import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { CloudArrowUpIcon } from "@heroicons/react/24/outline";

const FileInput = () => {
  const onDrop = useCallback((acceptedFiles: any) => console.log(acceptedFiles), []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <div className="flex flex-col items-start justify-center w-full mb-2 lg:mb-4" {...getRootProps()}>
      <label className="flex flex-col items-center justify-center w-full border-2 border-base-300 border-dashed bg-base-200 rounded-lg text-accent cursor-pointer hover:bg-gray-100 dark:hover:border-accent dark:hover:bg-base-300 dark:hover:bg-opacity-30 py-5">
        <div className="flex items-center justify-center">
          <CloudArrowUpIcon className="h-8 w-8 mr-2" />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {isDragActive ? "Drop the files here ..." : "Drag and drop some files here, or click to select files"}
          </p>
          <input id="dropzone-file" type="file" {...getInputProps()} />
        </div>
      </label>
    </div>
  );
};

export default FileInput;

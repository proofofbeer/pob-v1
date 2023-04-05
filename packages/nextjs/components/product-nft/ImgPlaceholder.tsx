import Image from "next/image";

type TImgPlaceholderProps = {
  previewImage: any;
};

const ImgPlaceholder = ({ previewImage }: TImgPlaceholderProps) => {
  return (
    <div className="flex flex-col items-start justify-center w-full mb-2 lg:mb-4">
      <p className="font-medium break-words mb-1 ml-2">Image</p>
      {previewImage ? (
        <Image className="m-6" src={previewImage} alt="Your NFT image preview" width={256} height={256} />
      ) : (
        <div className="flex flex-col items-center justify-center w-3/5 h-2/5 border-2 border-base-300 border-dashed bg-base-200 rounded-lg text-accent cursor-pointer py-2">
          <div className="flex flex-col md:flex-row items-center justify-center">
            <p className="text-accent/50 font-medium text-center">
              Drag and drop or <br className="lg:hidden" />
              click to select files
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImgPlaceholder;

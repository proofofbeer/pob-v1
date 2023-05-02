import { useRouter } from "next/router";
import Loader from "../Loader";

type TPrimaryButtonProps = {
  buttonText: string;
  classModifier: string;
  isDisabled?: boolean;
  isLoading?: boolean;
  onClick?: () => void;
  path?: string;
  showLoader?: boolean;
};

const PrimaryButton = ({
  buttonText,
  classModifier = "w-full",
  isDisabled,
  isLoading,
  onClick,
  path,
  showLoader,
}: TPrimaryButtonProps) => {
  const router = useRouter();
  return (
    <div className="w-full flex justify-center my-4">
      <button
        className={`normal-case btn bg-orange-600 hover:bg-orange-500 border-orange-600 text-white btn-md ${classModifier}`}
        onClick={path ? () => router.push(path) : onClick}
        disabled={isDisabled}
      >
        {buttonText}
        {showLoader && isLoading && <Loader classModifier="ml-2" />}
      </button>
    </div>
  );
};

export default PrimaryButton;

import { useRouter } from "next/router";

type TPrimaryButtonProps = {
  buttonText: string;
  classModifier: string;
  isDisabled?: boolean;
  path?: string;
};

const PrimaryButton = ({ buttonText, classModifier = "w-full", isDisabled, path }: TPrimaryButtonProps) => {
  const router = useRouter();
  return (
    <div className="w-full flex justify-center my-4">
      <button
        className={`normal-case btn bg-orange-600 hover:bg-orange-500 border-orange-600 text-white btn-md ${classModifier}`}
        onClick={path ? () => router.push(path) : () => null}
        disabled={isDisabled}
      >
        {buttonText}
      </button>
    </div>
  );
};

export default PrimaryButton;

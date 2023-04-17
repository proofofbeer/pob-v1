import { useRouter } from "next/router";

type TNavButtonProps = {
  buttonText: string;
  isDisabled: boolean;
  path: string;
};

const NavButton = ({ buttonText, isDisabled = false, path = "/" }: TNavButtonProps) => {
  const router = useRouter();
  return (
    <div className="w-full flex justify-center my-4">
      <button
        className="text-lg normal-case btn bg-orange-600 hover:bg-orange-500 border-orange-600 text-white btn-md w-3/5 md:w-1/3 lg:w-1/4 xl:w-1/5"
        disabled={isDisabled}
        onClick={() => router.push(path)}
      >
        {buttonText}
      </button>
    </div>
  );
};

export default NavButton;

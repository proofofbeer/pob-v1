import { useRouter } from "next/router";

const BackButton = () => {
  const router = useRouter();
  return (
    <div className="w-full flex justify-center my-4">
      <button
        className="text-md btn bg-primary border-2 text-gray-900 dark:text-white btn-md w-3/5 md:w-1/3 lg:w-1/4 xl:w-1/5"
        onClick={() => router.back()}
      >
        Back
      </button>
    </div>
  );
};

export default BackButton;

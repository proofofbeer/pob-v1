import { useState } from "react";
import { useRouter } from "next/router";

const Index = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  return (
    <div className="flex flex-col py-8 px-4 lg:px-8 lg:py-12 justify-center items-center min-h-full">
      <h1 className="text-4xl font-semibold text-center mb-4">Your POEPs</h1>
      <div className="w-full flex justify-center my-4">
        <button
          className="text-md btn bg-orange-600 hover:bg-orange-500 border-orange-600 text-white btn-md w-3/5 md:w-1/3 lg:w-1/4 xl:w-1/5"
          disabled={isLoading}
          onClick={() => router.push("/poep/create")}
        >
          Create
        </button>
      </div>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-3 lg:grid-cols-4 md:gap-4 lg:gap-8 w-full lg:w-full px-2 md:px-16 lg:px-8 xl:px-24 py-4 lg:py-8 my-2 mx-0">
        {/* {hasHydrated && templates} */}
        Aquí van los templates
      </div>
    </div>
  );
};

export default Index;

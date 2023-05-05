import { useEffect } from "react";
import { useAccount } from "wagmi";
import BackButton from "~~/components/common/buttons/BackButton";
import { useScaffoldContractRead } from "~~/hooks/scaffold-eth";

const MyPobs = () => {
  const { address: userAddress } = useAccount();

  const { data: userPobCollections } = useScaffoldContractRead({
    contractName: "PersonalPOBFactory",
    functionName: "getUserPobCollections",
    args: [userAddress],
  });

  useEffect(() => {
    console.log(userPobCollections);
  }, [userPobCollections]);

  return (
    <div className="flex flex-col py-8 px-4 lg:px-8 lg:py-12 justify-center items-center min-h-full">
      <h1 className="text-4xl font-semibold text-center mb-4">My POBs</h1>
      <BackButton />
      <div
        id="user-pobs-container"
        className="w-full md:w-11/12 my-4 rounded-lg flex flex-col items-center bg-base-100 border-base-300 border shadow-md shadow-secondary"
      >
        Aqui van los POBs
      </div>
    </div>
  );
};

export default MyPobs;

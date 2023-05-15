import { useState } from "react";
import { useRouter } from "next/router";
import { useAccount } from "wagmi";
// import { Spinner } from "~~/components/Spinner";
import NavButton from "~~/components/common/buttons/NavButton";
import PrimaryButton from "~~/components/common/buttons/PrimaryButton";
import { useAccountBalance, useScaffoldContractRead, useScaffoldContractWrite } from "~~/hooks/scaffold-eth";
import { getTargetNetwork } from "~~/utils/scaffold-eth";

const Dashboard = () => {
  const poepProfileFactoryName = "POEPProfileFactory";

  const [errorMsg, setErrorMsg] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [profileHandle, setProfileHandle] = useState<string>("");

  // const pobContractAddress = BigNumber.from("0x01"); // adding this to remove lint errors, check later!

  const { address: userAddress } = useAccount();
  const { balance } = useAccountBalance(userAddress);
  const { name: networkName } = getTargetNetwork();
  const router = useRouter();

  const { data: userProfileAddress, isLoading: isLoadingUserProfileAddress } = useScaffoldContractRead({
    contractName: poepProfileFactoryName,
    functionName: "userAddressToProfile",
    args: [userAddress],
  });

  const {
    data: handleAssignedAddress,
    isRefetching: ishandleAssignedAddressRefetching,
    refetch: refetchHandleAssignedAddress,
  } = useScaffoldContractRead({
    contractName: poepProfileFactoryName,
    functionName: "profileHandleToUserAddress",
    args: [profileHandle],
    enabled: false,
  });

  const { writeAsync: createProfile } = useScaffoldContractWrite({
    contractName: poepProfileFactoryName,
    functionName: "createNewPoepProfile",
    args: [profileHandle, profileHandle.toUpperCase()],
  });

  const checkHandleAvailability = async () => {
    try {
      await refetchHandleAssignedAddress();
      if (handleAssignedAddress && parseInt(handleAssignedAddress) != 0) {
        setErrorMsg("Username already taken, try with another");
        throw new Error("Username already taken, try with another");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleSubmit = async (event: any) => {
    event.preventDefault();
    setIsLoading(true);
    try {
      await checkHandleAvailability();
      const res = await createProfile();
      setTimeout(() => {
        setIsLoading(false);
        if (res !== undefined) router.push("/dashboard");
      }, 500);
    } catch (error) {
      console.log(error);
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col py-8 px-4 lg:px-8 lg:py-12 lg:flex-row lg:flex-wrap justify-center items-center min-h-full">
      <h1 className="w-full text-4xl font-semibold text-center mb-4">Welcome to Proof of Beer</h1>
      <NavButton
        buttonText="Create POB"
        isDisabled={
          (userProfileAddress && parseInt(userProfileAddress) == 0) || isLoadingUserProfileAddress || isLoading
        }
        path="/pob/create"
      />
      <div
        id="profile-pob-container"
        className="w-full md:w-11/12 lg:w-2/5 my-4 rounded-lg flex flex-col items-center bg-base-100 border-base-300 border shadow-md shadow-secondary"
      >
        <div className="w-full flex flex-col md:flex-row md:flex-wrap lg py-8 px-4 justify-center items-center md:items-start">
          <form
            className="flex flex-col items-center justify-center w-full md:w-3/5 lg:w-4/5 p-2 px-4"
            onSubmit={handleSubmit}
          >
            <h3 className="text-center text-xl font-medium w-full mb-8">
              It looks like you don&apos;t have a POB Profile!
            </h3>
            <div className="w-full flex border-2 border-base-300 bg-base-200 rounded-lg text-accent mb-6">
              <input
                className="input input-ghost focus:outline-none focus:bg-transparent focus:text-gray-400 h-[2.5rem] min-h-[2.5rem] border w-full font-medium placeholder:text-accent/50 text-gray-400 text-lg text-center"
                type="text"
                placeholder="Enter a username..."
                name="profile_handle"
                value={profileHandle}
                onChange={event => setProfileHandle(event.target.value)}
                disabled={userProfileAddress ? parseInt(userProfileAddress) != 0 : true}
                autoComplete="off"
              />
            </div>
            {errorMsg && <p className="font-medium text-center text-red-600 mb-4">{errorMsg}</p>}
            <div className="w-full">
              <PrimaryButton
                buttonText="Create Profile"
                classModifier="text-lg w-2/3 px-0"
                isDisabled={profileHandle.length < 5 || ishandleAssignedAddressRefetching || isLoading}
                isLoading={isLoading}
                showLoader={true}
              />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

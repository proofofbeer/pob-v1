import { useMemo, useState } from "react";
import { useAccount } from "wagmi";
import { Spinner } from "~~/components/Spinner";
import NavButton from "~~/components/common/buttons/NavButton";
import PrimaryButton from "~~/components/common/buttons/PrimaryButton";
import FilePreview from "~~/components/image-handling/FilePreview";
import { useScaffoldContractRead, useScaffoldContractWrite } from "~~/hooks/scaffold-eth";
import { useDeployedContractRead } from "~~/hooks/scaffold-eth/useDeployedContractRead";

const Index = () => {
  // const POEPFactoryAddress = process.env.NEXT_PUBLIC_POEP_PROFILE_FACTORY_ADDRESS;
  const contractName = "POEPProfileFactory";
  const fileFormKey = "poep_image";

  const [errorMsg, setErrorMsg] = useState<string | undefined>(undefined);
  const [imgObj, setImgObj] = useState<any>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [profileHandle, setProfileHandle] = useState<string>("");

  const { address } = useAccount();

  const { data: userProfileAddress, isLoading: isLoadingUserProfileAddress } = useScaffoldContractRead({
    contractName,
    functionName: "walletToProfile",
    args: [address],
  });

  const {
    data: handleAssignedAddress,
    isRefetching: ishandleAssignedAddressRefetching,
    refetch: refetchHandleAssignedAddress,
  } = useScaffoldContractRead({
    contractName,
    functionName: "profileHandleToWallet",
    args: [profileHandle],
    enabled: false,
  });

  const {
    data: poepProfileName,
    isLoading: isLoadingpoepProfileName,
    refetch: refetchBalanceOf,
  }: any = useDeployedContractRead({
    contractAddress: userProfileAddress,
    contractName: "ERC721",
    functionName: "name",
    args: [],
    enabled: true,
  });

  const { writeAsync: createProfile, isLoading: isLoadingCreateProfile } = useScaffoldContractWrite({
    contractName: "POEPProfileFactory",
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
      console.log(res);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const previewImage = useMemo(() => {
    console.log(imgObj);
    if (imgObj) {
      return URL.createObjectURL(new Blob([imgObj]));
    }
    return null;
  }, [imgObj]);

  return (
    <div className="flex flex-col py-8 px-4 lg:px-8 lg:py-12 justify-center items-center min-h-full">
      <h1 className="text-4xl font-semibold text-center mb-4">Welcome to POEP</h1>
      <NavButton
        buttonText="Create DROP"
        isDisabled={(userProfileAddress && parseInt(userProfileAddress) == 0) || isLoadingUserProfileAddress}
        path="/poep/create"
      />
      <div
        id="drops-container"
        className="w-full md:w-4/5 my-4 rounded-lg flex flex-col items-center bg-base-100 border-base-300 border shadow-md shadow-secondary"
      >
        <div className="w-full flex flex-col py-8 px-4 lg:px-8 lg:py-12 justify-center items-center">
          <h2 className="text-2xl">Your current POEP</h2>
          {isLoadingUserProfileAddress && (
            <div className="mt-14">
              <Spinner width="50px" height="50px" />
            </div>
          )}
          {userProfileAddress && parseInt(userProfileAddress) ? (
            <>
              <FilePreview fileFormKey={fileFormKey} previewImage={previewImage} setImgObj={setImgObj} />
              <p className="break-words text-lg font-medium mt-4">Username: {poepProfileName}</p>
            </>
          ) : (
            <form className="flex flex-col items-center justify-center w-full pb-4 pt-8 px-4" onSubmit={handleSubmit}>
              <legend className="mb-8 text-lg text-center">It looks like you don&apos;t have a POEP Profile!</legend>
              <div className="w-full flex border-2 border-base-300 bg-base-200 rounded-lg text-accent">
                <input
                  className="input input-ghost focus:outline-none focus:bg-transparent focus:text-gray-400 h-[2.5rem] min-h-[2.5rem] border w-full font-medium placeholder:text-accent/50 text-gray-400 text-lg text-center"
                  type="text"
                  placeholder="Enter a username..."
                  name="profile_handle"
                  value={profileHandle}
                  onChange={event => {
                    console.log(event.target.value);
                    setProfileHandle(event.target.value);
                  }}
                  disabled={userProfileAddress ? parseInt(userProfileAddress) != 0 : true}
                  autoComplete="off"
                />
              </div>
              {errorMsg && <p className="font-medium text-center text-red-600 mt-4">{errorMsg}</p>}
              <div className="w-full mt-2 lg:mt-0">
                <PrimaryButton
                  buttonText="Create Profile"
                  classModifier="text-lg w-3/5"
                  isDisabled={ishandleAssignedAddressRefetching}
                />
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;

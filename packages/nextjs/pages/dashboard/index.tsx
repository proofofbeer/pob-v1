import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchSigner } from "@wagmi/core";
import axios from "axios";
import { ethers } from "ethers";
import toast from "react-hot-toast";
import { useAccount } from "wagmi";
import { Spinner } from "~~/components/Spinner";
import NavButton from "~~/components/common/buttons/NavButton";
import PrimaryButton from "~~/components/common/buttons/PrimaryButton";
import FilePreview from "~~/components/image-handling/FilePreview";
import NFTImage from "~~/components/image-handling/NFTImage";
import { POEPProfileContract } from "~~/contracts";
import { useScaffoldContractRead, useScaffoldContractWrite } from "~~/hooks/scaffold-eth";
import { useDeployedContractRead } from "~~/hooks/scaffold-eth/useDeployedContractRead";
import { INFTMetadata } from "~~/types/nft-metadata/nft-metadata";
import { getPersonalPOEPMetadata } from "~~/utils/poep";

const Dashboard = () => {
  const contractName = "POEPProfileFactory";
  const fileFormKey = "poep_image";

  const [errorMsg, setErrorMsg] = useState<string | undefined>(undefined);
  const [imgObj, setImgObj] = useState<any>(undefined);
  const [nftImageURI, setNftImageURI] = useState<string | undefined>(undefined);
  const [personalPobImageURI, setPersonalPobImageURI] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [profileHandle, setProfileHandle] = useState<string>("");
  const [newGlobalURI, setNewGlobalURI] = useState<string | undefined>(undefined);

  const { address: userAddress } = useAccount();

  const { data: userProfileAddress, isLoading: isLoadingUserProfileAddress } = useScaffoldContractRead({
    contractName,
    functionName: "userAddressToProfile",
    args: [userAddress],
  });

  const {
    data: handleAssignedAddress,
    isRefetching: ishandleAssignedAddressRefetching,
    refetch: refetchHandleAssignedAddress,
  } = useScaffoldContractRead({
    contractName,
    functionName: "profileHandleToUserAddress",
    args: [profileHandle],
    enabled: false,
  });

  const { data: personalPobAddress } = useScaffoldContractRead({
    contractName: "PersonalPOBFactory",
    functionName: "userAddressToPobAddress",
    args: [userAddress],
  });

  const { data: currentGlobalTokenURI }: any = useDeployedContractRead({
    contractAddress: userProfileAddress,
    contractName: "POEPProfile",
    functionName: "globalTokenURI",
    args: [],
    enabled: true,
  });

  const { data: username }: any = useDeployedContractRead({
    contractAddress: userProfileAddress,
    contractName: "POEPProfile",
    functionName: "name",
    args: [],
    enabled: true,
  });

  const { data: personalPobTokenURI, refetch: refetchPersonalPobTokenURI }: any = useDeployedContractRead({
    contractAddress: personalPobAddress,
    contractName: "PersonalPOB",
    functionName: "globalTokenURI",
    args: [],
    enabled: false,
  });

  const { writeAsync: createProfile } = useScaffoldContractWrite({
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
      if (res !== undefined) console.log(res);
      setTimeout(() => setIsLoading(false), 1500);
    } catch (error) {
      console.log(error);
      setIsLoading(false);
    }
  };

  const getFilesCid: any = useCallback(async () => {
    try {
      const formData = new FormData();
      formData.append("imgName", "image-0");
      formData.append("files", new Blob([imgObj]));
      const response = await axios.post("/api/upload-files", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return response.data.cid;
    } catch (error: any) {
      if (error.body) {
        const parsedBody = JSON.parse(error.body);
        const { message } = parsedBody.error;
        toast.error(message, {
          position: "bottom-right",
        });
      } else {
        console.error(error);
      }
    }
  }, [imgObj]);

  const writeSetGlobalTokenURI: any = useCallback(
    async (event: any) => {
      event.preventDefault();
      setIsLoading(true);
      if (!userProfileAddress || !username) {
        setIsLoading(false);
        return toast.error("No Profile Contract or Username connected", {
          position: "top-center",
        });
      }

      const signer = await fetchSigner();
      const poepProfileContract = new ethers.Contract(userProfileAddress, POEPProfileContract.abi, signer as any);

      try {
        console.log(username);
        const imgCid = await getFilesCid();
        const metadata: INFTMetadata = getPersonalPOEPMetadata({
          imgCid,
          profileAddress: userProfileAddress,
          username,
        });
        console.log(metadata);
        const res = await axios.post(
          "/api/upload-metadata",
          { metadata },
          {
            headers: {
              "Content-Type": "application/json",
            },
          },
        );
        setNewGlobalURI(res.data.cid);
        const tx = await poepProfileContract.setGlobalTokenURI(res.data.cid);
        toast.success("Successfully set your Profile", {
          position: "top-center",
        });
        console.log(tx);
        // console.log(tx.hash);
      } catch (error) {
        console.log(error);
      } finally {
        setIsLoading(false);
      }
    },
    [getFilesCid, userProfileAddress, username],
  );

  type TGetNftImageURIParams = {
    nftCid: string;
    pobNameImage: string;
  };

  const getNftImageURI = useCallback(async ({ nftCid, pobNameImage }: TGetNftImageURIParams) => {
    // console.log("calling from getNftImageURI", nftCid);
    let nftUrl = "";
    if (!nftCid) return "";
    if (pobNameImage === "profileImage") {
      // nftUrl = `https://${nftCid}.ipfs.nftstorage.link/nft-1`;
      nftUrl = `https://${nftCid}.ipfs.nftstorage.link/nft-1`;
    } else if (pobNameImage === "pobImage") {
      console.log("nftCid:", nftCid);
      // nftUrl = `https://${nftCid}.ipfs.nftstorage.link/nft-0`;
      nftUrl = `https://${nftCid}.ipfs.nftstorage.link/nft-0`;
      console.log("nftURL:", nftUrl);
    } else {
      return "";
    }
    // const cidString = nftCid.replace(protocolStr, httpStr);
    // console.log(cidString);
    const res = await axios.get(nftUrl);
    // console.log(`https://${nftCid}.ipfs.nftstorage.link/nft-1`);
    // const res = await axios.get(`https://nftstorage.link/ipfs/${nftCid}/nft-1`);
    console.log(res);
    const imgCid = res.data.image;
    if (pobNameImage === "profileImage") {
      console.log(`https://nftstorage.link/ipfs/${imgCid}/image-0`);
      return `https://nftstorage.link/ipfs/${imgCid}/image-0`;
    } else if (pobNameImage === "pobImage") {
      console.log(`https://nftstorage.link/ipfs/${imgCid}/image-0`);
      return `https://nftstorage.link/ipfs/${imgCid}/image-0`;
    } else {
      return "";
    }
  }, []);

  useEffect(() => {
    const fetchImageURI = async (tokenURI: string, pobNameImage: string) => {
      let formattedImageURI = "";
      if (currentGlobalTokenURI && username && pobNameImage === "profileImage") {
        formattedImageURI = await getNftImageURI({ nftCid: tokenURI, pobNameImage });
        setNftImageURI(formattedImageURI);
      }
      if (personalPobTokenURI && username && pobNameImage === "pobImage") {
        console.log("calling pob from useEffect", personalPobTokenURI);
        formattedImageURI = await getNftImageURI({ nftCid: tokenURI, pobNameImage });
        console.log(formattedImageURI);
        setPersonalPobImageURI(formattedImageURI);
      }
      return formattedImageURI;
    };
    if (currentGlobalTokenURI && !nftImageURI) {
      fetchImageURI(currentGlobalTokenURI, "profileImage");
    }
    // if (personalPobAddress && parseInt(personalPobAddress) != 0 && !personalPobTokenURI) {
    //   console.log("pobContractAddress:", personalPobAddress);
    //   refetchPersonalPobTokenURI();
    // }
    if (personalPobAddress) {
      console.log("pobContractAddress:", personalPobAddress);
      refetchPersonalPobTokenURI();
    }
    if (personalPobTokenURI) {
      console.log("pobContractAddress:", personalPobAddress);
      console.log("personalPobTokenURI:", personalPobTokenURI);
      fetchImageURI(personalPobTokenURI, "pobImage");
    }
    console.log("personalPob address:", personalPobAddress);
    // console.log("profile address:", userProfileAddress);
    // console.log(currentGlobalTokenURI);

    currentGlobalTokenURI && getNftImageURI(currentGlobalTokenURI);
  }, [
    currentGlobalTokenURI,
    getNftImageURI,
    nftImageURI,
    personalPobTokenURI,
    personalPobAddress,
    personalPobImageURI,
    refetchPersonalPobTokenURI,
    userProfileAddress,
    username,
  ]);

  const previewImage = useMemo(() => {
    if (imgObj) {
      return URL.createObjectURL(new Blob([imgObj]));
    }
    return null;
  }, [imgObj]);

  return (
    <div className="flex flex-col py-8 px-4 lg:px-8 lg:py-12 lg:flex-row lg:flex-wrap justify-center items-center min-h-full">
      <h1 className="w-full text-4xl font-semibold text-center mb-4">Welcome</h1>
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
          {isLoadingUserProfileAddress && (
            <div className="mt-14">
              <Spinner width="50px" height="50px" />
            </div>
          )}
          {userProfileAddress && parseInt(userProfileAddress) ? (
            <>
              {currentGlobalTokenURI && nftImageURI ? (
                <>
                  <h3 className="text-center text-2xl font-medium w-full">Your Profile</h3>
                  <div className="text-center text-lg font-medium w-full md:w-3/5 lg:w-full p-4">
                    <div className="m-2 px-8 lg:px-16 xl:px-24">
                      <NFTImage imageURI={nftImageURI} />
                    </div>
                    <div className="text-center text-lg font-medium w-full">
                      <div className="w-full flex justify-center gap-4 mt-8">
                        <button
                          className="btn btn-primary w-1/4 lg:w-1/5 normal-case"
                          disabled={currentGlobalTokenURI ? false : true}
                        >
                          Mint
                        </button>
                        <button className="btn btn-primary w-1/4 lg:w-1/5 normal-case" disabled={true}>
                          Share
                        </button>
                        <button className="btn btn-primary w-1/4 lg:w-1/5 normal-case" disabled={true}>
                          Change
                        </button>
                      </div>
                      <div className="w-full flex justify-center gap-4 mt-4">Sharing and changing coming soon!</div>
                      {/* <p className="mt-4">Username: {username}</p>
                      <a
                        href={`https://polygonscan.com/address/${userProfileAddress}`}
                        className="mt-2 flex items-center justify-center w-full"
                      >
                        Profile Contract <ArrowTopRightOnSquareIcon className="w-5 h-5 mb-1 ml-2" />
                      </a>
                      {currentGlobalTokenURI && (
                        <>
                          <p className="mt-6 mb-2 text-xl font-bold">POBs available: 6</p>
                          <p className="mt-4">POBs Drank: 0</p>
                          <p className="mt-4">POBs Shared: 0</p>
                          <p className="mt-4">POBs Collected: 0</p>
                        </>
                      )} */}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-center text-lg font-medium w-full">Let&apos;s set up your Profile POB!</p>
                  <div className="text-center text-lg font-medium w-full md:w-3/5 lg:w-full p-4">
                    <div className="m-2 px-8 lg:px-16 xl:px-24">
                      <FilePreview fileFormKey={fileFormKey} previewImage={previewImage} setImgObj={setImgObj} />
                    </div>
                    <div className="w-full mt-0">
                      <PrimaryButton
                        buttonText="Set Profile POB"
                        classModifier="text-lg w-3/5"
                        isDisabled={!previewImage || isLoading}
                        onClick={writeSetGlobalTokenURI}
                      />
                    </div>
                  </div>
                </>
              )}
            </>
          ) : !currentGlobalTokenURI ? (
            <form
              className="flex flex-col items-center justify-center w-full md:w-3/5 lg:w-4/5 pb-4 pt-8 px-4"
              onSubmit={handleSubmit}
            >
              <legend className="mb-8 lg:mb-4 text-lg text-center">It looks like you don&apos;t have one!</legend>
              <div className="w-full flex border-2 border-base-300 bg-base-200 rounded-lg text-accent">
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
              {errorMsg && <p className="font-medium text-center text-red-600 mt-4">{errorMsg}</p>}
              <div className="w-full mt-6 lg:mt-2">
                <PrimaryButton
                  buttonText="Create Profile"
                  classModifier="text-lg w-3/5 md:w-1/2"
                  isDisabled={profileHandle.length < 5 || ishandleAssignedAddressRefetching || isLoading}
                  isLoading={isLoading}
                />
              </div>
            </form>
          ) : (
            <p>Sí hay TokenURI</p>
          )}
        </div>
      </div>
      {personalPobAddress && parseInt(personalPobAddress) ? (
        <div
          id="personal-pobs-container"
          className="w-full md:w-11/12 lg:w-2/5 lg:ml-8 xl:ml-16 my-4 rounded-lg flex flex-col items-center bg-base-100 border-base-300 border shadow-md shadow-secondary"
        >
          <div className="w-full flex flex-col md:flex-row md:flex-wrap lg py-8 px-4 justify-center items-center md:items-start">
            {personalPobTokenURI && personalPobImageURI && (
              <>
                <h3 className="text-center text-2xl font-medium w-full">Active POBs</h3>
                <div className="text-center text-lg font-medium w-full md:w-3/5 lg:w-full p-4">
                  <div className="m-2 px-8 lg:px-16 xl:px-24">
                    <NFTImage imageURI={personalPobImageURI} />
                  </div>
                  <div className="text-center text-lg font-medium w-full">
                    <div className="w-full flex justify-center gap-4 mt-8">
                      <button className="btn btn-primary w-1/4 lg:w-1/5 normal-case" disabled={!personalPobTokenURI}>
                        Mint
                      </button>
                      <button className="btn btn-primary w-1/4 lg:w-1/5 normal-case" disabled={true}>
                        Share
                      </button>
                    </div>
                    <div className="w-full flex justify-center gap-4 mt-4">Sharing coming soon!</div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default Dashboard;

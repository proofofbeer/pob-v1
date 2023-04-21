import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchSigner } from "@wagmi/core";
import axios from "axios";
import { ethers } from "ethers";
import toast from "react-hot-toast";
import { useAccount } from "wagmi";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";
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

const Index = () => {
  // const POEPFactoryAddress = process.env.NEXT_PUBLIC_POEP_PROFILE_FACTORY_ADDRESS;

  // const ethereum = (window as any).ethereum;
  // const provider = new ethers.providers.Web3Provider(ethereum);
  // const wagmiProvider = getProvider();
  const contractName = "POEPProfileFactory";
  const fileFormKey = "poep_image";
  const metadataURI = "";

  const [errorMsg, setErrorMsg] = useState<string | undefined>(undefined);
  const [imgObj, setImgObj] = useState<any>(undefined);
  const [nftImageURI, setNftImageURI] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [profileHandle, setProfileHandle] = useState<string>("");
  const [newGlobalURI, setNewGlobalURI] = useState<string | undefined>(undefined);

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

  const { writeAsync: createProfile } = useScaffoldContractWrite({
    contractName: "POEPProfileFactory",
    functionName: "createNewPoepProfile",
    args: [profileHandle, profileHandle.toUpperCase()],
  });

  // const { writeAsync: writeGlobalURI, isLoading: isLoadingSetGlobalURI } = useDeployedContractWrite({
  //   contractAddress: userProfileAddress,
  //   contractName: "POEPProfile",
  //   functionName: "setGlobalTokenURI",
  //   args: [metadataURI],
  // });

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

  const getFilesCid: any = useCallback(async () => {
    try {
      const formData = new FormData();
      formData.append("imgName", `${profileHandle}-personal-poep-file`);
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
  }, [imgObj, profileHandle]);

  // const handleSetGlobalTokenURI: any = useCallback(
  //   async (event: any) => {
  //     event.preventDefault();
  //     setIsLoading(true);
  //     if (!userProfileAddress || !username) {
  //       setIsLoading(false);
  //       return toast.error("No Profile Contract or Username connected", {
  //         position: "top-center",
  //       });
  //     }
  //     try {
  //       const imgCid = await getFilesCid();
  //       const metadata: INFTMetadata = getPersonalPOEPMetadata({
  //         imgCid,
  //         profileAddress: userProfileAddress,
  //         username,
  //       });
  //       const res = await axios.post(
  //         "/api/upload-metadata",
  //         { metadata },
  //         {
  //           headers: {
  //             "Content-Type": "application/json",
  //           },
  //         },
  //       );
  //       console.log("metadataURI:", res.data.cid);
  //       metadataURI = res.data.cid;
  //       setNewGlobalURI(res.data.cid);
  //       console.log("sending this", metadataURI);
  //       console.log("to this address", userProfileAddress);
  //       console.log("this is crap", newGlobalURI);
  //       setTimeout(async () => {
  //         await writeGlobalURI();
  //         toast.success("Successfully set your Personal POEP", {
  //           position: "top-center",
  //         });
  //       }, 2000);
  //     } catch (error) {
  //       console.log(error);
  //     } finally {
  //       setIsLoading(false);
  //     }
  //   },
  //   [getFilesCid, userProfileAddress, username, writeGlobalURI],
  // );

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

      // const accounts = await ethereum.request({
      //   method: "eth_requestAccounts",
      // });
      // const signer = provider.getSigner(accounts[0]);
      const signer = await fetchSigner();
      const poepProfileContract = new ethers.Contract(userProfileAddress, POEPProfileContract.abi, signer as any);

      try {
        const imgCid = await getFilesCid();
        const metadata: INFTMetadata = getPersonalPOEPMetadata({
          imgCid,
          profileAddress: userProfileAddress,
          username,
        });
        const res = await axios.post(
          "/api/upload-metadata",
          { metadata },
          {
            headers: {
              "Content-Type": "application/json",
            },
          },
        );
        console.log("metadataURI:", res.data.cid);
        // metadataURI = res.data.cid;
        setNewGlobalURI(res.data.cid);
        console.log("sending this", metadataURI);
        console.log("to this address", userProfileAddress);
        console.log("this is crap", newGlobalURI);
        const tx = await poepProfileContract.setGlobalTokenURI(res.data.cid);
        toast.success("Successfully set your Personal BEER", {
          position: "top-center",
        });
        console.log(tx);
        console.log(tx.hash);
        // setTimeout(async () => {
        //   await writeGlobalURI();
        // }, 2000);
      } catch (error) {
        console.log(error);
      } finally {
        setIsLoading(false);
      }
    },
    [getFilesCid, newGlobalURI, userProfileAddress, username],
  );

  type TGetNftImageURIParams = {
    nftCid: string;
    protocolStr?: string;
    httpStr?: string;
  };

  const getNftImageURI = useCallback(
    async ({ nftCid, protocolStr = "ipfs://", httpStr = "" }: TGetNftImageURIParams) => {
      console.log("calling from getNftImageURI", nftCid);
      if (!nftCid) return "";
      const cidString = nftCid.replace(protocolStr, httpStr);
      const res = await axios.get(`https://nftstorage.link/ipfs/${cidString}`);
      const imgCid = res.data.image;
      console.log(`https://nftstorage.link/ipfs/${imgCid}/${username}-personal-poep-file`);
      return `https://nftstorage.link/ipfs/${imgCid}/${username}-personal-poep-file`;
    },
    [username],
  );

  useEffect(() => {
    const fetchImageURI = async () => {
      let formattedImageURI = "";
      if (currentGlobalTokenURI && username) {
        console.log("calling from useEffect", currentGlobalTokenURI);
        formattedImageURI = await getNftImageURI({ nftCid: currentGlobalTokenURI });
        setNftImageURI(formattedImageURI);
      }
      return formattedImageURI;
    };
    if (currentGlobalTokenURI && !nftImageURI) {
      fetchImageURI();
    }
    console.log(currentGlobalTokenURI);
    console.log(userProfileAddress);

    currentGlobalTokenURI && getNftImageURI(currentGlobalTokenURI);
  }, [currentGlobalTokenURI, getNftImageURI, nftImageURI, userProfileAddress, username]);

  const previewImage = useMemo(() => {
    if (imgObj) {
      return URL.createObjectURL(new Blob([imgObj]));
    }
    return null;
  }, [imgObj]);

  return (
    <div className="flex flex-col py-8 px-4 lg:px-8 lg:py-12 justify-center items-center min-h-full">
      <h1 className="text-4xl font-semibold text-center mb-4">Your BEERS</h1>
      <NavButton
        buttonText="Create BEER"
        isDisabled={
          (userProfileAddress && parseInt(userProfileAddress) == 0) || isLoadingUserProfileAddress || isLoading
        }
        path="/beer/create"
      />
      <div
        id="personal-beer-container"
        className="w-full md:w-11/12 my-4 rounded-lg flex flex-col items-center bg-base-100 border-base-300 border shadow-md shadow-secondary"
      >
        <div className="w-full flex flex-col md:flex-row md:flex-wrap lg py-8 px-4 lg:px-8 lg:py-12 justify-center items-center md:items-start">
          <h2 className="text-center text-2xl w-full">Your Personal BEER</h2>
          {isLoadingUserProfileAddress && (
            <div className="mt-14">
              <Spinner width="50px" height="50px" />
            </div>
          )}
          {userProfileAddress && parseInt(userProfileAddress) ? (
            <>
              {currentGlobalTokenURI && nftImageURI ? (
                <div className="text-center text-lg font-medium w-full md:w-3/5 p-4">
                  <div className="m-2 px-8 lg:px-20 xl:px-24 2xl:px-32">
                    <NFTImage imageURI={nftImageURI} />
                  </div>
                </div>
              ) : (
                <div className="text-center text-lg font-medium w-full md:w-3/5 p-4">
                  <p className="m-4">Let&apos;s set up your Personal BEER!</p>
                  <div className="m-2 px-8 lg:px-20 xl:px-24 2xl:px-32">
                    <FilePreview fileFormKey={fileFormKey} previewImage={previewImage} setImgObj={setImgObj} />
                  </div>
                  <div className="w-full mt-0">
                    <PrimaryButton
                      buttonText="Set Personal BEER"
                      classModifier="text-lg w-3/5"
                      isDisabled={!previewImage || isLoading}
                      onClick={writeSetGlobalTokenURI}
                    />
                  </div>
                </div>
              )}
              <div className="text-center text-lg font-medium w-full md:w-2/5 md:flex md:flex-col md:mt-6 lg:mt-0 xl:mt-4">
                <div className="w-full flex justify-center gap-4 lg:m-4">
                  <button
                    className="btn btn-primary w-1/4 lg:w-1/5 normal-case"
                    disabled={currentGlobalTokenURI ? false : true}
                  >
                    Drink
                  </button>
                  <button
                    className="btn btn-primary w-1/4 lg:w-1/5 normal-case"
                    disabled={currentGlobalTokenURI ? false : true}
                  >
                    Share
                  </button>
                  <button
                    className="btn btn-primary w-1/4 lg:w-1/5 normal-case"
                    disabled={currentGlobalTokenURI ? false : true}
                  >
                    Change
                  </button>
                </div>
                <p className="mt-4">Username: {username}</p>
                <a
                  href={`https://polygonscan.com/address/${userProfileAddress}`}
                  className="mt-2 flex items-center justify-center w-full"
                >
                  Profile Contract <ArrowTopRightOnSquareIcon className="w-5 h-5 mb-1 ml-2" />
                </a>
                {currentGlobalTokenURI && (
                  <>
                    <p className="mt-6 mb-2 text-xl font-bold">BEERS available: 6</p>
                    <p className="mt-4">BEERS Drank: 0</p>
                    <p className="mt-4">BEERS Shared: 0</p>
                    <p className="mt-4">BEERS Collected: 0</p>
                  </>
                )}
              </div>
            </>
          ) : !currentGlobalTokenURI ? (
            <form
              className="flex flex-col items-center justify-center w-full md:w-3/5 lg:w-1/2 xl:w-2/5 pb-4 pt-8 px-4"
              onSubmit={handleSubmit}
            >
              <legend className="mb-8 lg:mb-4 text-lg text-center">
                It looks like you don&apos;t have a PoB Profile!
              </legend>
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
                  isDisabled={ishandleAssignedAddressRefetching || isLoading}
                />
              </div>
            </form>
          ) : (
            <p>Sí hay TokenURI</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;

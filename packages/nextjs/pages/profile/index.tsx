import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
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
import POBImage from "~~/components/image-handling/POBImage";
import { AddressInput } from "~~/components/scaffold-eth";
import { POEPProfileContract } from "~~/contracts";
import { useAccountBalance, useScaffoldContractRead, useScaffoldContractWrite } from "~~/hooks/scaffold-eth";
import { useDeployedContractRead } from "~~/hooks/scaffold-eth/useDeployedContractRead";
import { useDeployedContractWrite } from "~~/hooks/scaffold-eth/useDeployedContractWrite";
import { INFTMetadata } from "~~/types/nft-metadata/nft-metadata";
import { getPersonalPOEPMetadata } from "~~/utils/poep";
import { getTargetNetwork } from "~~/utils/scaffold-eth";

const Dashboard = () => {
  const poepProfileFactoryName = "POEPProfileFactory";
  // const personalPobFactoryName = "PersonalPOBFactory";
  const poepProfileName = "POEPProfile";
  // const personalPobName = "PersonalPOB";
  // const personalPobContractAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
  const fileFormKey = "poep_image";

  const [errorMsg, setErrorMsg] = useState<string | undefined>(undefined);
  const [imgObj, setImgObj] = useState<any>(undefined);
  const [nftImageURI, setNftImageURI] = useState<string | undefined>(undefined);
  // const [personalPobImageURI, setPersonalPobImageURI] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [profileHandle, setProfileHandle] = useState<string>("");
  const [mintProfilePobAddress, setMintProfilePobAddress] = useState<string>("");
  // const [mintPersonalPobAddress, setMintPersonalPobAddress] = useState<string>("");
  const [timeUntilNextChange, setTimeUntilNextChange] = useState<number | undefined>(undefined);
  const [isChangeModalOpen, setIsChangeModalOpen] = useState<boolean>(false);

  // const pobContractAddress = BigNumber.from("0x01"); // adding this to remove lint errors, check later!

  const { address: userAddress } = useAccount();
  const { balance } = useAccountBalance(userAddress);
  const { name: networkName } = getTargetNetwork();

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

  // const { data: personalPobAddress } = useScaffoldContractRead({
  //   contractName: personalPobFactoryName,
  //   functionName: "userAddressToPobAddresses",
  //   args: [userAddress, pobContractAddress],
  // });

  const { data: currentGlobalTokenURI, refetch: refetchCurrentGlobalTokenURI }: any = useDeployedContractRead({
    contractAddress: userProfileAddress,
    contractName: poepProfileName,
    functionName: "globalTokenURI",
    args: [],
    enabled: true,
  });

  const { data: username }: any = useDeployedContractRead({
    contractAddress: userProfileAddress,
    contractName: poepProfileName,
    functionName: "name",
    args: [],
    enabled: true,
  });

  const { data: profilePobTotalSupply, refetch: refetchProfilePobTotalSupply }: any = useDeployedContractRead({
    contractAddress: userProfileAddress,
    contractName: poepProfileName,
    functionName: "totalSupply",
    args: [],
    enabled: true,
  });

  const { data: profilePobTimeUntilNextChange, refetch: refetchProfilePobTimeUntilNextChange }: any =
    useDeployedContractRead({
      contractAddress: userProfileAddress,
      contractName: poepProfileName,
      functionName: "timeUntilNextChange",
      args: [],
      enabled: true,
    });

  // const { data: personalPobTokenURI, refetch: refetchPersonalPobTokenURI }: any = useDeployedContractRead({
  //   contractAddress: personalPobAddress,
  //   contractName: personalPobName,
  //   functionName: "globalTokenURI",
  //   args: [],
  //   enabled: false,
  // });

  // const { data: personalPobTotalSupply, refetch: refetchPersonalPobTotalSupply }: any = useDeployedContractRead({
  //   contractAddress: personalPobAddress,
  //   contractName: personalPobName,
  //   functionName: "totalSupply",
  //   args: [],
  //   enabled: false,
  // });

  const { writeAsync: createProfile } = useScaffoldContractWrite({
    contractName: poepProfileFactoryName,
    functionName: "createNewPoepProfile",
    args: [profileHandle, profileHandle.toUpperCase()],
  });

  const {
    writeAsync: writeMintProfilePob,
    isLoading: isLoadingMintProfilePob,
    isMining: isMiningMintProfilePob,
  } = useDeployedContractWrite({
    contractAddress: userProfileAddress,
    contractName: poepProfileName,
    functionName: "safeMint",
    args: [mintProfilePobAddress],
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
      setTimeout(() => {
        setIsLoading(false);
      }, 500);
    } catch (error) {
      console.log(error);
      setIsLoading(false);
    }
  };

  const getFilesCid: any = useCallback(async () => {
    if (!imgObj) return;
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
        const tx = await poepProfileContract.changeGlobalTokenURI(res.data.nftUrl);
        await refetchCurrentGlobalTokenURI();
        await refetchProfilePobTimeUntilNextChange();
        console.log(tx);
        setImgObj(undefined);
        toast.success("Successfully set your Profile", {
          position: "top-center",
        });
      } catch (error: any) {
        console.log(error);
        if (error.error) {
          toast.error(error.error.data.message || "Please try again later 🫣", {
            position: "top-center",
          });
        } else {
          toast.error("An error occurred, please try again later 🫣", {
            position: "top-center",
          });
        }
      } finally {
        setIsLoading(false);
      }
    },
    [getFilesCid, refetchCurrentGlobalTokenURI, refetchProfilePobTimeUntilNextChange, userProfileAddress, username],
  );

  const getGatewayImageUrl = useCallback(async (nftUrl: string) => {
    const nftCid = nftUrl.substring(7);
    const res = await axios.get(`https://apefomo-ipfs-gateway.mypinata.cloud/ipfs/${nftCid}`);
    const { image: imageUri } = res.data;
    const imageCid = imageUri.substring(7);

    return `https://apefomo-ipfs-gateway.mypinata.cloud/ipfs/${imageCid}`;
  }, []);

  const changeProfilePobImage: any = useCallback(
    async (event: any) => {
      event.preventDefault();
      setIsLoading(true);

      if (!userProfileAddress || !username) {
        setIsLoading(false);
        return toast.error("No Profile Contract or Username connected", {
          position: "top-center",
        });
      }

      if (!balance) {
        toast.error("No balance read from account, please try again", {
          position: "top-center",
        });
        setIsLoading(false);
        return;
      }

      if (timeUntilNextChange && Date.now() < timeUntilNextChange && balance && balance < 1.1) {
        toast.error("You don't have enough balance :(", {
          position: "top-center",
        });
        setIsLoading(false);
        return;
      }

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
        let tx;
        if (timeUntilNextChange && Date.now() >= timeUntilNextChange) {
          tx = await poepProfileContract.changeGlobalTokenURI(res.data.nftUrl);
        } else if (timeUntilNextChange && Date.now() < timeUntilNextChange) {
          tx = await poepProfileContract.requestChangeGlobalTokenURI(res.data.nftUrl, {
            value: ethers.utils.parseEther("1.0"),
          });
        }
        await refetchCurrentGlobalTokenURI();
        await refetchProfilePobTimeUntilNextChange();
        setNftImageURI(undefined);
        console.log(tx);
        setTimeout(() => {
          setIsChangeModalOpen(false);
          setImgObj(undefined);
          setIsLoading(false);
          toast.success("Successfully changed your Profile", {
            position: "top-center",
          });
        }, 500);
      } catch (error: any) {
        console.log(error);
        toast.error(error.error.data.message || "Please try again later 🫣", {
          position: "top-center",
        });
        setIsLoading(false);
      }
    },
    [
      balance,
      getFilesCid,
      refetchCurrentGlobalTokenURI,
      refetchProfilePobTimeUntilNextChange,
      timeUntilNextChange,
      userProfileAddress,
      username,
    ],
  );

  useEffect(() => {
    const fetchImageURI = async (tokenURI: string, pobNameImage: string) => {
      let formattedImageURI = "";
      if (currentGlobalTokenURI && username && pobNameImage === "profileImage") {
        formattedImageURI = await getGatewayImageUrl(tokenURI);
        setNftImageURI(formattedImageURI);
      }
      return formattedImageURI;
    };
    if (currentGlobalTokenURI && !nftImageURI) {
      fetchImageURI(currentGlobalTokenURI, "profileImage");
      setTimeUntilNextChange(parseInt(profilePobTimeUntilNextChange) * 1000);
    }
  }, [
    currentGlobalTokenURI,
    nftImageURI,
    userProfileAddress,
    username,
    getGatewayImageUrl,
    profilePobTimeUntilNextChange,
    timeUntilNextChange,
  ]);

  const previewImage = useMemo(() => {
    if (imgObj) {
      return URL.createObjectURL(new Blob([imgObj]));
    }
    return null;
  }, [imgObj]);

  return (
    <div className="flex flex-col py-8 px-4 lg:px-8 lg:py-12 lg:flex-row lg:flex-wrap justify-center items-center min-h-full">
      <h1 className="w-full text-4xl font-semibold text-center mb-4">Welcome {username}</h1>
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
                  <h2 className="text-center text-2xl font-medium w-full">{username}&apos;s Profile POB</h2>
                  <div className="text-center text-lg font-medium w-full md:w-3/5 lg:w-full p-4">
                    <div className="m-2 px-8 lg:px-24 xl:px-32">
                      <POBImage imageURI={nftImageURI} />
                    </div>
                    <div className="text-center text-lg font-medium w-full">
                      <div className="w-full flex justify-center gap-4 mt-8">
                        <div className="w-1/4 lg:w-1/5">
                          <label htmlFor="mint-profile-pob-modal" className="btn btn-primary normal-case w-full">
                            Mint
                          </label>
                          <input type="checkbox" id="mint-profile-pob-modal" className="modal-toggle" />
                          <div className="modal">
                            <div className="modal-box relative">
                              <label
                                htmlFor="mint-profile-pob-modal"
                                className="btn btn-sm btn-circle absolute right-2 top-2"
                              >
                                ✕
                              </label>
                              <h2 className="mt-12 mb-8 text-2xl font-medium text-center">Mint NFT and transfer to:</h2>
                              <div className="mb-8 px-4">
                                <AddressInput
                                  name="mintRecipientAddress"
                                  onChange={(value: any) => setMintProfilePobAddress(value)}
                                  placeholder="Enter address or ENS"
                                  value={mintProfilePobAddress}
                                />
                              </div>
                              <div className="w-full flex justify-center mt-8 mb-8">
                                <PrimaryButton
                                  buttonText="Mint"
                                  classModifier="w-3/5 md:w-3/5 lg:w-2/5 text-xl"
                                  isDisabled={isLoading || isLoadingMintProfilePob || isMiningMintProfilePob}
                                  isLoading={isLoading || isLoadingMintProfilePob || isMiningMintProfilePob}
                                  onClick={async () => {
                                    await writeMintProfilePob();
                                    setMintProfilePobAddress("");
                                    refetchProfilePobTotalSupply();
                                  }}
                                  showLoader={true}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="w-1/4 lg:w-1/5">
                          <label htmlFor="share-profile-pob-modal" className="btn btn-disabled normal-case w-full">
                            Share
                          </label>
                          <input disabled type="checkbox" id="share-profile-pob-modal" className="modal-toggle" />
                          <div className="modal">
                            <div className="modal-box relative">
                              <label
                                htmlFor="share-profile-pob-modal"
                                className="btn btn-sm btn-circle absolute right-2 top-2"
                              >
                                ✕
                              </label>
                              <h2 className="mt-12 mb-8 text-2xl font-medium text-center">Share mint link:</h2>
                              <div className="mb-8 px-4">
                                <AddressInput
                                  name="mintRecipientAddress"
                                  onChange={(value: any) => setMintProfilePobAddress(value)}
                                  placeholder="Enter address or ENS"
                                  value={mintProfilePobAddress}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="w-1/4 lg:w-1/5">
                          <label
                            htmlFor="change-profile-pob-modal"
                            className="btn btn-primary normal-case w-full"
                            onClick={() => setIsChangeModalOpen(true)}
                          >
                            Change
                          </label>
                          <input
                            className="modal-toggle"
                            checked={isChangeModalOpen}
                            id="change-profile-pob-modal"
                            readOnly
                            type="checkbox"
                          />
                          <div className="modal">
                            <div className="modal-box relative">
                              <label
                                htmlFor="change-profile-pob-modal"
                                className="btn btn-sm btn-circle absolute right-2 top-2"
                                onClick={() => {
                                  setIsChangeModalOpen(false);
                                  setImgObj(undefined);
                                }}
                              >
                                ✕
                              </label>
                              <h2 className="mt-12 mb-8 text-2xl font-medium text-center">Change your POB image:</h2>
                              <div className="mb-8 px-4">
                                <div className="m-2 px-6 md:px-12 lg:px-16 xl:px-24">
                                  <FilePreview
                                    chain={networkName}
                                    fileFormKey={fileFormKey}
                                    previewImage={previewImage}
                                    setImgObj={setImgObj}
                                  />
                                </div>

                                {timeUntilNextChange && Date.now() < timeUntilNextChange && (
                                  <div className="w-full flex justify-center mt-8 mb-2">
                                    <p className="font-medium border-orange-700 border-2 rounded-xl w-3/5 lg:w-2/5 text-md py-2">
                                      Cost: 1 MATIC
                                    </p>
                                  </div>
                                )}
                                <div className="w-full flex flex-wrap justify-center mb-8">
                                  <PrimaryButton
                                    buttonText="Change"
                                    classModifier="w-3/5 md:w-3/5 lg:w-2/5 text-xl lg:text-md"
                                    isDisabled={!imgObj || isLoading}
                                    isLoading={isLoading}
                                    onClick={changeProfilePobImage}
                                    showLoader={true}
                                  />
                                  {errorMsg && <p className="text-lg w-full text-red-400">{errorMsg}</p>}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="mt-4">
                        <p className="mb-2">
                          Total minted: {profilePobTotalSupply && parseInt(profilePobTotalSupply._hex)}
                        </p>
                        <Link
                          className="flex justify-center items-center hover:cursor-pointer hover:underline hover:underline-offset-2 w-full mb-2"
                          href={`https://mumbai.polygonscan.com/address/${userProfileAddress}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          View on Explorer
                          <ArrowTopRightOnSquareIcon className="w-4 ml-2" />
                        </Link>
                        <p>Sharing coming soon!</p>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-center text-lg font-medium w-full">Let&apos;s set up your Profile POB!</p>
                  <div className="text-center text-lg font-medium w-full md:w-3/5 lg:w-full p-4">
                    <div className="m-2 px-8 lg:px-16 xl:px-24">
                      <FilePreview
                        chain={networkName}
                        fileFormKey={fileFormKey}
                        previewImage={previewImage}
                        setImgObj={setImgObj}
                      />
                    </div>
                    <div className="w-full mt-0">
                      <PrimaryButton
                        buttonText="Set Profile POB"
                        classModifier="text-lg w-2/3 px-0"
                        isDisabled={!previewImage || isLoading}
                        isLoading={isLoading}
                        onClick={writeSetGlobalTokenURI}
                        showLoader={true}
                      />
                    </div>
                  </div>
                </>
              )}
            </>
          ) : !currentGlobalTokenURI ? (
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
          ) : (
            <p>Sí hay TokenURI</p>
          )}
        </div>
      </div>
      {/* {personalPobAddress && parseInt(personalPobAddress) ? (
        <div
          id="personal-pobs-container"
          className="w-full md:w-11/12 lg:w-2/5 lg:ml-8 xl:ml-16 my-4 rounded-lg flex flex-col items-center bg-base-100 border-base-300 border shadow-md shadow-secondary"
        >
          <div className="w-full flex flex-col md:flex-row md:flex-wrap lg py-8 px-4 justify-center items-center md:items-start">
            {personalPobTokenURI && personalPobImageURI && (
              <>
                <h2 className="text-center text-2xl font-medium w-full">Active POBs</h2>
                <div className="text-center text-lg font-medium w-full md:w-3/5 lg:w-full p-4">
                  <div className="m-2 px-8 lg:px-16 xl:px-24">
                    <NFTImage imageURI={personalPobImageURI} />
                  </div>
                  <div className="text-center text-lg font-medium w-full">
                    <div className="w-full flex justify-center gap-4 mt-8">
                      <div className="w-1/4 lg:w-1/5">
                        <label
                          htmlFor="mint-personal-pob-modal"
                          className="btn btn-primary normal-case w-full"
                          // disabled={currentGlobalTokenURI ? false : true}
                        >
                          Mint
                        </label>
                        <input type="checkbox" id="mint-personal-pob-modal" className="modal-toggle" />
                        <div className="modal">
                          <div className="modal-box relative">
                            <label
                              htmlFor="mint-personal-pob-modal"
                              className="btn btn-sm btn-circle absolute right-2 top-2"
                            >
                              ✕
                            </label>
                            <h2 className="mt-12 mb-8 text-2xl font-medium text-center">Mint NFT and transfer to:</h2>
                            <div className="mb-8 px-4">
                              <AddressInput
                                name="mintRecipientAddress"
                                onChange={(value: any) => setMintPersonalPobAddress(value)}
                                placeholder="Enter address or ENS"
                                value={mintPersonalPobAddress}
                              />
                            </div>
                            <div className="w-full flex justify-center mt-8 mb-8">
                              <PrimaryButton
                                buttonText="Mint"
                                classModifier="w-3/5 md:w-3/5 lg:w-2/5 text-xl"
                                isDisabled={isLoading || isLoadingMintPersonalPob || isMiningMintPersonalPob}
                                isLoading={isLoading}
                                onClick={async () => {
                                  await writeMintPersonalPob();
                                  setMintPersonalPobAddress("");
                                  refetchPersonalPobTotalSupply();
                                }}
                                showLoader={true}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="w-1/4 lg:w-1/5">
                        <label htmlFor="share-profile-pob-modal" className="btn btn-disabled normal-case w-full">
                          Share
                        </label>
                        <input disabled type="checkbox" id="share-profile-pob-modal" className="modal-toggle" />
                        <div className="modal">
                          <div className="modal-box relative">
                            <label
                              htmlFor="share-profile-pob-modal"
                              className="btn btn-sm btn-circle absolute right-2 top-2"
                            >
                              ✕
                            </label>
                            <h2 className="mt-12 mb-8 text-2xl font-medium text-center">Share mint link:</h2>
                            <div className="mb-8 px-4">
                              <AddressInput
                                name="mintRecipientAddress"
                                onChange={(value: any) => setMintPersonalPobAddress(value)}
                                placeholder="Enter address or ENS"
                                value={mintPersonalPobAddress}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4">
                      <p className="mb-2">
                        Total minted: {personalPobTotalSupply && parseInt(personalPobTotalSupply._hex)}
                      </p>
                      <Link
                        className="flex justify-center items-center hover:cursor-pointer hover:underline hover:underline-offset-2 w-full mb-2"
                        href={`https://mumbai.polygonscan.com/address/${personalPobAddress}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        View on Explorer
                        <ArrowTopRightOnSquareIcon className="w-4 ml-2" />
                      </Link>
                      <p>Sharing coming soon!</p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      ) : null} */}
    </div>
  );
};

export default Dashboard;

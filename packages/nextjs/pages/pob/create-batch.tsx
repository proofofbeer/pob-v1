import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import router from "next/router";
import { fetchSigner } from "@wagmi/core";
import axios from "axios";
import { ethers } from "ethers";
import toast from "react-hot-toast";
import { useAccount } from "wagmi";
import { PencilIcon } from "@heroicons/react/24/outline";
import Loader from "~~/components/common/Loader";
import BackButton from "~~/components/common/buttons/BackButton";
import PrimaryButton from "~~/components/common/buttons/PrimaryButton";
import POBImage from "~~/components/image-handling/POBImage";
import POBPreview from "~~/components/image-handling/POBPreview";
import { InputBase } from "~~/components/inputs/InputBase";
import ToggleInput from "~~/components/inputs/ToggleInput";
import { createPobBatchInputsArray, getInitialPobFormState } from "~~/components/pob/pob-form-input";
import { PersonalPOBFactoryContract } from "~~/contracts";
import { useAccountBalance, useScaffoldContractRead, useScaffoldEventSubscriber } from "~~/hooks/scaffold-eth";
import { useAppStore } from "~~/services/store/store";
import { formatDateLocale } from "~~/utils/date/get-formatted-dates";
import { createRandomWallets } from "~~/utils/web3/wallet-generation";

const CreatePOBBatch = () => {
  const deployedPersonalPOBFactory = process.env.NEXT_PUBLIC_PERSONAL_POB_FACTORY_ADDRESS_LOCAL || "0x0";
  const contractName = "POEPProfileFactory";
  const fileFormKey = "pob_image";
  const [form, setForm] = useState<Record<string, any>>(() => getInitialPobFormState(createPobBatchInputsArray));
  const [imgObj, setImgObj] = useState<any>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [step, setStep] = useState<string>("form");
  const [newPobWalletsArray, setNewPobWalletsArray] = useState<any[] | undefined>();
  const [newPrivKeysArray, setNewPrivKeysArray] = useState<any[] | undefined>();
  const { setPobBatchDataArray } = useAppStore(state => ({
    setPobBatchDataArray: state.setPobBatchDataArray,
  }));

  const { address: userAddress } = useAccount();
  const { balance, isLoading: isLoadingBalance } = useAccountBalance(userAddress);

  const { data: userPobProfileAddress } = useScaffoldContractRead({
    contractName,
    functionName: "userAddressToProfile",
    args: [userAddress],
  });

  useScaffoldEventSubscriber({
    contractName: "PersonalPOBFactory",
    eventName: "DeployPOBContract",
    listener: (from, pobContractAddress, admin) => {
      console.log(from, pobContractAddress, admin);
      setPobBatchDataArray({
        pobContractAddress: pobContractAddress,
        qrWalletsArray: newPobWalletsArray,
        privKeysArray: newPrivKeysArray,
      });
      toast.success("Successfully created your POB, redirecting to your collections", {
        position: "top-center",
      });
      setTimeout(() => {
        setIsLoading(false);
        router.push("/collections");
      }, 2500);
    },
  });

  useEffect(() => {
    const newWallet = ethers.Wallet.createRandom();
    console.log(newWallet);
  }, []);

  const poepFormInputs = useMemo(
    () =>
      createPobBatchInputsArray.map((input: any, inputIndex: number) => {
        if (input.showWithToggleName?.length > 1 && form[input.showWithToggleName[0]] !== input.showWithToggleName[1]) {
          return;
        }
        return (
          <div className="w-full mb-4 lg:mb-4 px-2" key={`${input.name}_${inputIndex}`}>
            <div className="mb-1 pl-4 w-full text-left">
              <label className="text-lg font-medium">{input.label}</label>
            </div>
            {input.type !== "toggle" ? (
              <InputBase
                name={input.name}
                type={input.type}
                value={form[input.name] || ""}
                onChange={(value: any) => {
                  setForm(form => ({ ...form, [input.name]: value }));
                }}
                placeholder={input.placeholder}
                error={input.isError || false}
                disabled={input.isDisabled || input.name === "date" || false}
                isRequired={true}
              />
            ) : (
              <div className="w-full flex justify-center">
                <ToggleInput
                  name={input.name}
                  isDefaultValueA={true}
                  onChange={(value: any) => {
                    setForm(form => ({ ...form, [input.name]: value }));
                  }}
                  valueA={input.valueA}
                  valueB={input.valueB}
                />
              </div>
            )}
          </div>
        );
      }),
    [form],
  );

  const previewImage = useMemo(() => {
    if (imgObj) {
      return URL.createObjectURL(new Blob([imgObj]));
    }
    return null;
  }, [imgObj]);

  const handleCreatePobBatch = useCallback(
    async (event: any) => {
      event.preventDefault();
      setIsLoading(true);

      if (!userPobProfileAddress || parseInt(userPobProfileAddress) == 0) {
        toast.error("You need a POB Profile to create a POB", {
          position: "top-center",
        });
        setIsLoading(false);
        return;
      }
      if (balance && balance < 1.1) {
        toast.error("You don't have enough balance :(", {
          position: "top-center",
        });
        setIsLoading(false);
        return;
      }

      const signer = await fetchSigner();
      const personalPobFactoryContract = new ethers.Contract(
        deployedPersonalPOBFactory,
        PersonalPOBFactoryContract.abi,
        signer as any,
      );

      try {
        const formData = new FormData();
        formData.append("files", new Blob([imgObj]));
        formData.append("external_url", `https://proofofbeer.vercel.app/profile/${userPobProfileAddress}`);
        formData.append("profileAddress", userPobProfileAddress);
        formData.append("event_start_date", formatDateLocale(form.event_start_date, "yyyy-mm-dd"));
        formData.append("event_end_date", formatDateLocale(form.event_end_date, "yyyy-mm-dd"));
        if (Object.keys(form).length > 0) {
          for (const key in form) {
            if (form[key]) {
              formData.append(key, form[key]);
            }
          }
        }
        const res = await axios.post("/api/upload-batch-pob", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        const { merkleTreeWithQrPubKeys, qrWalletsArray, qrPrivKeysArray } = createRandomWallets(
          parseInt(form.pob_quantity),
        );

        setNewPobWalletsArray(qrWalletsArray);
        setNewPrivKeysArray(qrPrivKeysArray);

        console.log(userAddress);
        console.log(userPobProfileAddress);
        console.log(merkleTreeWithQrPubKeys.getHexRoot());

        const tx = await personalPobFactoryContract.createNewPersonalPob(
          form.name,
          "POB",
          form.pob_quantity,
          userAddress,
          userPobProfileAddress,
          res.data.nftUrl,
          merkleTreeWithQrPubKeys.getHexRoot(),
          { value: ethers.utils.parseEther("1.0") },
        );

        await tx.wait();
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
          setIsLoading(false);
        }
      }
    },
    [balance, deployedPersonalPOBFactory, form, imgObj, userAddress, userPobProfileAddress],
  );

  return (
    <div className="flex flex-col py-8 px-4 lg:px-8 lg:py-12 justify-center items-center min-h-full">
      <h1 className="text-4xl font-semibold text-center mb-4">Create a batch of POBs</h1>
      <BackButton />
      <h5 className="text-md text-center">
        Create a POB with your desired supply. <br />
        Or try our 25 supply{" "}
        <Link href="/pob/create" className="font-semibold text-orange-500">
          POB
        </Link>
      </h5>
      <div
        id="personal-pob-container"
        className="w-full md:w-11/12 my-4 rounded-lg flex flex-col items-center bg-base-100 border-base-300 border shadow-md shadow-secondary"
      >
        <div className="w-full flex flex-col md:flex-row md:flex-wrap lg pt-2 pb-8 px-4 lg:px-8 lg:py-12 justify-center items-center md:items-start">
          {step === "form" && (
            <>
              <div className="text-center text-lg font-medium w-full md:w-2/3 lg:w-1/2 p-4 mt-2">
                <div className="m-2 px-4 lg:px-4 xl:px-24 2xl:px-32">
                  <POBPreview fileFormKey={fileFormKey} previewImage={previewImage} setImgObj={setImgObj} />
                </div>
              </div>
              <div className="text-center text-lg font-medium w-full px-2 md:w-2/3 md:flex md:flex-col lg:w-1/2 lg:pt-4 lg:pr-12 xl:pr-20">
                {poepFormInputs}
                <div className="w-full mt-12 md:mt-6 lg:mt-4">
                  <div className="flex justify-center">
                    <p className="font-medium border-orange-700 border-2 rounded-xl w-3/5 py-2">Cost: 1 MATIC</p>
                  </div>
                  {isLoadingBalance ? (
                    <Loader />
                  ) : (
                    <PrimaryButton
                      buttonText="Preview POB"
                      classModifier="text-lg w-3/5"
                      isDisabled={
                        !previewImage ||
                        isLoading ||
                        !form.event_start_date ||
                        !form.event_end_date ||
                        !form.pob_quantity
                      }
                      isLoading={isLoading}
                      onClick={() => setStep("preview")}
                      showLoader={true}
                    />
                  )}
                </div>
              </div>
            </>
          )}
          {step === "preview" && previewImage && (
            <form
              className="text-center text-lg font-medium w-full md:w-2/3 lg:w-1/2 p-2"
              onSubmit={handleCreatePobBatch}
            >
              <div className="w-full flex justify-start">
                <p className="w-1/2 flex items-center" onClick={() => setStep("form")}>
                  Edit <PencilIcon className="h-4 w-4 ml-2" />
                </p>
              </div>
              <h3 className="text-center text-2xl">{form.name}</h3>
              <div className="m-2 px-6 lg:px-4 xl:px-24 2xl:px-32">
                <POBImage imageURI={previewImage} />
              </div>
              <h5 className="text-center text-lg font-light">
                {formatDateLocale(form.event_start_date, "yyyy-mm-dd")}
              </h5>
              <h4 className="text-center text-xl">{form.description}</h4>
              <h4 className="text-center text-xl mt-4">Batch Supply: {form.pob_quantity} POBs</h4>
              <PrimaryButton
                buttonText="Create POB Batch"
                classModifier="text-lg w-3/5"
                isDisabled={
                  !previewImage || isLoading || !form.event_start_date || !form.event_end_date || !form.pob_quantity
                }
                isLoading={isLoading}
                showLoader={true}
              />
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreatePOBBatch;

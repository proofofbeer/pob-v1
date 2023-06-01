import React, { useCallback, useMemo, useState } from "react";
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
import { createPobInputsArray, getInitialPobFormState } from "~~/components/pob/pob-form-input";
import { POBFactoryContract } from "~~/contracts";
import { useAccountBalance, useScaffoldEventSubscriber } from "~~/hooks/scaffold-eth";
import { useAppStore } from "~~/services/store/store";
import { formatDateLocale } from "~~/utils/date/get-formatted-dates";
import { getContractAddressByEnv } from "~~/utils/env-getters";
import { createRandomWallets } from "~~/utils/web3/wallet-generation";

const CreatePOB = () => {
  const deployedPobFactory = getContractAddressByEnv();
  const env = process.env.NEXT_PUBLIC_DEVELOPMENT_ENV || "local";
  const pobTokenBasePrice = env === "testnet" ? 0.0001 : 0.1;
  const pobTokenUniqueGenPrice = env === "testnet" ? 0.00015 : 0.15;
  const fileFormKey = "pob_image";
  const [form, setForm] = useState<Record<string, any>>(() => getInitialPobFormState(createPobInputsArray));
  const [imgObj, setImgObj] = useState<any>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [step, setStep] = useState<string>("form");
  const [newPobWalletsArray, setNewPobWalletsArray] = useState<any[] | undefined>();
  const [newPrivKeysArray, setNewPrivKeysArray] = useState<any[] | undefined>();
  const { setPobBatchDataArray } = useAppStore(state => ({
    setPobBatchDataArray: state.setPobBatchDataArray,
  }));

  const [msgValue, setMsgValue] = useState(10 * pobTokenBasePrice);

  const { address: userAddress } = useAccount();
  const { balance, isLoading: isLoadingBalance } = useAccountBalance(userAddress);

  useScaffoldEventSubscriber({
    contractName: "POBFactory",
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

  const poepFormInputs = useMemo(
    () =>
      createPobInputsArray.map((input: any, inputIndex: number) => {
        const today = new Date();
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
                value={input.name !== "event_start_date" ? form[input.name] || "" : today.toLocaleDateString("en-CA")}
                onChange={(value: any) => {
                  setForm(form => ({ ...form, [input.name]: value }));
                }}
                max={input.max || null}
                min={input.min || null}
                placeholder={input.placeholder}
                error={input.isError || false}
                disabled={input.isDisabled || false}
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
                  textA={input.textA}
                  textB={input.textB}
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

  const handleCreatePob = useCallback(
    async (event: any) => {
      event.preventDefault();
      setIsLoading(true);

      if (!userAddress || balance === null || undefined) {
        toast.error("Connect with your wallet and check your balance.", {
          position: "top-center",
        });
        setIsLoading(false);
        return;
      }
      if (balance === 0 || balance <= msgValue) {
        toast.error("You don't have enough balance (you might need extra for gas).", {
          position: "top-center",
        });
        setIsLoading(false);
        return;
      }

      const signer = await fetchSigner();
      const pobFactoryContract = new ethers.Contract(deployedPobFactory, POBFactoryContract.abi, signer as any);

      try {
        let merkleRoot: string = ethers.utils.hexZeroPad("0x00", 32);
        const formData = new FormData();

        if (form.minting_features === "isUniqueCodeGeneration") {
          console.log("Generating wallets");
          const { merkleTreeWithQrPubKeys, qrWalletsArray, qrPrivKeysArray } = await createRandomWallets(
            parseInt(form.pob_quantity),
          );
          merkleRoot = merkleTreeWithQrPubKeys.getHexRoot();
          setNewPobWalletsArray(qrWalletsArray);
          setNewPrivKeysArray(qrPrivKeysArray);
          formData.append("whitelist", JSON.stringify(qrWalletsArray));
        } else {
          formData.append("whitelist", JSON.stringify([]));
        }

        formData.append("files", new Blob([imgObj]));
        formData.append("user_address", userAddress);
        if (Object.keys(form).length > 0) {
          for (const key in form) {
            if (form[key]) {
              formData.append(key, form[key]);
            }
          }
        }
        const res = await axios.post("/api/upload-pob", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        const tx = await pobFactoryContract.createNewPob(
          form.name,
          "POB",
          res.data.nftUrl,
          form.pob_quantity,
          merkleRoot,
          { value: ethers.utils.parseEther(msgValue.toFixed(4)) },
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
        }
        setIsLoading(false);
      }
    },
    [balance, deployedPobFactory, form, imgObj, msgValue, userAddress],
  );

  const calculatePrice = useCallback(() => {
    const singleTokenPrice =
      form.minting_features === "isUniqueCodeGeneration" ? pobTokenUniqueGenPrice : pobTokenBasePrice;
    const basePrice = 10 * singleTokenPrice;
    let price = form.pob_quantity * singleTokenPrice;

    if (price < basePrice) price = basePrice;
    return price;
  }, [form.minting_features, form.pob_quantity, pobTokenBasePrice, pobTokenUniqueGenPrice]);

  const showPreview = useCallback(() => {
    const today = new Date();
    if (!form.event_start_date) {
      form.event_start_date = today.toLocaleDateString("en-CA");
    }
    setMsgValue(calculatePrice());
    setStep("preview");
  }, [calculatePrice, form]);

  return (
    <div className="flex flex-col py-8 px-4 lg:px-8 lg:py-12 justify-center items-center min-h-full">
      <h1 className="text-4xl font-semibold text-center mb-4">Create POB</h1>
      <BackButton />
      <div
        id="personal-pob-container"
        className={`w-full my-4 rounded-lg flex flex-col items-center bg-base-100 border-base-300 border shadow-md shadow-secondary ${
          step === "form" ? "md:w-11/12" : "md:w-1/2 lg:w-2/5"
        }`}
      >
        <div
          className={`w-full flex flex-col md:flex-row md:flex-wrap pt-2 pb-8 px-4 justify-center items-center md:items-start ${
            step === "form" ? "lg:px-8 lg:py-12" : "lg:px-4 lg:py-4"
          }`}
        >
          {step === "form" && (
            <>
              <div className="text-center text-lg font-medium w-full md:w-2/3 lg:w-1/2 p-4 mt-2">
                <div className="m-2 px-4 lg:px-4 xl:px-16">
                  <POBPreview fileFormKey={fileFormKey} previewImage={previewImage} setImgObj={setImgObj} />
                </div>
              </div>
              <div className="text-center text-lg font-medium w-full px-2 md:w-2/3 md:flex md:flex-col lg:w-1/2 lg:pt-4 lg:pr-12 xl:pr-20">
                {poepFormInputs}
                <div className="w-full mt-12 md:mt-6 lg:mt-4">
                  <div className="flex justify-center">
                    <p className="font-medium border-orange-700 border-2 rounded-xl w-3/5 py-2">
                      Cost:{" "}
                      {env !== "testnet"
                        ? `${calculatePrice().toFixed(2)} MATIC`
                        : `${calculatePrice().toFixed(4)} MATIC`}
                    </p>
                  </div>
                  {isLoadingBalance ? (
                    <Loader />
                  ) : (
                    <PrimaryButton
                      buttonText="Preview POB"
                      classModifier="text-lg w-3/5"
                      isDisabled={!previewImage || isLoading || !form.event_end_date || !form.pob_quantity}
                      isLoading={isLoading}
                      onClick={showPreview}
                      showLoader={true}
                    />
                  )}
                </div>
              </div>
            </>
          )}
          {step === "preview" && previewImage && (
            <form className="text-center text-lg font-medium w-full pt-2 pb-4 px-4 lg:px-8" onSubmit={handleCreatePob}>
              <div className="w-full flex justify-start">
                <p className="w-1/2 flex items-center hover:cursor-pointer" onClick={() => setStep("form")}>
                  Edit <PencilIcon className="h-4 w-4 ml-2" />
                </p>
              </div>
              <h3 className="text-center text-2xl">{form.name}</h3>
              <div className="m-2 px-6 lg:px-24 xl:px-24 2xl:px-32">
                <POBImage imageURI={previewImage} />
              </div>
              <h5 className="text-center text-lg font-light">
                {formatDateLocale(form.event_start_date, "yyyy-mm-dd")}
              </h5>
              <h4 className="text-center text-xl">{form.description}</h4>
              <h4 className="text-center text-xl mt-4">Max Supply: {form.pob_quantity} POBs</h4>
              <div className="flex justify-center mt-4">
                <p className="font-medium border-orange-700 border-2 rounded-xl w-3/5 py-2">
                  Cost:{" "}
                  {env !== "testnet" ? `${calculatePrice().toFixed(2)} MATIC` : `${calculatePrice().toFixed(4)} MATIC`}
                </p>
              </div>
              <PrimaryButton
                buttonText="Create POB"
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

export default CreatePOB;

import React, { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import router from "next/router";
import { fetchSigner } from "@wagmi/core";
import axios from "axios";
import { ethers } from "ethers";
import toast from "react-hot-toast";
import { useAccount } from "wagmi";
import Loader from "~~/components/common/Loader";
import BackButton from "~~/components/common/buttons/BackButton";
import PrimaryButton from "~~/components/common/buttons/PrimaryButton";
import FilePreview from "~~/components/image-handling/FilePreview";
import { InputBase } from "~~/components/inputs/InputBase";
import ToggleInput from "~~/components/inputs/ToggleInput";
import { createOneTimePobInputsArray, getInitialPobFormState } from "~~/components/pob/pob-form-input";
import { PersonalPOBFactoryContract } from "~~/contracts";
import { useAccountBalance, useScaffoldContractRead } from "~~/hooks/scaffold-eth";

const CreatePOB = () => {
  const deployedPersonalPOBFactory =
    process.env.NEXT_PUBLIC_PERSONAL_POB_FACTORY_ADDRESS || "0x6F499A9ee6a7eBC809b2dF17b42E89a86F46d040";
  const contractName = "POEPProfileFactory";
  const fileFormKey = "pob_image";
  const [form, setForm] = useState<Record<string, any>>(() => getInitialPobFormState(createOneTimePobInputsArray));
  const [imgObj, setImgObj] = useState<any>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const { address: userAddress } = useAccount();
  const { balance, isLoading: isLoadingBalance } = useAccountBalance(userAddress);

  const { data: userPobProfileAddress } = useScaffoldContractRead({
    contractName,
    functionName: "userAddressToProfile",
    args: [userAddress],
  });

  const poepFormInputs = useMemo(
    () =>
      createOneTimePobInputsArray.map((input: any, inputIndex: number) => {
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
                value={
                  input.name !== "event_start_date" && input.name !== "date"
                    ? form[input.name] || ""
                    : today.toLocaleDateString("en-CA")
                }
                onChange={(value: any) => {
                  setForm(form => ({ ...form, [input.name]: value }));
                }}
                placeholder={input.placeholder}
                error={input.isError || false}
                disabled={input.isDisabled || input.name === "event_start_date" || input.name === "date" || false}
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

  const handleCreatePersonalPob = useCallback(
    async (event: any) => {
      event.preventDefault();
      setIsLoading(true);
      if (!userPobProfileAddress || parseInt(userPobProfileAddress) == 0) return;
      const signer = await fetchSigner();
      const personalPobFactoryContract = new ethers.Contract(
        deployedPersonalPOBFactory,
        PersonalPOBFactoryContract.abi,
        signer as any,
      );

      if (balance && balance < 1.1) {
        toast.error("You don't have enough balance :(", {
          position: "top-center",
        });
        setIsLoading(false);
        return;
      }
      try {
        const formData = new FormData();
        const today = new Date();
        formData.append("files", new Blob([imgObj]));
        formData.append("external_url", `https://proofofbeer.vercel.app/profile/${userPobProfileAddress}`);
        formData.append("profileAddress", userPobProfileAddress);
        formData.append("date", today.toLocaleDateString("en-CA"));
        if (Object.keys(form).length > 0) {
          for (const key in form) {
            if (form[key]) {
              formData.append(key, form[key]);
            }
          }
        }
        const res = await axios.post("/api/upload-personal-pob", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        const tx = await personalPobFactoryContract.createNewPersonalPob(
          form.name,
          "POB",
          userAddress,
          userPobProfileAddress,
          res.data.nftUrl,
          { value: ethers.utils.parseEther("1.0") },
        );

        console.log(tx);

        toast.success("Successfully created your POB!!!", {
          position: "top-center",
        });
        router.push("/collections");
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
    [balance, deployedPersonalPOBFactory, form, imgObj, userAddress, userPobProfileAddress],
  );

  return (
    <div className="flex flex-col py-8 px-4 lg:px-8 lg:py-12 justify-center items-center min-h-full">
      <h1 className="text-4xl font-semibold text-center mb-4">Create POB</h1>
      <BackButton />
      <h5 className="text-md text-center">
        Create a POB with a supply of 25. <br />
        Need more? Try creating a{" "}
        <Link href="/pob/create-batch" className="font-semibold text-orange-500">
          POB Batch
        </Link>
      </h5>
      <div
        id="personal-pob-container"
        className="w-full md:w-11/12 my-4 rounded-lg flex flex-col items-center bg-base-100 border-base-300 border shadow-md shadow-secondary"
      >
        <div className="w-full flex flex-col md:flex-row md:flex-wrap lg py-8 px-4 lg:px-8 lg:py-12 justify-center items-center md:items-start">
          {userPobProfileAddress && parseInt(userPobProfileAddress) ? (
            <>
              <div className="text-center text-lg font-medium w-full md:w-2/3 lg:w-1/2 p-4">
                <div className="m-2 px-4 lg:px-4 xl:px-24 2xl:px-32">
                  <FilePreview fileFormKey={fileFormKey} previewImage={previewImage} setImgObj={setImgObj} />
                </div>
              </div>
              <form
                className="text-center text-lg font-medium w-full px-2 md:w-2/3 md:flex md:flex-col lg:w-1/2 lg:pt-4 lg:pr-12 xl:pr-20"
                onSubmit={handleCreatePersonalPob}
              >
                {poepFormInputs}
                <div className="w-full mt-12 md:mt-6 lg:mt-4">
                  <div className="flex justify-center">
                    <p className="font-medium border-orange-700 border-2 rounded-xl w-3/5 py-2">Cost: 1 MATIC</p>
                  </div>
                  {isLoadingBalance ? (
                    <Loader />
                  ) : (
                    <PrimaryButton
                      buttonText="Create POB"
                      classModifier="text-lg w-3/5"
                      isDisabled={!previewImage || isLoading}
                      isLoading={isLoading}
                      showLoader={true}
                    />
                  )}
                </div>
              </form>
            </>
          ) : (
            <div className="text-center text-lg font-medium w-full px-2 md:w-2/3 md:flex md:flex-col md:items-center lg:w-1/2">
              <h4 className="text-xl">You need a POB Profile</h4>
              <PrimaryButton buttonText="I want my Profile" classModifier="text-lg py-2 px-8 mt-4" path="/dashboard" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreatePOB;

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import toast from "react-hot-toast";
import { useNetwork } from "wagmi";
import shallow from "zustand/shallow";
import ContractFormCard from "~~/components/product-nft/step-cards/ContractFormCard";
import MetadataFormCard from "~~/components/product-nft/step-cards/MetadataFormCard";
import PreviewFormCard from "~~/components/product-nft/step-cards/PreviewFormCard";
import {
  contractInputsArray,
  getInitialFormState,
  metadataInputsArray,
} from "~~/components/product-nft/step-cards/stepCardsInputs";
import { useAppStore } from "~~/services/store/store";
import { getTargetNetwork } from "~~/utils/scaffold-eth";

const ProductDashboard = () => {
  const router = useRouter();
  const { chain } = useNetwork();
  const fileInputKey = "product_nft_file";
  const fileNameInputKey = "product_nft_file_name";
  const [contractForm, setContractForm] = useState<Record<string, any>>(() =>
    getInitialFormState(contractInputsArray, fileInputKey),
  );
  const [imageObj, setImgObj] = useState<any>(undefined);
  const [metadataForm, setMetadataForm] = useState<Record<string, any>>(() => getInitialFormState(metadataInputsArray));
  const [attributesForm, setAttributesForm] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [step, setStep] = useState<number>(1);
  const writeDisabled = !chain || chain?.id !== getTargetNetwork().id;
  const { currentImgName, setDirectoriesCids, setStoreAttributes, setStoreContract, setStoreMetadata, setUserImgObjs } =
    useAppStore(
      state => ({
        currentImgName: state.currentImgName,
        setDirectoriesCids: state.setDirectoriesCids,
        setStoreAttributes: state.setStoreAttributes,
        setStoreContract: state.setStoreContract,
        setStoreMetadata: state.setStoreMetadata,
        setUserImgObjs: state.setUserImgObjs,
      }),
      shallow,
    );

  const previewImage = useMemo(() => {
    if (imageObj) {
      return URL.createObjectURL(new Blob([imageObj]));
    }
    return null;
  }, [imageObj]);

  const onSubmitHandler: any = useCallback(
    async (event: any) => {
      setIsLoading(true);
      event?.preventDefault();
      try {
        const formData = new FormData();
        formData.append("imgName", currentImgName);
        formData.append("files", new Blob([imageObj]));
        setUserImgObjs(imageObj);
        const response = await axios.post("/api/upload-files", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        setDirectoriesCids(response.data.cid);
        setStoreContract(contractForm);
        setStoreMetadata(metadataForm);

        if (Object.keys(attributesForm).length > 0) {
          const attributesArray = [];
          for (const attributeValue in attributesForm) {
            attributesArray.push(attributesForm[attributeValue]);
          }
          setStoreAttributes([...attributesArray]);
        } else {
          setStoreAttributes([]);
        }

        alert(JSON.stringify(response.data));
        router.push("/templates");
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
      } finally {
        setIsLoading(false);
      }
    },
    [
      attributesForm,
      contractForm,
      currentImgName,
      imageObj,
      metadataForm,
      router,
      setDirectoriesCids,
      setStoreAttributes,
      setStoreContract,
      setStoreMetadata,
      setUserImgObjs,
    ],
  );

  const stepCards = useCallback(() => {
    switch (step) {
      case 1:
        return (
          <ContractFormCard
            fileInputKey={fileInputKey}
            fileNameInputKey={fileNameInputKey}
            contractForm={contractForm}
            isLoading={isLoading}
            onSubmitHandler={onSubmitHandler}
            setContractForm={setContractForm}
            setImgObj={setImgObj}
            setStep={setStep}
            showSubmit={false}
            step={step}
            writeDisabled={writeDisabled}
          />
        );
      case 2:
        return (
          <MetadataFormCard
            attributesForm={attributesForm}
            form={metadataForm}
            isLoading={isLoading}
            onSubmitHandler={onSubmitHandler}
            setAttributesForm={setAttributesForm}
            setForm={setMetadataForm}
            setStep={setStep}
            showSubmit={false}
            step={step}
            writeDisabled={writeDisabled}
          />
        );
      case 3:
        return (
          <PreviewFormCard
            attributesForm={attributesForm}
            contractForm={contractForm}
            metadataForm={metadataForm}
            isLoading={isLoading}
            onSubmitHandler={onSubmitHandler}
            previewImage={previewImage}
            setStep={setStep}
            showSubmit={true}
            step={step}
            writeDisabled={writeDisabled}
          />
        );

      default:
        return (
          <ContractFormCard
            fileInputKey={fileInputKey}
            fileNameInputKey={fileNameInputKey}
            contractForm={contractForm}
            isLoading={isLoading}
            onSubmitHandler={onSubmitHandler}
            setContractForm={setContractForm}
            setImgObj={setImgObj}
            setStep={setStep}
            showSubmit={false}
            step={step}
            writeDisabled={writeDisabled}
          />
        );
    }
  }, [attributesForm, contractForm, isLoading, metadataForm, onSubmitHandler, previewImage, step, writeDisabled]);

  return (
    <div className="flex flex-col py-8 px-4 lg:px-8 lg:py-12 justify-center items-center min-h-full">
      <h1 className="text-4xl font-semibold text-center mb-4">Create Experience NFT Template</h1>
      <div className="w-full flex justify-center my-4">
        <button
          className="text-md btn bg-primary border-2 text-gray-900 dark:text-white btn-md w-3/5 md:w-1/3 lg:w-1/4 xl:w-1/5"
          onClick={() => router.push("/templates")}
        >
          Back
        </button>
      </div>
      <div className="w-full h-full">
        <div className="w-full flex justify-center m-2 mx-0">
          <ul className="steps w-full md:w-4/5 lg:w-1/2">
            <li onClick={() => setStep(1)} className={`hover:cursor-pointer step ${step > 0 ? "step-accent" : ""}`}>
              Contract
            </li>
            <li onClick={() => setStep(2)} className={`hover:cursor-pointer step ${step > 1 ? "step-accent" : ""}`}>
              Metadata
            </li>
            <li onClick={() => setStep(3)} className={`hover:cursor-pointer step ${step > 2 ? "step-accent" : ""}`}>
              Preview
            </li>
          </ul>
        </div>
        <div className="w-full flex flex-col items-center justify-center px-2 lg:px-0 py-4 lg:py-8">{stepCards()}</div>
      </div>
    </div>
  );
};

export default ProductDashboard;

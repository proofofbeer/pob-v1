import { useCallback, useMemo, useState } from "react";
import { ProductFactoryContract } from "./Contract";
import { ContractFactory } from "ethers";
import toast from "react-hot-toast";
import { useNetwork, useSigner } from "wagmi";
import ContractFormCard from "~~/components/product-nft/step-cards/ContractFormCard";
import MetadataFormCard from "~~/components/product-nft/step-cards/MetadataFormCard";
import PreviewFormCard from "~~/components/product-nft/step-cards/PreviewFormCard";
import {
  contractInputsArray,
  getInitialFormState,
  metadataInputsArray,
} from "~~/components/product-nft/step-cards/stepCardsInputs";
import { getTargetNetwork } from "~~/utils/scaffold-eth";

const ProductDashboard = () => {
  const { chain } = useNetwork();
  const { data: signer } = useSigner();
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

  const previewImage = useMemo(() => {
    if (imageObj) {
      return URL.createObjectURL(new Blob([imageObj]));
    }
    return null;
  }, [imageObj]);

  const onSubmitHandler = useCallback(
    async (event: any) => {
      setIsLoading(true);
      try {
        event?.preventDefault();
        const ProductFactory = new ContractFactory(
          ProductFactoryContract.abi,
          ProductFactoryContract.bytecode,
          signer as any,
        );

        const productFactory = await ProductFactory.deploy();

        const res = await productFactory.deployed();

        console.log(res);
      } catch (error: any) {
        const parsedBody = JSON.parse(error.body);
        const { message } = parsedBody.error;
        toast.error(message, {
          position: "bottom-right",
        });
      }
      setIsLoading(false);
    },
    [signer],
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
      <h1 className="text-4xl font-semibold text-center">Draft your NFT</h1>
      <div className="w-full h-full">
        <div className="w-full flex justify-center mt-8 mb-2 mx-0">
          <ul className="steps w-full md:w-4/5 lg:w-1/2">
            <li onClick={() => setStep(1)} className={`step ${step > 0 ? "step-accent" : ""}`}>
              Contract
            </li>
            <li onClick={() => setStep(2)} className={`step ${step > 1 ? "step-accent" : ""}`}>
              Metadata
            </li>
            <li onClick={() => setStep(3)} className={`step ${step > 2 ? "step-accent" : ""}`}>
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

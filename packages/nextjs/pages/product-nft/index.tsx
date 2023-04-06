import { useMemo, useState } from "react";
import { ProductFactoryContract } from "./Contract";
import { ContractFactory } from "ethers";
import toast from "react-hot-toast";
import { useNetwork, useSigner } from "wagmi";
import FileInput from "~~/components/common/FileInput";
import MetadataFormCard from "~~/components/product-nft/step-cards/MetadataFormCard";
import { ContractInput } from "~~/components/scaffold-eth";
import { getTargetNetwork } from "~~/utils/scaffold-eth";

const getInputKey = (input: TInputsArrayElement, inputIndex: number): string => {
  const name = input?.name || `input_${inputIndex}_`;
  return name + "_" + input.type + `_${inputIndex}`;
};

const getInitialFormState = (inputs: TInputsArrayElement[], fileInputKey: string) => {
  const initialForm: Record<string, any> = {};
  inputs.forEach((input: TInputsArrayElement, inputIndex: number) => {
    const key = getInputKey(input, inputIndex);
    // Should this be undefined? I changed it from se-2 but I don't remember exactly why. Might be because of the value/defaultValue requirements by React
    // Repeated implementation in components/product-nft/setp-cards/MetadataFormCard.tsx
    initialForm[key] = "";
  });
  initialForm[fileInputKey] = undefined;
  return initialForm;
};

type TParamType = {
  name: string;
  type: string; // The fully qualified type (e.g. "address", "tuple(address)", "uint256[3][]"
  baseType: string; // The base type (e.g. "address", "tuple", "array")
  indexed: boolean; // Indexable Paramters ONLY (otherwise null)
};

const inputParam = {
  name: "string",
  type: "string", // The fully qualified type (e.g. "address", "tuple(address)", "uint256[3][]"
  baseType: "string", // The base type (e.g. "address", "tuple", "array")
  indexed: false, // Indexable Paramters ONLY (otherwise null)
};

type TInputsArrayElement = { baseType: string; label: string; name: string; paramType: TParamType; type: string };

const inputsArray: TInputsArrayElement[] = [
  { baseType: "string", label: "Product Name", name: "product_name", paramType: inputParam, type: "string" },
  { baseType: "string", label: "Symbol", name: "product_symbol", paramType: inputParam, type: "string" },
  { baseType: "string", label: "External Link", name: "product_external_link", paramType: inputParam, type: "string" },
];

const ProductDashboard = () => {
  const { chain } = useNetwork();
  const { data: signer } = useSigner();
  const fileInputKey = "product_nft_file";
  const [form, setForm] = useState<Record<string, any>>(() => getInitialFormState(inputsArray, fileInputKey));
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [step, setStep] = useState<number>(1);
  const writeDisabled = !chain || chain?.id !== getTargetNetwork().id;

  // TODO: implement useMemo for optimization ?
  const inputElements = inputsArray.map((input: any, inputIndex: number) => {
    const key = getInputKey(input, inputIndex);
    return (
      <div className="w-full mb-2 lg:mb-4" key={key}>
        <p className="font-medium break-words mb-1 ml-2">{input.label}</p>
        <ContractInput
          setForm={updatedFormValue => {
            setForm(updatedFormValue);
          }}
          form={form}
          stateObjectKey={key}
          paramType={input.paramType}
        />
      </div>
    );
  });

  const previewImage = useMemo(() => {
    if (form[fileInputKey]) {
      return URL.createObjectURL(new Blob([form[fileInputKey]]));
    }
    return null;
  }, [form]);

  const onSubmitHandler = async (event: any) => {
    console.log(form);
    console.log(previewImage);
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
  };

  const stepCards = () => {
    switch (step) {
      case 1:
        return <StepCard_1 />;
      case 2:
        return (
          <MetadataFormCard
            form={form}
            isLoading={isLoading}
            onSubmitHandler={() => null}
            setForm={setForm}
            setStep={setStep}
            showSubmit={false}
            step={step}
            writeDisabled={writeDisabled}
          />
        );
      case 3:
        return <StepCard_3 />;

      default:
        return <StepCard_1 />;
    }
  };

  type TNavButtonsProps = {
    showSubmit: boolean;
  };

  const NavButtons = ({ showSubmit }: TNavButtonsProps) => (
    <div className="w-full flex flex-col mt-8 ">
      {showSubmit && (
        <div className="w-full flex items-center justify-center mb-4">
          <button
            className={`btn btn-secondary btn-md w-2/5 ${isLoading ? "loading" : ""}`}
            disabled={writeDisabled || step !== 3}
            onClick={onSubmitHandler}
          >
            Deploy 🚀
          </button>
        </div>
      )}
      <div
        className={`flex justify-between w-full my-4 ${
          writeDisabled &&
          "tooltip before:content-[attr(data-tip)] before:right-[-10px] before:left-auto before:transform-none"
        }`}
        data-tip={`${writeDisabled && "Wallet not connected or in the wrong network"}`}
      >
        <button
          className={`btn btn-secondary btn-md w-2/5 ${isLoading ? "loading" : ""}`}
          disabled={writeDisabled || step === 1}
          onClick={() => {
            if (step > 1) {
              setStep(step - 1);
            } else {
              return null;
            }
          }}
        >
          Previous
        </button>
        <button
          className={`btn btn-secondary btn-md w-2/5 ${isLoading ? "loading" : ""}`}
          disabled={writeDisabled || step === 3}
          onClick={() => {
            if (step < 3) {
              setStep(step + 1);
            } else {
              return null;
            }
          }}
        >
          Next
        </button>
      </div>
    </div>
  );

  const StepCard_1 = () => (
    <div className="bg-base-100 border-base-300 border shadow-md shadow-secondary rounded-xl w-full md:w-3/5 lg:w-1/2 px-6 lg:px-16 py-4 lg:py-8">
      <h3 className="mb-4 text-2xl font-medium text-left px-4">NFT Contract Details</h3>
      <FileInput setForm={setForm} form={form} stateObjectKey={fileInputKey} />
      {inputElements}
      <NavButtons showSubmit={false} />
    </div>
  );

  const StepCard_3 = () => (
    <div className="bg-base-100 border-base-300 border shadow-md shadow-secondary rounded-xl w-full md:w-3/5 lg:w-1/2 px-6 lg:px-16 py-4 lg:py-8">
      <h3 className="mb-4 text-2xl font-medium text-left px-4">Mint Conditions</h3>
      <FileInput setForm={setForm} form={form} stateObjectKey={fileInputKey} />
      {inputElements}
      <NavButtons showSubmit={true} />
    </div>
  );

  return (
    <div className="flex flex-col py-8 px-4 lg:px-8 lg:py-12 justify-center items-center min-h-full">
      <h1 className="text-4xl font-semibold text-center">Draft your NFT</h1>
      <div className="w-full h-full">
        <div className="w-full flex justify-center mt-8 mb-2 mx-0">
          <ul className="steps w-full md:w-3/5 lg:w-1/2">
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
        <div className="w-full flex flex-col items-center justify-center px-2 lg:px-0 py-4 lg:py-8">
          {stepCards()}
          {/* <div className="w-full hidden order-last md:flex md_flex-col md:items-start md:justify-center px-2 lg:px-0 py-4 lg:py-8">
            <div className="bg-base-100 border-base-300 border shadow-md shadow-secondary rounded-xl w-full lg:w-4/5 px-6 lg:px-16 py-4 lg:py-8">
              <h3 className="mb-4 text-2xl font-medium text-left px-4">Vista Previa</h3>
              <div className="w-fullflex flex-col items-center justify-center">
                <ImgPlaceholder previewImage={previewImage} />
                {inputsArray.map((input: any, inputIndex: number) => {
                  const key = getInputKey(input, inputIndex);
                  console.log(input.name);
                  if (!form[key]) {
                    console.log(form);
                    console.log("woops");
                    return null;
                  }
                  return (
                    <>
                      <p className="font-medium break-words mb-1 ml-2">{input.label}</p>
                      <div
                        className="w-full flex border-2 border-base-100 bg-base-100 rounded-md text-accent"
                        key={`preview_${input.name}_${inputIndex}`}
                      >
                        <input
                          className="input input-ghost bg-transparent border-2 rounded-md focus:text-gray-400 h-[2.2rem] min-h-[2.2rem] px-4 w-full font-medium placeholder:text-accent/50 text-gray-400 disabled:text-white text-center"
                          name={`preview_${input.name}`}
                          value={form[key]}
                          disabled
                        />
                      </div>
                    </>
                  );
                })}
              </div>
            </div>
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default ProductDashboard;

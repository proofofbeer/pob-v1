import { useState } from "react";
import { ProductFactoryContract } from "./Contract";
import { ContractFactory } from "ethers";
import toast from "react-hot-toast";
import { useNetwork, useSigner } from "wagmi";
import FileInput from "~~/components/common/FileInput";
import { ContractInput } from "~~/components/scaffold-eth";
import { getTargetNetwork } from "~~/utils/scaffold-eth";

const getInputKey = (input: TInputsArrayElement, inputIndex: number): string => {
  const name = input?.name || `input_${inputIndex}_`;
  return name + "_" + input.type + `_${inputIndex}`;
};

const getInitialFormState = (inputs: TInputsArrayElement[]) => {
  const initialForm: Record<string, any> = {};
  inputs.forEach((input: TInputsArrayElement, inputIndex: number) => {
    const key = getInputKey(input, inputIndex);
    initialForm[key] = "";
  });
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
  const [form, setForm] = useState<Record<string, any>>(() => getInitialFormState(inputsArray));
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const writeDisabled = !chain || chain?.id !== getTargetNetwork().id;

  // TODO: implement useMemo for optimization ?
  const inputElements = inputsArray.map((input: any, inputIndex: number) => {
    const key = getInputKey(input, inputIndex);
    return (
      <div className="w-full mb-2 lg:mb-4" key={key}>
        <p className="font-medium break-words m-1">{input.label}</p>
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

  const onSubmitHandler = async (event: any) => {
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

  return (
    <div className="flex flex-col py-8 px-4 lg:px-8 lg:py-12 justify-center items-center h-full">
      <h1 className="text-4xl font-semibold text-center">Create NFT Factory</h1>
      <div className="w-full h-full">
        <div className="w-full grid md:grid-cols-2">
          <div className="w-full flex items-center justify-center px-2 md:px-0 py-4 lg:py-8">
            <div className="bg-base-100 border-base-300 border shadow-md shadow-secondary rounded-xl w-full md:w-4/5 px-6 lg:px-16 py-4 lg:py-8">
              <h3 className="mb-4 text-2xl font-medium text-left px-4">NFT Contract Details</h3>
              <FileInput />
              {inputElements}
              <div
                className={`flex justify-center w-full my-4 lg:mt-8 ${
                  writeDisabled &&
                  "tooltip before:content-[attr(data-tip)] before:right-[-10px] before:left-auto before:transform-none"
                }`}
                data-tip={`${writeDisabled && "Wallet not connected or in the wrong network"}`}
              >
                <button
                  className={`btn btn-secondary btn-md w-2/5 ${isLoading ? "loading" : ""}`}
                  disabled={writeDisabled}
                  onClick={onSubmitHandler}
                >
                  Deploy 🚀
                </button>
              </div>
            </div>
          </div>
          <div className="w-full order-first md:order-last flex items-center justify-center px-2 md:px-0 py-4 lg:py-8">
            {/* <h4 className="text-xl text-left ml-2">Vista Previa</h4> */}
            <div
              tabIndex={0}
              className="collapse collapse-arrow bg-base-100 border-base-300 border shadow-md shadow-secondary rounded-xl w-full md:w-4/5 px-6 lg:px-16 py-4 lg:py-8"
            >
              <input className="min-h-0" type="checkbox" />
              <h3 className="collapse-title text-2xl text-left pl-4 py-0 min-h-0 font-medium">Vista Previa</h3>
              <div className="collapse-content">
                <p>tabIndex={0} attribute is necessary to make the div focusable</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDashboard;

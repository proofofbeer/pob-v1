import { Dispatch, SetStateAction, useState } from "react";
import NavButtons from "./CardNavButtons";
import { TInputsArrayElement, getInputKey, inputParam, metadataInputsArray } from "./stepCardsInputs";
import { TrashIcon } from "@heroicons/react/24/outline";
import { ContractInput } from "~~/components/scaffold-eth";

type TFormCardProps = {
  attributesForm: Record<string, any>;
  form: Record<string, any>;
  isLoading: boolean;
  onSubmitHandler: (event: any) => Promise<void>;
  setAttributesForm: Dispatch<SetStateAction<Record<string, any>>>;
  setForm: Dispatch<SetStateAction<Record<string, any>>>;
  setStep: Dispatch<SetStateAction<number>>;
  showSubmit: boolean;
  step: number;
  writeDisabled: boolean;
};

const MetadataFormCard = ({
  attributesForm,
  form,
  isLoading,
  onSubmitHandler,
  setAttributesForm,
  setForm,
  setStep,
  showSubmit,
  step,
  writeDisabled,
}: TFormCardProps) => {
  const [attributesInputsArray, setAttributesInputsArray] = useState<TInputsArrayElement[]>([]);

  const inputElements = metadataInputsArray.map((input: any, inputIndex: number) => {
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

  const attributeInputElements = attributesInputsArray.map((input: any, inputIndex: number) => {
    const key = getInputKey(input, inputIndex);
    const isLastElement = inputIndex === attributesInputsArray.length - 1;
    return (
      <div className="w-full mb-2 lg:mb-4" key={key}>
        <p className="font-medium break-words mb-1 ml-2">{input.label}</p>
        <div className="w-full flex items-center justify-between">
          <div className={isLastElement ? "w-5/6" : "w-full"}>
            <ContractInput
              setForm={updatedFormValue => {
                setAttributesForm(updatedFormValue);
              }}
              form={attributesForm}
              stateObjectKey={key}
              paramType={input.paramType}
            />
          </div>
          {isLastElement && (
            <div className="mr-2">
              <TrashIcon className="h-6 w-6" onClick={() => removeAttribute(inputIndex)} />
            </div>
          )}
        </div>
      </div>
    );
  });

  const addAttribute = () => {
    const updatedArray = [...attributesInputsArray];
    const updatedForm = { ...attributesForm };
    updatedArray.push({
      baseType: "string",
      label: `Attribute ${attributesInputsArray.length + 1}`,
      name: `attribute_name_${attributesInputsArray.length}`,
      paramType: inputParam,
      type: "string",
    });
    const key = getInputKey(updatedArray[attributesInputsArray.length], attributesInputsArray.length);
    // Should this be undefined? I changed it from se-2 but I don't remember exactly why. Might be because of the value/defaultValue requirements by React
    updatedForm[key] = "";
    setAttributesInputsArray(updatedArray);
    setAttributesForm(updatedForm);
  };

  const removeAttribute = (index: number) => {
    const updatedArray = [...attributesInputsArray];
    const updatedForm = { ...attributesForm };
    const key = getInputKey(updatedArray[index], index);
    updatedArray.splice(index, 1);
    // Should this be undefined? I changed it from se-2 but I don't remember exactly why. Might be because of the value/defaultValue requirements by React
    delete updatedForm[key];
    setAttributesInputsArray(updatedArray);
    setAttributesForm(updatedForm);
  };

  return (
    <div className="bg-base-100 border-base-300 border shadow-md shadow-secondary rounded-xl w-full md:w-4/5 lg:w-3/5 xl:w-1/2 px-6 md:px-16 py-4 md:py-8">
      <h3 className="mb-4 text-2xl font-medium text-left px-4">NFT Metadata</h3>
      {inputElements}
      {attributeInputElements}
      <div className="w-full flex items-center justify-center my-8">
        <button className="btn btn-secondary btn-md w-3/5 md:w-1/3" onClick={addAttribute}>
          Add Attribute
        </button>
      </div>
      <NavButtons
        isLoading={isLoading}
        onSubmitHandler={onSubmitHandler}
        showSubmit={showSubmit}
        setStep={setStep}
        step={step}
        writeDisabled={writeDisabled}
      />
    </div>
  );
};

export default MetadataFormCard;

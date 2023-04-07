import { Dispatch, SetStateAction, useMemo } from "react";
import CardNavButtons from "./CardNavButtons";
import { contractInputsArray, getInputKey } from "./stepCardsInputs";
import FileInput from "~~/components/common/FileInput";
import { ContractInput } from "~~/components/scaffold-eth";

type TFormCardProps = {
  fileInputKey: string;
  fileNameInputKey: string;
  contractForm: Record<string, any>;
  isLoading: boolean;
  onSubmitHandler: (event: any) => Promise<void>;
  setContractForm: Dispatch<SetStateAction<Record<string, any>>>;
  setImgObj: Dispatch<SetStateAction<any>>;
  setStep: Dispatch<SetStateAction<number>>;
  showSubmit: boolean;
  step: number;
  writeDisabled: boolean;
};

const ContractFormCard = ({
  fileInputKey,
  fileNameInputKey,
  contractForm,
  onSubmitHandler,
  isLoading,
  setContractForm,
  setImgObj,
  setStep,
  showSubmit,
  step,
  writeDisabled,
}: TFormCardProps) => {
  const inputElements = useMemo(
    () =>
      contractInputsArray.map((input: any, inputIndex: number) => {
        const key = getInputKey(input, inputIndex);
        return (
          <div className="w-full mb-2 lg:mb-4" key={key}>
            <p className="font-medium break-words mb-1 ml-2">{input.label}</p>
            <ContractInput
              form={contractForm}
              key={key}
              setForm={updatedFormValue => {
                setContractForm(updatedFormValue);
              }}
              stateObjectKey={key}
              paramType={input.paramType}
            />
          </div>
        );
      }),
    [contractForm, setContractForm],
  );

  return (
    <div className="bg-base-100 border-base-300 border shadow-md shadow-secondary rounded-xl w-full md:w-4/5 lg:w-3/5 xl:w-1/2 px-6 md:px-16 py-4 md:py-8">
      <h3 className="mb-4 text-2xl font-medium text-left px-4">NFT Contract Details</h3>
      <FileInput setImgObj={setImgObj} stateObjectKey={fileInputKey} stateFileNameKey={fileNameInputKey} />
      {inputElements}
      <CardNavButtons
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

export default ContractFormCard;

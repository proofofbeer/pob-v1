import { Dispatch, SetStateAction } from "react";

type TNavButtonsProps = {
  isLoading: boolean;
  onSubmitHandler: () => void;
  showSubmit: boolean;
  step: number;
  setStep: Dispatch<SetStateAction<number>>;
  writeDisabled: boolean;
};

const CardNavButtons = ({ isLoading, onSubmitHandler, showSubmit, setStep, step, writeDisabled }: TNavButtonsProps) => (
  <div className="w-full flex flex-col mt-8 ">
    {showSubmit && (
      <div className="w-full flex items-center justify-center mb-4">
        <button
          className={`btn btn-secondary btn-md w-2/5 ${isLoading ? "loading" : ""}`}
          disabled={writeDisabled || step !== 4}
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
        disabled={writeDisabled || step === 4}
        onClick={() => {
          if (step < 4) {
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

export default CardNavButtons;

import { Dispatch, SetStateAction } from "react";

type TNavButtonsProps = {
  isLoading: boolean;
  onSubmitHandler: (event: any) => Promise<void>;
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
          className={`btn bg-primary border-primary-focus border-2 text-gray-900 dark:text-slate-200 btn-lg md:btn-md w-3/5 md:w-1/2 ${
            isLoading ? "loading" : ""
          }`}
          disabled={writeDisabled || step !== 3 || isLoading}
          onClick={onSubmitHandler}
        >
          Create Template 🔥
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
        className={`btn btn-secondary btn-md w-2/5 md:w-1/4 ${isLoading ? "loading" : ""}`}
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
        className={`btn btn-secondary btn-md w-2/5 md:w-1/4 ${isLoading ? "loading" : ""}`}
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

export default CardNavButtons;

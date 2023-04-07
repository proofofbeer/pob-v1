import { Dispatch, SetStateAction, useCallback } from "react";
import ImgPlaceholder from "../ImgPlaceholder";
import NavButtons from "./CardNavButtons";

type TPreviewFormCard = {
  contractForm: Record<string, any>;
  metadataForm: Record<string, any>;
  attributesForm: Record<string, any>;
  isLoading: boolean;
  onSubmitHandler: (event: any) => Promise<void>;
  previewImage: any;
  setStep: Dispatch<SetStateAction<number>>;
  showSubmit: boolean;
  step: number;
  writeDisabled: boolean;
};

const PreviewFormCard = ({
  attributesForm,
  contractForm,
  metadataForm,
  isLoading,
  onSubmitHandler,
  previewImage,
  setStep,
  showSubmit,
  step,
  writeDisabled,
}: TPreviewFormCard) => {
  const getAttributeElements = useCallback(() => {
    const formElements: any = [];
    for (const property in attributesForm) {
      formElements.push(
        <div
          key={`${property}_${attributesForm[property]}`}
          className="border border-base-300 bg-accent rounded-lg my-2 py-4 px-2 text-center"
        >
          <p className="text-md font-semibold">{attributesForm[property] || property}</p>
          <p className="text-lg font-bold">Some Value</p>
          <p className="text-md">Rarity: XX %</p>
        </div>,
      );
    }
    return formElements;
  }, [attributesForm]);

  const attributeList = getAttributeElements();

  return (
    <div className="bg-base-100 border-base-300 border shadow-md shadow-secondary rounded-xl w-full md:w-4/5 lg:w-3/5 xl:w-1/2 px-6 md:px-16 py-4 md:py-8">
      <h5 className="mb-2 text-lg font-medium text-left px-1">
        Collection {contractForm.product_name_string_0 || " Name"}
      </h5>
      <h4 className="mb-0 text-xl font-medium text-left px-1">{metadataForm.base_name_string_0 || "NFT"} #1</h4>
      <h6 className="mb-2 ml-2 text-sm text-left px-1">Owned by 0x12...A1B2</h6>
      <div className="w-full flex justify-center">
        <ImgPlaceholder chain={contractForm["product_chain_string_2"]} previewImage={previewImage} />
      </div>
      <div tabIndex={0} className="collapse collapse-arrow border border-base-300 bg-base-100 rounded-lg my-6">
        <input type="checkbox" />
        <div className="collapse-title text-lg font-medium">Description</div>
        <div className="collapse-content">
          <p>{metadataForm.description_string_1 || "No description entered"}</p>
        </div>
      </div>
      <div tabIndex={0} className="collapse collapse-arrow border border-base-300 bg-base-100 rounded-lg my-6">
        <input type="checkbox" />
        <div className="collapse-title text-lg font-medium">Attributes</div>
        <div className="collapse-content grid grid-cols-2 gap-2 md:grid-cols-3">
          {attributeList.length > 0 ? attributeList : <p>No attributes entered</p>}
        </div>
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

export default PreviewFormCard;

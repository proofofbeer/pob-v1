type TTemplateCard = {
  attributesArray: string[];
  contractForm: Record<string, any>;
  metadataForm: Record<string, any>;
  isLoading: boolean;
  onSubmitHandler: (event: any) => Promise<void>;
  previewImage: any;
  storeIndex: number;
};

const TemplateCard = ({
  attributesArray,
  contractForm,
  metadataForm,
  isLoading,
  onSubmitHandler,
  storeIndex,
}: TTemplateCard) => {
  const attributes = attributesArray.map((attribute, index: number) => (
    <div
      key={`${attribute}_${index}`}
      className="border border-base-300 bg-accent rounded-lg my-2 py-4 px-2 text-center"
    >
      <p className="text-md font-semibold">{attribute}</p>
      <p className="text-lg font-bold">Some Value</p>
      <p className="text-md">Rarity: XX %</p>
    </div>
  ));

  return (
    <div className="bg-base-100 border-base-300 border shadow-md shadow-secondary rounded-xl w-full px-6 md:px-16 py-4 md:py-8 mt-8">
      <h5 className="mb-2 text-lg font-medium text-left px-1">
        Collection {contractForm.product_name_string_0 || " Name"}
      </h5>
      <h4 className="mb-0 text-xl font-medium text-left px-1">{metadataForm.base_name_string_0 || "NFT"} #1</h4>
      <h6 className="mb-2 ml-2 text-sm text-left px-1">Owned by 0x12...A1B2</h6>
      {/* <div className="w-full flex justify-center">
        <ImgPlaceholder chain={contractForm["product_chain_string_2"]} previewImage={previewImage} />
      </div> */}
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
        <div className="collapse-content grid grid-cols-2 gap-2">{attributes}</div>
      </div>
      <div className="w-full flex items-center justify-center mb-4">
        <button
          className={`btn bg-primary border-primary-focus border-2 text-gray-900 dark:text-white btn-lg md:btn-md w-3/5 md:w-1/2 ${
            isLoading ? "loading" : ""
          }`}
          disabled={isLoading}
          onClick={() => onSubmitHandler(storeIndex)}
        >
          Deploy <span className="ml-2">🚀</span>
        </button>
      </div>
    </div>
  );
};

export default TemplateCard;

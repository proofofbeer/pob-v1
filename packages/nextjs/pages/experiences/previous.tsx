import React, { useState } from "react";
import { ProductFactoryContract } from "../../contracts/ERC721Contract";
import { ContractFactory } from "ethers";
import toast from "react-hot-toast";
import { useSigner } from "wagmi";
import shallow from "zustand/shallow";
import TemplateCard from "~~/components/templates/TemplateCard";
import { useHasHydrated } from "~~/hooks/next-zustand/useHasHydrated";
import { useAppStore } from "~~/services/store/store";

const Templates = () => {
  const hasHydrated = useHasHydrated();
  const { data: signer } = useSigner();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { currentImgName, setUserContracts, storeAttributes, storeContract, storeMetadata } = useAppStore(
    state => ({
      setUserContracts: state.setUserContracts,
      currentImgName: state.currentImgName,
      storeAttributes: state.storeAttributes,
      storeContract: state.storeContract,
      storeMetadata: state.storeMetadata,
    }),
    shallow,
  );

  // useEffect(() => {
  //   setHasHydrated(true);
  // }, []);

  const onDeployHandler = async (index: number) => {
    setIsLoading(true);
    const { product_name_string_0, product_symbol_string_1, product_chain_string_2 } = storeContract[index];

    console.log(`Deploying # ${index} to chain ${product_chain_string_2} !!!`);
    console.log(storeContract[index]);
    setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    try {
      event?.preventDefault();
      const ProductFactory = new ContractFactory(
        ProductFactoryContract.abi,
        ProductFactoryContract.bytecode,
        signer as any,
      );

      const productFactory = await ProductFactory.deploy(product_name_string_0, product_symbol_string_1);

      const res = await productFactory.deployed();
      console.log(`# ${index} DEPLOYED`);
      setUserContracts({ address: res.address, product_name_string_0, symbol: product_symbol_string_1 });
      console.log(res);
    } catch (error: any) {
      const parsedBody = JSON.parse(error.body);
      const { message } = parsedBody.error;
      toast.error(message, {
        position: "bottom-right",
      });
    }
  };

  const templates = storeContract.map((contractData: Record<string, any>, index: number) => (
    <div
      className="flex flex-col items-center hover:border-orange-600 hover:border-2 bg-base-100 border-base-300 border shadow-md shadow-secondary rounded-xl px-6 py-4 lg:py-8 xl:py-12"
      key={`${contractData.name}_0`}
    >
      <h5 className="mb-1 text-md font-medium text-left">Template #{index}</h5>
      <h3 className="mb-4 text-xl font-medium text-center">{contractData.product_name_string_0}</h3>
      <label htmlFor={`my-modal-${index}`} className="btn btn-md md:btn-sm bg-primary">
        Expand
      </label>

      {/* Put this part before </body> tag */}
      <input type="checkbox" id={`my-modal-${index}`} className="modal-toggle" />
      <div className="modal">
        <div className="modal-box relative">
          <label htmlFor={`my-modal-${index}`} className="btn btn-sm btn-circle absolute right-2 top-2">
            ✕
          </label>
          <TemplateCard
            attributesArray={storeAttributes[index]}
            contractForm={storeContract[index]}
            isLoading={isLoading}
            metadataForm={storeMetadata[index]}
            onSubmitHandler={onDeployHandler}
            previewImage={currentImgName}
            storeIndex={index}
          />
        </div>
      </div>
    </div>
  ));
  return (
    <div className="flex flex-col py-8 px-4 lg:px-8 lg:py-12 justify-center items-center min-h-full">
      <h1 className="text-4xl font-semibold text-center">Your Templates</h1>
      {/* <div className="bg-base-100 border-base-300 border shadow-md shadow-secondary rounded-xl w-full md:w-4/5 lg:w-3/5 xl:w-1/2 px-6 md:px-16 py-4 md:py-8"> */}
      <div className="grid grid-cols-1 gap-8 md:grid-cols-3 lg:grid-cols-4 md:gap-4 lg:gap-8 w-full lg:w-full px-2 md:px-16 lg:px-8 xl:px-24 py-4 lg:py-8 mt-8 mb-2 mx-0">
        {hasHydrated && templates}
      </div>
    </div>
  );
};

export default Templates;

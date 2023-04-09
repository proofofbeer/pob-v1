import React, { useState } from "react";
import { useRouter } from "next/router";
import { ProductFactoryContract } from "../../contracts/contractERC721";
import { ContractFactory } from "ethers";
import toast from "react-hot-toast";
import { useSigner } from "wagmi";
import shallow from "zustand/shallow";
import ImgPlaceholder from "~~/components/product-nft/ImgPlaceholder";
import TemplateCard from "~~/components/templates/TemplateCard";
import { useHasHydrated } from "~~/hooks/next-zustand/useHasHydrated";
import { useAppStore } from "~~/services/store/store";

const Templates = () => {
  const hasHydrated = useHasHydrated();
  const router = useRouter();
  const { data: signer } = useSigner();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const {
    currentImgName,
    directoriesCids,
    userContracts,
    setUserContracts,
    storeAttributes,
    storeContract,
    storeMetadata,
  } = useAppStore(
    state => ({
      currentImgName: state.currentImgName,
      directoriesCids: state.directoriesCids,
      userContracts: state.userContracts,
      setUserContracts: state.setUserContracts,
      storeAttributes: state.storeAttributes,
      storeContract: state.storeContract,
      storeMetadata: state.storeMetadata,
      userImgObjs: state.userImgObjs,
    }),
    shallow,
  );

  const onDeployHandler = async (index: number) => {
    setIsLoading(true);
    const { product_name_string_0, product_symbol_string_1, product_chain_string_2 } = storeContract[index];

    try {
      event?.preventDefault();
      const ProductFactory = new ContractFactory(
        ProductFactoryContract.abi,
        ProductFactoryContract.bytecode,
        signer as any,
      );

      const productFactory = await ProductFactory.deploy(product_name_string_0, product_symbol_string_1);

      const res = await productFactory.deployed();
      setUserContracts({
        address: res.address,
        chain: product_chain_string_2,
        name: product_name_string_0,
        symbol: product_symbol_string_1,
      });
      router.push("/experiences");
    } catch (error: any) {
      if (error.body) {
        const parsedBody = JSON.parse(error.body);
        const { message } = parsedBody.error;
        toast.error(message, {
          position: "bottom-right",
        });
      } else {
        console.error(error);
      }
    }
  };

  const templates = storeContract.map((contractData: Record<string, any>, index: number) => (
    <div
      className="flex flex-col items-center hover:border-orange-600 hover:border-2 bg-base-100 border-base-300 border shadow-md shadow-secondary rounded-xl px-2 py-4 lg:py-8 xl:py-12"
      key={`${contractData.product_name_string_0}`}
    >
      <h5 className="mb-1 text-md font-medium text-left">Template #{index}</h5>
      <h3 className="mb-4 text-xl font-medium text-center">{contractData.product_name_string_0}</h3>

      <div className="w-full flex justify-center">
        <ImgPlaceholder
          chain={userContracts[index]?.chain || "Ethereum"}
          previewImage={"none"}
          ipfsCid={directoriesCids[index]}
        />
      </div>
      <label htmlFor={`my-modal-${index}`} className="btn btn-md md:btn-sm bg-primary">
        Expand
      </label>
      <input type="checkbox" id={`my-modal-${index}`} className="modal-toggle" />
      <div className="modal">
        <div className="modal-box relative">
          <label htmlFor={`my-modal-${index}`} className="btn btn-sm btn-circle absolute right-2 top-2">
            ✕
          </label>
          <TemplateCard
            attributesArray={storeAttributes[index]}
            contractForm={storeContract[index]}
            ipfsCid={directoriesCids[index]}
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
      <h1 className="text-4xl font-semibold text-center mb-4">Your NFT Templates</h1>
      <div className="w-full flex justify-center my-4">
        <button
          className="text-md btn bg-orange-700 hover:bg-orange-600 border-orange-900 border-2 text-gray-900 dark:text-white btn-md w-3/5 md:w-1/3 lg:w-1/4 xl:w-1/5"
          disabled={isLoading}
          onClick={() => router.push("/templates/create-template")}
        >
          + NFT Template
        </button>
      </div>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-3 lg:grid-cols-4 md:gap-4 lg:gap-8 w-full lg:w-full px-2 md:px-16 lg:px-8 xl:px-24 py-4 lg:py-8 my-2 mx-0">
        {hasHydrated && templates}
      </div>
    </div>
  );
};

export default Templates;

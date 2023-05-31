import { Dispatch, SetStateAction } from "react";
import Link from "next/link";
import PrimaryButton from "../common/buttons/PrimaryButton";
import POBImage from "../image-handling/POBImage";
import { AddressInput, RainbowKitCustomConnectButton } from "../scaffold-eth";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";

export type TMintPobCard = {
  description: string;
  isLoading: boolean;
  maxSupply: number;
  mint: () => Promise<void>;
  mintToAddress: string;
  name: string; // Name of the Pob Collection
  nftImageUri: string; // Pob Collection Image gateway uri
  pobAddress: string; // Pob Collection contract address
  pobCollectionId: number; // Pob Collection "tokenId"-like identifier inside PersonalPOBFactory contract
  pobId?: number;
  setMintToAddress: Dispatch<SetStateAction<any>>;
  symbol: string; // Symbol of the Pob Collection ("POB")
  totalSupply: number;
  userAddress: string;
};

const MintPobCard = ({
  description,
  isLoading,
  maxSupply,
  mint,
  mintToAddress,
  setMintToAddress,
  name,
  nftImageUri,
  pobAddress,
  pobCollectionId,
  symbol,
  totalSupply,
  userAddress,
}: TMintPobCard) => (
  <div className="bg-base-100 border-base-300 border shadow-md shadow-secondary rounded-xl p-8 w-full md:p-4 lg:py-8">
    <div className="w-full flex justify-center p-4 md:px-24 lg:px-32">
      <POBImage imageURI={nftImageUri} />
    </div>
    <h4 className="mb-2 text-xl font-medium text-center px-1">{name}</h4>
    <p className="mb-4 text-lg text-center px-1">{description}</p>
    <h5 className="mb-1 text-md font-medium text-center px-1">{`${totalSupply} of ${maxSupply} minted`}</h5>
    <div className="w-full flex justify-center">
      <div className="mb-8 px-1">
        <Link
          className="text-md text-center flex justify-center items-center hover:cursor-pointer hover:underline hover:underline-offset-2 mb-2"
          href={`https://polygonscan.com/address/${pobAddress}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          {symbol} Collection #{pobCollectionId} <ArrowTopRightOnSquareIcon className="w-4 ml-2" />
        </Link>
      </div>
    </div>
    <div className="w-full flex justify-center md:mb-8">
      <label
        htmlFor={`mint-pob-modal-${pobAddress}`}
        className={`btn btn-md text-lg normal-case w-1/2 ${
          isLoading || !userAddress || totalSupply === maxSupply
            ? "btn-disabled"
            : "btn-primary bg-orange-600 hover:bg-orange-500 border-orange-600 text-white"
        }`}
      >
        Mint
      </label>
      <input className="modal-toggle" id={`mint-pob-modal-${pobAddress}`} type="checkbox" />
      <div className="modal">
        <div className="modal-box relative">
          <label
            htmlFor={`mint-pob-modal-${pobAddress}`}
            className={`btn btn-sm btn-circle absolute right-2 top-2 ${isLoading && "btn-disabled"}`}
          >
            ✕
          </label>
          <h2 className="mt-12 mb-8 text-2xl font-medium text-center">Minting NFT to:</h2>
          <div className="mb-8 px-4">
            <AddressInput
              name="mintRecipientAddress"
              onChange={(value: any) => setMintToAddress(value)}
              placeholder="Enter address or ENS"
              value={mintToAddress}
            />
          </div>
          {mintToAddress === userAddress ? (
            <p className="text-center mt-8 mb-2">This POB will be minted to the connected account</p>
          ) : (
            <div className="flex justify-center mb-2">
              <button className="no-underline btn-link text-center" onClick={() => setMintToAddress(userAddress)}>
                Enter my connected account
              </button>
            </div>
          )}
          <div className="w-full flex justify-center mb-8">
            <PrimaryButton
              buttonText="Mint"
              classModifier="w-3/5 md:w-3/5 lg:w-2/5 text-xl"
              isDisabled={isLoading}
              isLoading={isLoading}
              onClick={async () => {
                await mint();
              }}
              showLoader={true}
            />
          </div>
        </div>
      </div>
    </div>
    {!userAddress && (
      <div className="flex flex-col justify-center items-center">
        <p className="text-lg text-center my-4">You need to connect with your wallet</p>
        <RainbowKitCustomConnectButton />
      </div>
    )}
  </div>
);

export default MintPobCard;

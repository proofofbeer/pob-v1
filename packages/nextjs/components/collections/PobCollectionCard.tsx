import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import PrimaryButton from "../common/buttons/PrimaryButton";
import POBImage from "../image-handling/POBImage";
import { AddressInput } from "../scaffold-eth";
import { ArrowTopRightOnSquareIcon, ClipboardDocumentIcon } from "@heroicons/react/24/outline";
import { useDeployedContractRead } from "~~/hooks/scaffold-eth/useDeployedContractRead";
import { useDeployedContractWrite } from "~~/hooks/scaffold-eth/useDeployedContractWrite";
import { useAppStore } from "~~/services/store/store";
import { getQRImages, handleZipDownload } from "~~/utils/qr-code";
import { generateUrlsForQrCodes } from "~~/utils/web3/wallet-generation";

export type TPobCard = {
  globalTokenUri?: string; // URI of the base URI metadata
  maxSupply: number; // Maximum number of tokens available for minting
  mintExpirationDateJS?: number; // Date limit for minting in JavaScript (multiplied by 1000 in parent component)
  name: string; // Name of the Pob Collection
  networkName: string;
  nftImageUri: string; // Pob Collection Image gateway uri
  pobAddress: string; // Pob Collection contract address
  pobCollectionId: number; // Pob Collection "tokenId"-like identifier inside PersonalPOBFactory contract
  symbol: string; // Symbol of the Pob Collection ("POB")
  whitelist: any[];
};

const PobCollectionCard = ({
  maxSupply,
  mintExpirationDateJS,
  name,
  nftImageUri,
  pobAddress,
  pobCollectionId,
  symbol,
  whitelist,
}: TPobCard) => {
  const contractName = "POB";
  const { pobBatchDataArray } = useAppStore(state => ({
    pobBatchDataArray: state.pobBatchDataArray,
  }));
  const [mintToAddress, setMintToAddress] = useState<string>("");
  const [qrCodes, setQrCodes] = useState<any[]>([]);
  const [showPreviewQrCode, setShowPreviewQrCode] = useState<boolean>(false);
  const [urlArray, setUrlArray] = useState<string[]>([]);

  const {
    writeAsync: writeSafeMint,
    isLoading: isLoadingSafeMint,
    isMining: isMiningSafeMint,
  } = useDeployedContractWrite({
    contractAddress: pobAddress,
    contractName,
    functionName: "safeMint",
    args: [mintToAddress],
  });

  const { data: pobTotalSupply, refetch: refetchPobTotalSupply }: any = useDeployedContractRead({
    contractAddress: pobAddress,
    contractName,
    functionName: "totalSupply",
    args: [],
    enabled: false,
  });

  const getQrCodes = useCallback(async () => {
    const pobBatchData = pobBatchDataArray.filter(pobBatchData => pobBatchData.pobContractAddress === pobAddress);
    if (!pobBatchData || pobBatchData.length === 0) {
      return;
    }
    if (pobBatchData.length > 0) {
      let urlsArray = [];
      const { privKeysArray } = pobBatchData[0];
      if (!privKeysArray || privKeysArray.length === 0) {
        urlsArray = generateUrlsForQrCodes(pobAddress, []);
      } else {
        urlsArray = generateUrlsForQrCodes(pobAddress, privKeysArray);
      }

      const qrCodes = await getQRImages(urlsArray);
      setQrCodes(qrCodes);
      setUrlArray(urlsArray);
      return;
    }
  }, [pobAddress, pobBatchDataArray]);

  useEffect(() => {
    if (pobAddress && !pobTotalSupply) {
      refetchPobTotalSupply();
    }

    if (qrCodes && qrCodes.length === 0 && whitelist && whitelist.length === 0) {
      getQrCodes();
    }
  }, [pobTotalSupply, pobAddress, refetchPobTotalSupply, whitelist, qrCodes, getQrCodes]);

  return (
    <div className="bg-base-100 border-base-300 border shadow-md shadow-secondary rounded-xl w-full px-4 py-4">
      <div className="w-full flex justify-center py-4 px-16">
        <POBImage imageURI={nftImageUri} />
      </div>
      <h4 className="mb-0 text-xl font-medium text-center px-1">{name}</h4>
      <h5 className="mb-0 text-md font-medium text-center px-1">
        {symbol} Collection #{pobCollectionId}:
      </h5>
      <div className="text-center text-lg font-medium w-full lg:px-4">
        <div className="w-full flex justify-center items-center gap-8 my-4">
          {whitelist && whitelist.length === 0 && (
            <div className="w-1/3 lg:w-2/5">
              <label
                htmlFor={`mint-pob-modal-${pobAddress}`}
                className={`btn btn-primary normal-case w-full ${
                  (mintExpirationDateJS && Date.now() >= mintExpirationDateJS) || pobTotalSupply >= maxSupply
                    ? "btn-disabled"
                    : ""
                }`}
              >
                Mint
              </label>
              <input className="modal-toggle" id={`mint-pob-modal-${pobAddress}`} type="checkbox" />
              <div className="modal">
                <div className="modal-box relative">
                  <label
                    htmlFor={`mint-pob-modal-${pobAddress}`}
                    className="btn btn-sm btn-circle absolute right-2 top-2"
                  >
                    ✕
                  </label>
                  <h2 className="mt-12 mb-8 text-2xl font-medium text-center">Mint NFT and transfer to:</h2>
                  <div className="mb-8 px-4">
                    <AddressInput
                      name="mintRecipientAddress"
                      onChange={(value: any) => setMintToAddress(value)}
                      placeholder="Enter address or ENS"
                      value={mintToAddress}
                    />
                  </div>
                  <div className="w-full flex justify-center mt-8 mb-8">
                    <PrimaryButton
                      buttonText="Mint"
                      classModifier="w-3/5 md:w-3/5 lg:w-2/5 text-xl"
                      isDisabled={isLoadingSafeMint || isMiningSafeMint}
                      isLoading={isLoadingSafeMint || isMiningSafeMint}
                      onClick={async () => {
                        await writeSafeMint();
                        setMintToAddress("");
                        refetchPobTotalSupply();
                      }}
                      showLoader={true}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
          {whitelist && whitelist.length === 0 ? (
            <div className="w-1/3 lg:w-2/5">
              <label
                htmlFor={`share-pob-modal-${pobAddress}`}
                className={`btn btn-primary normal-case w-full ${pobTotalSupply >= maxSupply ? "btn-disabled" : ""}`}
              >
                Share
              </label>
              <input type="checkbox" id={`share-pob-modal-${pobAddress}`} className="modal-toggle" />
              <div className="modal">
                <div className="modal-box relative">
                  <label
                    htmlFor={`share-pob-modal-${pobAddress}`}
                    className="btn btn-sm btn-circle absolute right-2 top-2"
                  >
                    ✕
                  </label>
                  <h2 className="mt-12 mb-8 text-2xl font-medium text-center">Scan to mint POB:</h2>
                  <div className="my-8 w-full flex justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img className="m-0 rounded-xl" src={qrCodes[0]} alt="qrcode" />
                  </div>
                  <h3 className="my-2 text-xl font-medium text-center">Share a URL:</h3>
                  <button
                    className="btn btn-secondary mb-4"
                    onClick={async () => {
                      await navigator.clipboard.writeText(urlArray[0]);
                    }}
                  >
                    Copy link
                    <ClipboardDocumentIcon className="w-4 ml-2" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="w-1/2">
              <button
                onClick={async () => await getQrCodes()}
                className="btn btn-primary normal-case w-full"
                disabled={qrCodes && qrCodes.length > 0}
              >
                Get QR Codes
              </button>
            </div>
          )}
        </div>
        {mintExpirationDateJS && Date.now() >= mintExpirationDateJS && <p>POB minting deadline has passed</p>}
        {pobTotalSupply && pobTotalSupply >= maxSupply && <p>POB minting max supply has been reached</p>}
        <div className="mt-4">
          {pobTotalSupply && (
            <p className="mb-2">
              Total minted: {parseInt(pobTotalSupply._hex)} / {maxSupply}
            </p>
          )}
          <div className="w-full flex justify-center mb-2">
            <Link
              className="flex justify-center items-center hover:cursor-pointer hover:underline hover:underline-offset-2"
              href={`https://opensea.io/assets?search[query]=${pobAddress}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              OpenSea
              <ArrowTopRightOnSquareIcon className="w-4 ml-2" />
            </Link>
          </div>
        </div>
      </div>

      {whitelist && whitelist.length !== 0 && qrCodes && qrCodes.length > 0 && (
        <div
          id="qr-codes"
          className="flex flex-col items-center justify-center w-full px-2 md:px-16 lg:px-8 xl:px-8 mt-6 mb-4 mx-0"
        >
          <button className="btn btn-primary rounded-xl mb-8" onClick={() => handleZipDownload(qrCodes)}>
            Download QR Codes
          </button>
          <div className="collapse w-full">
            <input className="min-h-0" type="checkbox" onChange={() => setShowPreviewQrCode(!showPreviewQrCode)} />
            <div className="w-full collapse-title p-0 min-h-0 text-md text-center font-medium">
              {showPreviewQrCode ? "Hide preview QR code" : "Show preview QR code"}
            </div>
            <div className="collapse-content px-12">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="mt-4 rounded-xl" src={qrCodes[0]} alt="qrcode" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PobCollectionCard;

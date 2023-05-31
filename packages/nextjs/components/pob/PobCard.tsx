import Link from "next/link";
import POBImage from "../image-handling/POBImage";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";

export type TPobCard = {
  name: string; // Name of the Pob Collection
  nftImageUri: string; // Pob Collection Image gateway uri
  pobAddress: string; // Pob Collection contract address
  pobCollectionId: number; // Pob Collection "tokenId"-like identifier inside PersonalPOBFactory contract
  pobId?: number;
  symbol: string; // Symbol of the Pob Collection ("POB")
};

const PobCard = ({ name, nftImageUri, pobAddress, pobCollectionId, pobId, symbol }: TPobCard) => (
  <div className="bg-base-100 border-base-300 border shadow-md shadow-secondary rounded-xl p-1 w-full md:p-4">
    <div className="w-full flex justify-center p-4">
      <POBImage imageURI={nftImageUri} />
    </div>
    <h4 className="mb-4 text-xl font-medium text-center px-1">
      {name} {pobId !== 0 && `#${pobId}`}
    </h4>
    <h5 className="mb-2 text-md font-medium text-center px-1 hidden md:visible">
      <Link
        className="flex justify-center items-center hover:cursor-pointer hover:underline hover:underline-offset-2 w-full mb-2"
        href={`https://mumbai.polygonscan.com/address/${pobAddress}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        {symbol} Collection #{pobCollectionId} <ArrowTopRightOnSquareIcon className="w-4 ml-2" />
      </Link>
    </h5>
  </div>
);

export default PobCard;

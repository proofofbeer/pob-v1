import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { useAccount } from "wagmi";
import NavButton from "~~/components/common/buttons/NavButton";
import ToggleInput from "~~/components/inputs/ToggleInput";
import PobCard from "~~/components/pob/PobCard";
import { useScaffoldContractRead } from "~~/hooks/scaffold-eth";

const MyPobs = () => {
  const [showCollectedPobs, setShowCollectedPobs] = useState<boolean>(true);
  const [collectedPobImages, setCollectedPobImages] = useState<string[]>([]);
  const [createdPobImages, setCreatedPobImages] = useState<string[]>([]);

  const [collectedPobs, setCollectedPobs] = useState<any[] | null>(null);
  const [createdPobs, setCreatedPobs] = useState<any[] | null>(null);
  const { address: userAddress } = useAccount();

  const { data: userMintedPobs } = useScaffoldContractRead({
    contractName: "POBFactory",
    functionName: "getUserPobCollections",
    args: [userAddress],
  });

  const getGatewayImageUrl = useCallback(async (nftUrl: string) => {
    const nftCid = nftUrl.substring(7);
    const res = await axios.get(`https://apefomo-ipfs-gateway.mypinata.cloud/ipfs/${nftCid}`);
    const { image: imageUri } = res.data;
    const imageCid = imageUri.substring(7);

    return `https://apefomo-ipfs-gateway.mypinata.cloud/ipfs/${imageCid}`;
  }, []);

  const getPobCollectionsImageURI = useCallback(
    async (userMintedPobs: any) => {
      const collectedPobsArr = [];
      const createdPobsArr = [];
      const collectedPobImgArr = [];
      const createdPobImgArr = [];
      let tokenId: number;
      for (let i = 0; i < userMintedPobs.length; i++) {
        tokenId = parseInt(userMintedPobs[i][6]._hex);
        const imgUrl = await getGatewayImageUrl(userMintedPobs[i][3]);
        if (tokenId === 0) {
          createdPobsArr.push(userMintedPobs[i]);
          createdPobImgArr.push(imgUrl);
        } else {
          collectedPobsArr.push(userMintedPobs[i]);
          collectedPobImgArr.push(imgUrl);
        }
      }

      setCollectedPobs(collectedPobsArr);
      setCreatedPobs(createdPobsArr);

      setCollectedPobImages(collectedPobImgArr);
      setCreatedPobImages(createdPobImgArr);
    },
    [getGatewayImageUrl],
  );

  useEffect(() => {
    if (userMintedPobs) {
      getPobCollectionsImageURI(userMintedPobs);
    }
  }, [getPobCollectionsImageURI, userMintedPobs]);

  return (
    <div className="flex flex-col py-8 px-4 lg:px-8 lg:py-12 justify-center items-center min-h-full">
      <h1 className="text-4xl font-semibold text-center mb-4">My POBs</h1>
      <NavButton buttonText="Create POB" path="/pob/create" />
      <div className="w-full flex justify-center">
        <ToggleInput
          isDefaultValueA={true}
          onChange={() => {
            setShowCollectedPobs(!showCollectedPobs);
          }}
          textA="Collected"
          textB="Created"
        />
      </div>
      <div
        id="user-pobs-container"
        className="grid gap-8 grid-cols-2 md:grid-cols-3 md:gap-4 lg:grid-cols-4 lg:gap-8 w-full px-2 md:px-16 lg:px-8 xl:px-24 mt-4 mx-0"
      >
        {showCollectedPobs
          ? collectedPobs?.map((mintedPob: any, index) => (
              <PobCard
                key={`${mintedPob.pobAddress}-${parseInt(mintedPob.tokenId)}`}
                name={mintedPob.name}
                nftImageUri={collectedPobImages[index]}
                pobAddress={mintedPob.pobAddress}
                pobCollectionId={parseInt(mintedPob.pobCollectionId)}
                pobId={parseInt(mintedPob.tokenId)}
                symbol={mintedPob.symbol}
              />
            ))
          : createdPobs?.map((mintedPob: any, index) => (
              <PobCard
                key={`${mintedPob.pobAddress}-${parseInt(mintedPob.tokenId)}`}
                name={mintedPob.name}
                nftImageUri={createdPobImages[index]}
                pobAddress={mintedPob.pobAddress}
                pobCollectionId={parseInt(mintedPob.pobCollectionId)}
                pobId={parseInt(mintedPob.tokenId)}
                symbol={mintedPob.symbol}
              />
            ))}
      </div>
    </div>
  );
};

export default MyPobs;

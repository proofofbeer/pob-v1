import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { useAccount } from "wagmi";
import NavButton from "~~/components/common/buttons/NavButton";
import ToggleInput from "~~/components/inputs/ToggleInput";
import PobCard from "~~/components/pob/pobCard";
import { useScaffoldContractRead } from "~~/hooks/scaffold-eth";

const MyPobs = () => {
  const [showCollectedPobs, setShowCollectedPobs] = useState<boolean>(true);
  const [pobImages, setPobImages] = useState<string[]>([]);
  const { address: userAddress } = useAccount();

  const { data: userMintedPobs } = useScaffoldContractRead({
    contractName: "POEPProfileFactory",
    functionName: "getUserMintedPobs",
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
      const imageUris = [];
      for (let i = 0; i < userMintedPobs.length; i++) {
        imageUris.push(await getGatewayImageUrl(userMintedPobs[i][3]));
      }
      setPobImages(imageUris);
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
          valueA="Collected"
          valueB="Created"
        />
      </div>
      <div
        id="user-pobs-container"
        className="grid gap-8 grid-cols-2 md:gap-4 lg:grid-cols-4 lg:gap-8 w-full px-2 md:px-16 lg:px-8 xl:px-24 mt-4 mx-0"
      >
        {pobImages.length > 0 &&
          userMintedPobs?.map((mintedPob: any, index) => {
            if (showCollectedPobs) {
              if (parseInt(mintedPob.tokenId) === 0) {
                return;
              } else {
                return (
                  <PobCard
                    key={mintedPob.pobAddress}
                    name={mintedPob.name}
                    nftImageUri={pobImages[index]}
                    pobAddress={mintedPob.pobAddress}
                    pobCollectionId={parseInt(mintedPob.pobCollectionId)}
                    pobId={parseInt(mintedPob.tokenId)}
                    symbol={mintedPob.symbol}
                  />
                );
              }
            } else {
              if (parseInt(mintedPob.tokenId) !== 0) {
                return;
              } else {
                return (
                  <PobCard
                    key={mintedPob.pobAddress}
                    name={mintedPob.name}
                    nftImageUri={pobImages[index]}
                    pobAddress={mintedPob.pobAddress}
                    pobCollectionId={parseInt(mintedPob.pobCollectionId)}
                    pobId={parseInt(mintedPob.tokenId)}
                    symbol={mintedPob.symbol}
                  />
                );
              }
            }
          })}
      </div>
    </div>
  );
};

export default MyPobs;

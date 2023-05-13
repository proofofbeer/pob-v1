import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { useAccount } from "wagmi";
import PobCollectionCard from "~~/components/collections/PobCollectionCard";
import BackButton from "~~/components/common/buttons/BackButton";
import { useScaffoldContractRead } from "~~/hooks/scaffold-eth";

const MyPobs = () => {
  const [pobImages, setPobImages] = useState<string[]>([]);
  const { address: userAddress } = useAccount();

  const { data: userPobCollections } = useScaffoldContractRead({
    contractName: "PersonalPOBFactory",
    functionName: "getUserPobCollections",
    args: [userAddress],
  });

  const getGatewayImageUrl = useCallback(async (nftUrl: string) => {
    const nftCid = nftUrl.substring(7);
    console.log(`https://apefomo-ipfs-gateway.mypinata.cloud/ipfs/${nftCid}`);
    const res = await axios.get(`https://apefomo-ipfs-gateway.mypinata.cloud/ipfs/${nftCid}`);
    const { image: imageUri } = res.data;
    const imageCid = imageUri.substring(7);

    return `https://apefomo-ipfs-gateway.mypinata.cloud/ipfs/${imageCid}`;
  }, []);

  const getPobCollectionsImageURI = useCallback(
    async (userPobCollections: any) => {
      const imageUris = [];
      for (let i = 0; i < userPobCollections.length; i++) {
        console.log(userPobCollections[i][4]);
        imageUris.push(await getGatewayImageUrl(userPobCollections[i][3]));
      }
      setPobImages(imageUris);
    },
    [getGatewayImageUrl],
  );

  useEffect(() => {
    console.log(typeof userPobCollections);
    console.log(Array.isArray(userPobCollections));
    console.log(userPobCollections);
    if (userPobCollections) {
      getPobCollectionsImageURI(userPobCollections);
    }
  }, [getPobCollectionsImageURI, userPobCollections]);

  return (
    <div className="flex flex-col py-8 px-4 lg:px-8 lg:py-12 justify-center items-center min-h-full">
      <h1 className="text-4xl font-semibold text-center mb-4">My POB Collections</h1>
      <BackButton />
      <div
        id="user-pobs-container"
        className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-4 lg:grid-cols-3 lg:gap-8 w-full px-2 md:px-16 lg:px-8 xl:px-24 mt-4 mx-0"
      >
        {pobImages.length > 0 &&
          userPobCollections?.map((pobCollection: any, index) => (
            <PobCollectionCard
              key={pobCollection.pobAddress}
              globalTokenUri={pobCollection.globalTokenURI}
              maxSupply={parseInt(pobCollection.maxSupply._hex)}
              mintExpirationDateJS={parseInt(pobCollection.mintExpirationDate._hex) * 1000}
              name={pobCollection.name}
              networkName="Polygon"
              nftImageUri={pobImages[index]}
              pobAddress={pobCollection.pobAddress}
              pobCollectionId={parseInt(pobCollection.pobCollectionId)}
              symbol={pobCollection.symbol}
            />
          ))}
      </div>
    </div>
  );
};

export default MyPobs;

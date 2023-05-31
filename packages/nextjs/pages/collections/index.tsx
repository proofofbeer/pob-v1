import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import { useAccount } from "wagmi";
import PobCollectionCard from "~~/components/collections/PobCollectionCard";
import Loader from "~~/components/common/Loader";
import NavButton from "~~/components/common/buttons/NavButton";
import { useScaffoldContractRead } from "~~/hooks/scaffold-eth";
import { useAppStore } from "~~/services/store/store";

const MyPobs = () => {
  const [pobImages, setPobImages] = useState<string[] | null>(null);
  const [pobWhitelists, setPobWhitelists] = useState<any[]>([]);
  const { address: userAddress } = useAccount();
  const router = useRouter();

  const { pobBatchDataArray } = useAppStore(state => ({
    pobBatchDataArray: state.pobBatchDataArray,
  }));

  const { data: userPobCollections, isLoading: isLoadingUserPobCollections } = useScaffoldContractRead({
    contractName: "POBFactory",
    functionName: "getUserPobCollections",
    args: [userAddress],
  });

  const getGatewayImageUrl = useCallback(async (nftUrl: string) => {
    const nftCid = nftUrl.substring(7);
    const res = await axios.get(`https://apefomo-ipfs-gateway.mypinata.cloud/ipfs/${nftCid}`);
    console.log(`https://apefomo-ipfs-gateway.mypinata.cloud/ipfs/${nftCid}`);
    const { image: imageUri, whitelist: pobWhitelist } = res.data;
    const imageCid = imageUri.substring(7);

    return { imageUrl: `https://apefomo-ipfs-gateway.mypinata.cloud/ipfs/${imageCid}`, pobWhitelist };
  }, []);

  const getPobCollectionsImageURI = useCallback(
    async (userPobCollections: any) => {
      const imageUris = [];
      const whitelists: any[] = [];
      try {
        for (let i = 0; i < userPobCollections.length; i++) {
          const { imageUrl, pobWhitelist } = await getGatewayImageUrl(userPobCollections[i][3]);
          imageUris.push(imageUrl);
          whitelists.push(pobWhitelist);
        }
        setPobImages(imageUris);
        setPobWhitelists(whitelists);
        return;
      } catch (error) {
        console.error(error);
      }
    },
    [getGatewayImageUrl],
  );

  useEffect(() => {
    if (userPobCollections && !pobImages) {
      getPobCollectionsImageURI(userPobCollections);
    }
  }, [getPobCollectionsImageURI, pobBatchDataArray, pobImages, userPobCollections]);

  return (
    <div className="flex flex-col py-8 px-4 lg:px-8 lg:py-12 justify-center items-center min-h-full">
      <h1 className="text-4xl font-semibold text-center mb-4">My POB Collections</h1>
      <NavButton buttonText="Create POB" path="/pob/create" />
      {!userPobCollections && <Loader showText={true} />}
      <div
        id="user-pobs-container"
        className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-4 lg:grid-cols-3 lg:gap-8 w-full px-2 md:px-16 lg:px-8 xl:px-24 mt-4 mx-0"
      >
        {pobImages &&
          pobImages.length > 0 &&
          userPobCollections?.map((pobCollection: any, index) => {
            if (parseInt(pobCollection.tokenId._hex) !== 0) return;
            return (
              <PobCollectionCard
                key={pobCollection.pobAddress}
                globalTokenUri={pobCollection.globalTokenURI}
                maxSupply={parseInt(pobCollection.maxSupply._hex)}
                mintExpirationDateJS={
                  pobCollection.mintExpirationDate ? parseInt(pobCollection.mintExpirationDate._hex) * 1000 : undefined
                }
                name={pobCollection.name}
                networkName="Polygon"
                nftImageUri={pobImages[index]}
                pobAddress={pobCollection.pobAddress}
                pobCollectionId={parseInt(pobCollection.pobCollectionId)}
                symbol={pobCollection.symbol}
                whitelist={pobWhitelists[index] ? JSON.parse(pobWhitelists[index]) : undefined}
              />
            );
          })}
      </div>

      {!isLoadingUserPobCollections && userPobCollections && (userPobCollections.length === 0 || !pobImages) && (
        <div className="w-full my-12">
          <h4 className="text-xl text-center font-semibold my-4">You have no POB Collections!</h4>
          <p className="text-center">Create one clicking the button above</p>
        </div>
      )}
      {userPobCollections && (
        <div className="w-full flex justify-center items-center m-8">
          New collection not showing?
          <button className="btn btn-sm ml-4" onClick={router.reload}>
            Refresh
          </button>
        </div>
      )}
    </div>
  );
};

export default MyPobs;

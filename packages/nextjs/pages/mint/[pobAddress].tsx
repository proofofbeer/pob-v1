import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { fetchSigner } from "@wagmi/core";
import axios from "axios";
import { BytesLike, ethers } from "ethers";
import { arrayify, keccak256, solidityPack, splitSignature } from "ethers/lib/utils.js";
import MerkleTree from "merkletreejs";
import toast from "react-hot-toast";
import { useAccount } from "wagmi";
import MintPobCard from "~~/components/pob/MintPobCard";
import { PersonalPOBContract } from "~~/contracts";
import { useAccountBalance } from "~~/hooks/scaffold-eth";
import { useDeployedContractRead } from "~~/hooks/scaffold-eth/useDeployedContractRead";
import { useDeployedEventSubscriber } from "~~/hooks/scaffold-eth/useDeployedEventSubscriber";

const MintPob = () => {
  const personalPobName = "PersonalPOB";
  const router = useRouter();
  const { index: keyPairIndex, key, pobAddress } = router.query;

  const { address: userAddress } = useAccount();
  const { balance } = useAccountBalance(userAddress);

  const [imageUrl, setImageUrl] = useState<any>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [pobMetadata, setPobMetadata] = useState<any | undefined>(undefined);
  const [walletsArray, setWalletsArray] = useState<any[] | undefined>(undefined);

  const { data: pobGlobalTokenUri }: any = useDeployedContractRead({
    contractAddress: pobAddress,
    contractName: personalPobName,
    functionName: "globalTokenURI",
    args: [],
    enabled: true,
  });

  const { data: collectionId }: any = useDeployedContractRead({
    contractAddress: pobAddress,
    contractName: personalPobName,
    functionName: "collectionId",
    args: [],
    enabled: true,
  });

  const { data: totalSupply }: any = useDeployedContractRead({
    contractAddress: pobAddress,
    contractName: personalPobName,
    functionName: "totalSupply",
    args: [],
    enabled: true,
  });

  const { data: maxSupply }: any = useDeployedContractRead({
    contractAddress: pobAddress,
    contractName: personalPobName,
    functionName: "maxSupply",
    args: [],
    enabled: true,
  });

  useDeployedEventSubscriber({
    contractAddress: pobAddress,
    contractName: "PersonalPOB",
    eventName: "Transfer",
    listener: (from: string, to: string, tokenId: string) => {
      console.log(from, to);
      toast.success(`Successfully minted POB #${tokenId}`, {
        position: "top-center",
      });
      router.push("/pob");
    },
  });

  const mint = useCallback(
    async (mintToAddress: string) => {
      if (!walletsArray || walletsArray.length === 0) return;
      if (balance && balance < 0.1) {
        toast.error("You don't have enough balance :(", {
          position: "top-center",
        });
        setIsLoading(false);
        return;
      }
      try {
        const signer = await fetchSigner();
        const pob = new ethers.Contract(pobAddress as string, PersonalPOBContract.abi, signer as any);

        const qrPubKeys = walletsArray.map(wallet => wallet.address);

        const merkleTree = new MerkleTree(qrPubKeys, keccak256, {
          sort: true,
          hashLeaves: true,
        });

        const burnerWallet = new ethers.Wallet(key as BytesLike);

        const rawSig = await burnerWallet.signMessage(arrayify(mintToAddress));
        const { v, r, s } = splitSignature(rawSig);
        const signature = solidityPack(["bytes32", "bytes32", "uint8"], [r, s, v]);

        //  4.4: The app also supplies a Merkle proof for the corresponding
        //      QR public key.
        const merkleProof = merkleTree.getHexProof(keccak256(walletsArray[parseInt(keyPairIndex as string)].address));

        //  4.5: The user may now mint to their desired address using the computed
        //      signature & merkleProof.
        const tx = await pob.safeMintWithMerkleProof(mintToAddress, signature, merkleProof);
        await tx.wait();
      } catch (error) {
        console.log(error);
      }
    },
    [balance, key, keyPairIndex, pobAddress, walletsArray],
  );

  const getGatewayMetadataUrl = useCallback(async (nftUrl: string) => {
    const nftCid = nftUrl.substring(7);
    const res = await axios.get(`https://apefomo-ipfs-gateway.mypinata.cloud/ipfs/${nftCid}`);
    const { image: imageUri } = res.data;
    const imageCid = imageUri.substring(7);

    return {
      fetchedPobMetadata: res.data,
      metadataUrl: `https://apefomo-ipfs-gateway.mypinata.cloud/ipfs/${nftCid}`,
      imageUrl: `https://apefomo-ipfs-gateway.mypinata.cloud/ipfs/${imageCid}`,
    };
  }, []);

  const getPobMetadata = useCallback(
    async (globalTokenUri: any) => {
      const { fetchedPobMetadata, imageUrl } = await getGatewayMetadataUrl(globalTokenUri);
      setImageUrl(imageUrl);
      setPobMetadata(fetchedPobMetadata);
      return fetchedPobMetadata;
    },
    [getGatewayMetadataUrl],
  );

  useEffect(() => {
    if (pobGlobalTokenUri && !pobMetadata) {
      getPobMetadata(pobGlobalTokenUri);
    }
    if (pobMetadata && !walletsArray) {
      setWalletsArray(JSON.parse(pobMetadata.whitelist));
    }
  }, [getPobMetadata, keyPairIndex, pobGlobalTokenUri, pobMetadata, walletsArray]);

  return (
    <div className="flex flex-col py-8 px-4 lg:px-8 lg:py-12 justify-center items-center min-h-full">
      <h1 className="text-4xl font-semibold text-center mb-8">Mint a POB</h1>
      {pobAddress && pobMetadata && collectionId && maxSupply && totalSupply && (
        <MintPobCard
          description={pobMetadata.description}
          isLoading={isLoading}
          maxSupply={parseInt(maxSupply._hex)}
          mint={mint}
          name={pobMetadata.name}
          nftImageUri={imageUrl}
          pobAddress={pobAddress as string}
          pobCollectionId={parseInt(collectionId._hex)}
          symbol={pobMetadata.symbol}
          totalSupply={parseInt(totalSupply._hex)}
          userAddress={userAddress}
        />
      )}
    </div>
  );
};

export default MintPob;

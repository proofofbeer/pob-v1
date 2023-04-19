import { useState } from "react";
import { Abi } from "abitype";
import { utils } from "ethers";
import { useContractWrite, useNetwork } from "wagmi";
import { getParsedEthersError } from "~~/components/scaffold-eth";
import { ERC721Contract, POEPFactoryContract, POEPProfileContract } from "~~/contracts";
// import POEPProfileContract from "~~/contracts/POEPProfile.json";
import { useTransactor } from "~~/hooks/scaffold-eth";
import { getTargetNetwork, notification } from "~~/utils/scaffold-eth";

export const useDeployedContractWrite = ({
  contractAddress,
  contractName,
  functionName,
  args,
  value,
  ...writeConfig
}: any) => {
  const { chain } = useNetwork();
  const writeTx = useTransactor();
  const [isMining, setIsMining] = useState(false);
  const configuredNetwork = getTargetNetwork();

  let selectedContractAbi;

  switch (contractName) {
    case "POEPProfileFactory":
      selectedContractAbi = POEPFactoryContract.abi as Abi;
      break;
    case "POEPProfile":
      selectedContractAbi = POEPProfileContract.abi as Abi;
      break;
    case "ERC721":
      selectedContractAbi = ERC721Contract.abi as Abi;
      break;
    default:
      selectedContractAbi = ERC721Contract.abi as Abi;
      break;
  }

  const wagmiContractWrite = useContractWrite({
    abi: selectedContractAbi as Abi,
    address: contractAddress,
    args: args as unknown[],
    chainId: configuredNetwork.id,
    functionName: functionName as any,
    mode: "recklesslyUnprepared",
    overrides: {
      value: value ? utils.parseEther(value) : undefined,
    },
    onError(error) {
      console.log("Error", error);
    },
    ...writeConfig,
  });

  const sendContractWriteTx = async () => {
    if (!contractAddress) {
      notification.error("Target Contract is not deployed, did you forgot to run `yarn deploy`?");
      return;
    }
    if (!chain?.id) {
      notification.error("Please connect your wallet");
      return;
    }
    if (chain?.id !== configuredNetwork.id) {
      notification.error("You on the wrong network");
      return;
    }

    if (wagmiContractWrite.writeAsync) {
      try {
        setIsMining(true);
        await writeTx(wagmiContractWrite.writeAsync());
      } catch (e: any) {
        console.log(e);
        const message = getParsedEthersError(e);
        notification.error(message);
      } finally {
        setIsMining(false);
      }
    } else {
      notification.error("Contract writer error. Try again.");
      return;
    }
  };

  return {
    ...wagmiContractWrite,
    isMining,
    // Overwrite wagmi's write async
    writeAsync: sendContractWriteTx,
  };
};

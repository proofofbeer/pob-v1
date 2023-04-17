import { useState } from "react";
import { Abi } from "abitype";
import { utils } from "ethers";
import { useContractWrite, useNetwork } from "wagmi";
import { getParsedEthersError } from "~~/components/scaffold-eth";
import { ERC721Contract } from "~~/contracts/ERC721Contract";
import { useTransactor } from "~~/hooks/scaffold-eth";
import { getTargetNetwork, notification } from "~~/utils/scaffold-eth";

export const useProjectFactoryWrite = ({ contractAddress, functionName, args, value, ...writeConfig }: any) => {
  const { chain } = useNetwork();
  const writeTx = useTransactor();
  const [isMining, setIsMining] = useState(false);
  const configuredNetwork = getTargetNetwork();

  const wagmiContractWrite = useContractWrite({
    abi: ERC721Contract.abi as Abi,
    address: contractAddress,
    args: args as unknown[],
    chainId: configuredNetwork.id,
    functionName: functionName as any,
    mode: "recklesslyUnprepared",
    overrides: {
      value: value ? utils.parseEther(value) : undefined,
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

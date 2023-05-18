import { Abi } from "abitype";
import { useContractEvent } from "wagmi";
import { ERC721Contract, POEPFactoryContract, POEPProfileContract, PersonalPOBContract } from "~~/contracts";
import { getTargetNetwork } from "~~/utils/scaffold-eth";

/**
 * @dev wrapper for wagmi's useContractEvent
 * @param config - The config settings
 * @param config.contractName - deployed contract name
 * @param config.eventName - name of the event to listen for
 * @param config.listener - the callback that receives event
 * @param config.once - if set to true it will receive only a single event, then stop listening for the event. Defaults to false
 */
export const useDeployedEventSubscriber = ({ contractAddress, contractName, eventName, listener }: any) => {
  let selectedAbi;
  switch (contractName) {
    case "PersonalPOB":
      selectedAbi = PersonalPOBContract.abi as Abi;
      break;
    case "POEPProfileFactory":
      selectedAbi = POEPFactoryContract.abi as Abi;
      break;
    case "POEPProfile":
      selectedAbi = POEPProfileContract.abi as Abi;
      break;
    case "ERC721":
      selectedAbi = ERC721Contract.abi as Abi;
      break;
  }

  // const { data: deployedContractData } = useDeployedContractInfo(contractName);

  return useContractEvent({
    address: contractAddress,
    abi: selectedAbi as Abi,
    chainId: getTargetNetwork().id,
    listener: listener as (...args: unknown[]) => void,
    eventName: eventName as string,
    once: false,
  });
};

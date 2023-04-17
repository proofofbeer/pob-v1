import { Abi } from "abitype";
import { useContractRead } from "wagmi";
import { ERC721Contract, POEPFactoryContract } from "~~/contracts";
import { getTargetNetwork } from "~~/utils/scaffold-eth";
import { AbiFunctionReturnType } from "~~/utils/scaffold-eth/contract";

/**
 * @dev wrapper for wagmi's useContractRead hook which loads in deployed contract contract abi, address automatically
 * @param config - The config settings, including extra wagmi configuration
 * @param config.contractName - deployed contract name
 * @param config.functionName - name of the function to be called
 * @param config.args - args to be passed to the function call
 */
export const useDeployedContractRead = ({ contractAddress, contractName, functionName, args, ...readConfig }: any) => {
  let selectedAbi;
  switch (contractName) {
    case "POEPProfileFactory":
      selectedAbi = POEPFactoryContract.abi as Abi;
      break;
    case "ERC721":
      selectedAbi = ERC721Contract.abi as Abi;
      break;
  }
  return useContractRead({
    abi: selectedAbi,
    address: contractAddress,
    chainId: getTargetNetwork().id,
    functionName: functionName as any,
    watch: true,
    args,
    ...(readConfig as any),
  }) as Omit<ReturnType<typeof useContractRead>, "data" | "refetch"> & {
    data: AbiFunctionReturnType<any, any>;
    refetch: (options?: { throwOnError: boolean; cancelRefetch: boolean }) => Promise<AbiFunctionReturnType<any, any>>;
  };
};

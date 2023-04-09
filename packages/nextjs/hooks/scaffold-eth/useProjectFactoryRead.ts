import { Abi } from "abitype";
import { useContractRead } from "wagmi";
import { ProductFactoryContract } from "~~/contracts/contractERC721";
import { getTargetNetwork } from "~~/utils/scaffold-eth";
import { AbiFunctionReturnType } from "~~/utils/scaffold-eth/contract";

/**
 * @dev wrapper for wagmi's useContractRead hook which loads in deployed contract contract abi, address automatically
 * @param config - The config settings, including extra wagmi configuration
 * @param config.contractName - deployed contract name
 * @param config.functionName - name of the function to be called
 * @param config.args - args to be passed to the function call
 */
export const useProjectFactoryRead = ({ contractAddress, functionName, args, ...readConfig }: any) => {
  return useContractRead({
    abi: ProductFactoryContract.abi as Abi,
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

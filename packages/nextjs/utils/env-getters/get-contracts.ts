export const getLocalEnvContractAddresses = (pobContractName: string): string => {
  let contractAddress: string;
  const zeroAddress = "0x0";
  console.log(process.env.NEXT_PUBLIC_POEP_PROFILE_FACTORY_ADDRESS_LOCAL);
  console.log(process.env.NEXT_PUBLIC_POEP_PROFILE_FACTORY_ADDRESS_LOCAL);

  switch (pobContractName) {
    case "POEPProfile":
      contractAddress = process.env.NEXT_PUBLIC_POEP_PROFILE_FACTORY_ADDRESS_LOCAL || zeroAddress;
      break;
    case "PersonalPOB":
      contractAddress = process.env.NEXT_PUBLIC_PERSONAL_POB_FACTORY_ADDRESS_LOCAL || zeroAddress;
      break;
    default:
      contractAddress = zeroAddress;
      break;
  }

  console.log(contractAddress);

  return contractAddress;
};

export const getContractAddressByEnv = (): string => {
  const currentDevEnv = process.env.NEXT_PUBLIC_DEVELOPMENT_ENV;
  let contractAddress = process.env.NEXT_PUBLIC_POB_FACTORY_ADDRESS_LOCAL;
  const defaultContractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

  switch (currentDevEnv) {
    case "local":
      contractAddress = process.env.NEXT_PUBLIC_POB_FACTORY_ADDRESS_LOCAL || defaultContractAddress;
      break;
    case "testnet":
      contractAddress = process.env.NEXT_PUBLIC_POB_FACTORY_ADDRESS_MUMBAI || defaultContractAddress;
      break;
    case "qa":
      contractAddress = process.env.NEXT_PUBLIC_POB_FACTORY_ADDRESS_POLYGON || defaultContractAddress;
      break;
    case "prod":
      contractAddress = process.env.NEXT_PUBLIC_POB_FACTORY_ADDRESS_POLYGON || defaultContractAddress;
      break;
    default:
      contractAddress = defaultContractAddress;
      break;
  }

  return contractAddress;
};

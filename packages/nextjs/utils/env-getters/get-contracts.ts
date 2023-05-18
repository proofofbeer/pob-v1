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

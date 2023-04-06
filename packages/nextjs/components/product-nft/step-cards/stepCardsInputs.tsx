type TParamType = {
  name: string;
  type: string; // The fully qualified type (e.g. "address", "tuple(address)", "uint256[3][]"
  baseType: string; // The base type (e.g. "address", "tuple", "array")
  indexed: boolean; // Indexable Paramters ONLY (otherwise null)
};

export const inputParam = {
  name: "string",
  type: "string", // The fully qualified type (e.g. "address", "tuple(address)", "uint256[3][]"
  baseType: "string", // The base type (e.g. "address", "tuple", "array")
  indexed: false, // Indexable Paramters ONLY (otherwise null)
};

export type TInputsArrayElement = {
  baseType: string;
  label: string;
  name: string;
  paramType: TParamType;
  type: string;
};

export const metadataInputsArray: TInputsArrayElement[] = [
  { baseType: "string", label: "NFT Base Name", name: "base_name", paramType: inputParam, type: "string" },
  { baseType: "string", label: "Description", name: "description", paramType: inputParam, type: "string" },
  { baseType: "string", label: "External Link", name: "product_external_link", paramType: inputParam, type: "string" },
];

export const contractInputsArray: TInputsArrayElement[] = [
  { baseType: "string", label: "NFT Collection Name", name: "product_name", paramType: inputParam, type: "string" },
  { baseType: "string", label: "NFT Symbol", name: "product_symbol", paramType: inputParam, type: "string" },
  { baseType: "string", label: "External Link", name: "product_external_link", paramType: inputParam, type: "string" },
];

export const getInputKey = (input: TInputsArrayElement, inputIndex: number): string => {
  const name = input?.name || `input_${inputIndex}_`;
  return name + "_" + input.type + `_${inputIndex}`;
};

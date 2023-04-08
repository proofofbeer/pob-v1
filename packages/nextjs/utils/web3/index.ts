export const getMetadataObject = (metadata: any, attributes: Record<string, any>) => {
  if (Object.keys(attributes).length === 0)
    return {
      name: metadata.base_name_string_0,
      description: metadata.description_string_1,
    };
  else if (Object.keys(attributes).length > 0) {
    return {
      name: metadata.base_name_string_0,
      description: metadata.description_string_1,
      attributes,
    };
  }
};

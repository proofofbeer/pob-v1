export const getBaseUrl = (): string => {
  const currentDevEnv = process.env.NEXT_PUBLIC_DEVELOPMENT_ENV;
  let baseUrl: string;
  const defaultUrl = "http://localhost:3000";

  switch (currentDevEnv) {
    case "local":
      baseUrl = process.env.NEXT_PUBLIC_BASE_URL_LOCAL_ENV || defaultUrl;
      break;
    case "qa":
      baseUrl = process.env.NEXT_PUBLIC_BASE_URL_QA_ENV || defaultUrl;
      break;
    case "prod":
      baseUrl = process.env.NEXT_PUBLIC_BASE_URL_PROD_ENV || defaultUrl;
      break;
    default:
      baseUrl = defaultUrl;
      break;
  }

  return baseUrl;
};

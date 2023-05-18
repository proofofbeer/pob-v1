import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

/**
 * Deploys a contract named "YourContract" using the deployer account and
 * constructor arguments set to the deployer address
 *
 * @param hre HardhatRuntimeEnvironment object.
 */
const deployYourContract: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  /*
    On localhost, the deployer account is the one that comes with Hardhat, which is already funded.

    When deploying to live networks (e.g `yarn deploy --network goerli`), the deployer account
    should have sufficient balance to pay for the gas fees for contract creation.

    You can generate a random account with `yarn generate` which will fill DEPLOYER_PRIVATE_KEY
    with a random private key in the .env file (then used on hardhat.config.ts)
    You can run the `yarn account` command to check your balance in every network.
  */
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  const etherPrice = 1;

  // await deploy("POEPProfileFactory", {
  //   from: deployer,
  //   // Contract constructor arguments
  //   args: ["POBProfile-v1.2", 120, etherPrice],
  //   log: true,
  //   // autoMine: can be passed to the deploy function to make the deployment process faster on local networks by
  //   // automatically mining the contract deployment transaction. There is no effect on live networks.
  //   autoMine: true,
  // });

  await deploy("PersonalPOBFactory", {
    from: deployer,
    // Contract constructor arguments
    args: ["BatchPOB-v1.2", "0x5FbDB2315678afecb367f032d93F642f64180aa3", etherPrice, 25, 157784630],
    log: true,
    // autoMine: can be passed to the deploy function to make the deployment process faster on local networks by
    // automatically mining the contract deployment transaction. There is no effect on live networks.
    autoMine: true,
  });

  // await deploy("POEPProfileFactory", {
  //   from: deployer,
  //   // Contract constructor arguments
  //   args: ["POBProfile-v1.2", 86400, etherPrice],
  //   log: true,
  //   // autoMine: can be passed to the deploy function to make the deployment process faster on local networks by
  //   // automatically mining the contract deployment transaction. There is no effect on live networks.
  //   autoMine: true,
  // });

  // Personal POB Mainnet
  // await deploy("PersonalPOBFactory", {
  //   from: deployer,
  //   // Contract constructor arguments
  //   args: ["BatchPOB-v1.2", "0x8202398ED2885187b39220Aeb26e795486930681", etherPrice, 25, 157784630],
  //   log: true,
  //   // autoMine: can be passed to the deploy function to make the deployment process faster on local networks by
  //   // automatically mining the contract deployment transaction. There is no effect on live networks.
  //   autoMine: true,
  // });

  // await deploy("PersonalPOB", {
  //   from: deployer,
  //   // Contract constructor arguments
  //   args: ["Test", "TEST"],
  //   log: true,
  //   // autoMine: can be passed to the deploy function to make the deployment process faster on local networks by
  //   // automatically mining the contract deployment transaction. There is no effect on live networks.
  //   autoMine: true,
  // });

  // Get the deployed contract
  // const yourContract = await hre.ethers.getContract("YourContract", deployer);
};

export default deployYourContract;

// Tags are useful if you have multiple deploy files and only want to run one of them.
// e.g. yarn deploy --tags YourContract
// deployYourContract.tags = ["POEPProfileFactory", "PersonalPOB"];

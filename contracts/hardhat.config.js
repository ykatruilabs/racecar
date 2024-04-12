import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: "0.8.24",
};

export default {
  solidity: {
    compilers: [
      {
        version: "0.8.25",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          }
        }
      },

    ]
  },
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      chainId: 1337,
      allowUnlimitedContractSize: false,
      //forking: {
      //  url: "https://warmhearted-attentive-market.base-mainnet.quiknode.pro/8995f5e05fc55c498a0f86ee1fb9a74306979a13/",
      //  enabled: true
      //},
    },
    localhost: {
      allowUnlimitedContractSize: false,
      url: "http://localhost:8545",
    },
    mainnet: {
      allowUnlimitedContractSize: false,
      url: "https://base.llamarpc.com",
      accounts: [process.env.DEPLOYER],

    },
  },
  etherscan: {
    apiKey: {
      mainnet: process.env.BASESCAN
    },
    customChains: [
      {
        network: "mainnet",
        chainId: 8453,
        urls: {
          apiURL: "https://api.basescan.org/api",
          browserURL: "https://basescan.org/"
        }
      }
    ]
  }
};

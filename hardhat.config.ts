require('dotenv').config()

import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "hardhat-deploy"

if (process.env.MASTER_MNEMONIC === undefined) {
  console.warn("MASTER_MNEMONIC is not set")
}

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.19",
    settings: {
      optimizer: {
        enabled: true,
        runs: 10000,
      },
    }
  },
  namedAccounts: {
    deployer: 0
  },
  networks: {
    hardhat: {
      accounts: {
        mnemonic: process.env.MASTER_MNEMONIC || "",
        count: 5
      }
    },
    base_goerli: {
      url: `https://base-goerli.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY || ""}`,
      accounts: {
        mnemonic: process.env.DEPLOYER_MNEMONIC || ""
      }
    }
  }
}

export default config;

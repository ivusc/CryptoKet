const fs = require('fs');
require("@nomiclabs/hardhat-waffle");

const ALCHEMY_API_KEY = 'J3j597wRLgIrloRK1GEj3UhCdWZ7FsPI';
const GOERLI_PRIVATE_KEY = fs.readFileSync('.secret').toString().trim();

module.exports = {
  networks: {
    hardhat: {
      chainId: 1337,
    },
    goerli: {
      url: `https://eth-goerli.alchemyapi.io/v2/${ALCHEMY_API_KEY}`,
      accounts: [`${GOERLI_PRIVATE_KEY}`]
    }
  },
  solidity: "0.8.4",
};

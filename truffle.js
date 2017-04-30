module.exports = {
  rpc: {
    host: "localhost",
    port: 8545
  },
  networks: {
    development: {
      host: "localhost",
      port: 8545,
      network_id: "*"
    },
    testnet: {
      host: "localhost",
      port: 8545,
      network_id: 3,
      from: "0x42ccb9b37dd47dec2bbf85d01b0202ca237e109d",
      gas: 2000000,
    },
    live: {
      host: "localhost", // Random IP for example purposes (do not use)
      port: 8545,
      network_id: 1,        // Ethereum public network
      gas: 4000000,
      gasPrice: 20000000000,
      // from: ""
    }
  }
};

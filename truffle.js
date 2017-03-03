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
      gas: 2000000,
      gasPrice: 100000000000,
    }
  }
};
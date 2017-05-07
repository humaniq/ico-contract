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
            gas: 2000000
        },
        live: {
            host: "localhost",
            port: 8545,
            network_id: 1,  // Ethereum public network
            gas: 4000000,
            gasPrice: 20000000000,
        }
    }
};


var HumaniqToken = artifacts.require("HumaniqToken.sol");
var HumaniqICO = artifacts.require("HumaniqICO.sol");

module.exports = function(deployer, network) {

    var founder, ICOfounder;
    if (network == "live") {
        founder = "0xc890b1f532e674977dfdb791cafaee898dfa9671";
        ICOfounder = founder;
    } if (network == "testnet") {
        founder = "0x42ccb9b37dd47dec2bbf85d01b0202ca237e109d";
        ICOfounder = "0xc890b1f532e674977dfdb791cafaee898dfa9671";
    } else {
        founder = "0xaec3ae5d2be00bfc91597d7a1b2c43818d84396a";
        ICOfounder = founder;
    }    

	deployer.deploy(HumaniqToken, founder).then(function() {
        return deployer.deploy(HumaniqICO, HumaniqToken.address, ICOfounder);
    }).then(function(tx) {
        return HumaniqToken.deployed();
    }).then(function(tokenContract) {
        return tokenContract.changeMinter(HumaniqICO.address, { from: founder });
    });
};

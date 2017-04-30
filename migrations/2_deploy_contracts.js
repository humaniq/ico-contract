
var HumaniqToken = artifacts.require("HumaniqToken.sol");
var HumaniqICO = artifacts.require("HumaniqICO.sol");

module.exports = function(deployer, network) {

    var founder;
    if (network == "live") {
        founder = "0xc890b1f532e674977dfdb791cafaee898dfa9671";
    } else {
        founder = "0xaec3ae5d2be00bfc91597d7a1b2c43818d84396a";
    }    

	deployer.deploy(HumaniqToken).then(function() {
        return deployer.deploy(HumaniqICO, HumaniqToken.address);
    }).then(function(tx) {
        return HumaniqToken.deployed();
    }).then(function(tokenContract) {
        return tokenContract.changeMinter(HumaniqICO.address, { from: founder });
    });
};

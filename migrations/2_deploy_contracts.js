
var HumaniqToken = artifacts.require("HumaniqToken.sol");
var HumaniqICO = artifacts.require("HumaniqICO.sol");

module.exports = function(deployer, network) {
  if (network != "development") {
  	// TODO: specify real addresses
  	var founder = "0x74c128191f01dce550d81b19785b54b191259d2d";
  	var multisig = "0x74c128191f01dce550d81b19785b54b191259d2d";
	deployer.deploy(HumaniqToken, founder).then(function() {
		return deployer.deploy(HumaniqICO, founder, multisig, HumaniqToken.address);
	});
  } else {
  	deployer.deploy(HumaniqToken, web3.eth.accounts[0]).then(function() {
		return deployer.deploy(HumaniqICO, web3.eth.accounts[0], web3.eth.accounts[0], HumaniqToken.address);
	});
  }
};

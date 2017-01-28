module.exports = function(deployer) {
  deployer.autolink();

  deployer.deploy(HumaniqToken, "0xaec3ae5d2be00bfc91597d7a1b2c43818d84396a").then(function() {
	return deployer.deploy(HumaniqICO, "0xaec3ae5d2be00bfc91597d7a1b2c43818d84396a", HumaniqToken.address);
  });
};

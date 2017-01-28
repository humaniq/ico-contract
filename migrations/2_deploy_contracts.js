module.exports = function(deployer) {
  deployer.autolink();
/*  deployer.deploy(AbstractToken).then(function() {
	return deployer.deploy(StandardToken).then(function() {
		return deployer.deploy(HumaniqToken);
	});
  }); */
  deployer.deploy(HumaniqToken);
  deployer.deploy(HumaniqICO);
};

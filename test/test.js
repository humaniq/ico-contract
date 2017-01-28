 //Some default values for gas
 var gasAmount = 3000000;
 var gasPrice = 20000000000;

contract('HumaniqICO', function(accounts) {
  it("should start ICO", function() {
    var contract = HumaniqICO.deployed();

    return contract.isICOActive.call({from: accounts[0]}).then(function(isICOActive) {
      assert.equal(isICOActive, false, "ICO is already activated");
      return contract.startICO({from: accounts[0]});
    }).then(function(tx_id) {
      return contract.isICOActive.call({from: accounts[0]});
    }).then(function(isICOActive) {
      assert.equal(isICOActive, true, "ICO is not active");
    });
  });
});

 var gasAmount = 4000000;
 var baseTokenPrice = web3.toWei(0.001, "Ether");


// accounts[0] - owner of the contract

contract('HumaniqICO', function(accounts) {

  it("should start ICO", function() {
    var contract = HumaniqICO.deployed();

    return contract.isICOActive.call({from: accounts[0]}).then(function(isICOActive) {
      // check that ICO is not active yet
      assert.equal(isICOActive, false, "ICO is already activated");
      return contract.startICO({from: accounts[0], gas: gasAmount});
    }).then(function(tx_id) {
      return contract.isICOActive.call({from: accounts[0]});
    }).then(function(isICOActive) {
      // check that ICO was successfuly activated
      assert.equal(isICOActive, true, "ICO is not active");
    });
  });

  it("should invest 10 ETH", function() {
    var contract = HumaniqICO.deployed();
    var token = HumaniqToken.deployed();

    var bonus = 1.499; // we just started the ICO, therefore 49.9% bonus must be applied

    // first of all we allow the contract to emit new tokens
    token.changeEmissionContractAddress(contract.address,
                                        {from: accounts[0], // only owner can call this function
                                         gas: gasAmount}).then(function(tx_id) {
      return token.emissionContractAddress.call();
    }).then(function(emissionContractAddress) {
      // check that emissionContractAddress was successfuly changed
      assert.equal(emissionContractAddress, contract.address, "emissionContractAddress wasn't changed");
    });

    // save initial balance of the investor
    var initialBalance = web3.fromWei(web3.eth.getBalance(accounts[1]), "Ether");
    assert.isAtLeast(initialBalance.toNumber(), 10, "Not enough money");

    // make sure that he doesn't have any tokens so far
    var tokens = token.balanceOf.call(accounts[1]).then(function(balance) {
      assert.equal(balance.toNumber(), 0, "Not null balance");
    });

    // invest 10 ETH using function fund()
    return contract.fund({from: accounts[1],
                          gas: gasAmount,
                          value: web3.toWei(10, "Ether")}).then(function(tx_id) {
      return token.balanceOf.call(accounts[1]);
    }).then(function(balance) {
      // check that investor spent 10 ethers
      var accountBalance = web3.fromWei(web3.eth.getBalance(accounts[1]), "Ether");
      assert.closeTo(accountBalance.toNumber(),
                     initialBalance - 10,
                     0.1, // some ethers were spent on gas
                     "Wrong number of ether were spent");

      // check that investor received correct number of tokens
      assert.closeTo(balance.toNumber(),
                     (web3.toWei(10, "Ether") / baseTokenPrice) * bonus,
                     0.0000001, // possible javascript computational error
                     "Wrong number of tokens were given");

      return token.totalSupply.call();
    }).then(function(totalSupply) {
      // check that totalSupply of tokens is correct
      assert.closeTo(totalSupply.toNumber(),
                     (web3.toWei(10, "Ether") / baseTokenPrice) * bonus,
                     0.0000001, // possible javascript computational error
                     "Wrong total supply");
      return contract.icoBalance.call();
    }).then(function(icoBalance) {
      // check that ICO balance is correct
      assert.equal(icoBalance.toNumber(), web3.toWei(10, "Ether"), "Wrong ICO balance");
    });
  });

});

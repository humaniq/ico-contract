var gasAmount = 4000000;
var baseTokenPrice = web3.toWei(0.001, "Ether");



contract('HumaniqICO', function(accounts) {
    // Owner of the contract
    var icoOwner = accounts[0];
    // Regular HumaniQ investor
    var icoInvestor = accounts[1];


    it("Should start ICO", function() {
        // ICO Contract
        var icoContract = HumaniqICO.deployed();

        return icoContract.isICOActive.call({
            from: icoOwner
        }).then(function(isICOActive) {
            // check that ICO is not active yet
            assert.equal(isICOActive, false, "ICO is already activated");
            return icoContract.startICO({
                from: icoOwner,
                gas: gasAmount
            });
        }).then(function(tx_id) {
            return icoContract.isICOActive.call({
                from: icoOwner
            });
        }).then(function(isICOActive) {
            // check that ICO was successfuly activated
            assert.equal(isICOActive, true, "ICO is not active");
        });
    });

    it("Should invest 10 ETH", function() {
        // ICO Contract
        var icoContract = HumaniqICO.deployed();
        // Token contract
        var tokenContract = HumaniqToken.deployed();

        var bonus = 1.499; // we just started the ICO, therefore 49.9% bonus must be applied

        // first of all we allow the contract to emit new tokens
        tokenContract.changeEmissionContractAddress(icoContract.address, {
            from: accounts[0], // only owner can call this function
            gas: gasAmount
        }).then(function(tx_id) {
            return tokenContract.emissionContractAddress.call();
        }).then(function(emissionContractAddress) {
            // check that emissionContractAddress was successfuly changed
            assert.equal(emissionContractAddress, icoContract.address, "emissionContractAddress wasn't changed");
        });

        // save initial balance of the investor
        var initialBalance = web3.fromWei(web3.eth.getBalance(accounts[1]), "Ether");
        assert.isAtLeast(initialBalance.toNumber(), 10, "Not enough money");

        // make sure that he doesn't have any tokens so far
        var tokens = tokenContract.balanceOf.call(accounts[1]).then(function(balance) {
            assert.equal(balance.toNumber(), 0, "Not null balance");
        });

        // invest 10 ETH using function fund()
        return icoContract.fund({
            from: accounts[1],
            gas: gasAmount,
            value: web3.toWei(10, "Ether")
        }).then(function(tx_id) {
            return tokenContract.balanceOf.call(accounts[1]);
        }).then(function(balance) {
            // check that investor spent 10 ethers
            var accountBalance = web3.fromWei(web3.eth.getBalance(accounts[1]), "Ether");
            assert.closeTo(accountBalance.toNumber(),
                initialBalance - 10,
                0.1, // some ethers were spent on gas
                "Wrong number of ether was spent");

            // check that investor received correct number of tokens
            assert.closeTo(balance.toNumber(),
                (web3.toWei(10, "Ether") / baseTokenPrice) * bonus,
                0.0000001, // possible javascript computational error
                "Wrong number of tokens was given");

            return tokenContract.totalSupply.call();
        }).then(function(totalSupply) {
            // check that totalSupply of tokens is correct
            assert.closeTo(totalSupply.toNumber(),
                (web3.toWei(10, "Ether") / baseTokenPrice) * bonus,
                0.0000001, // possible javascript computational error
                "Wrong total supply");
            return icoContract.icoBalance.call();
        }).then(function(icoBalance) {
            // check that ICO balance is correct
            assert.equal(icoBalance.toNumber(), web3.toWei(10, "Ether"), "Wrong ICO balance");
        });
    });

    it("Should invest 5 ETH via fundBTC()", function() {
        // ICO Contract
        var icoContract = HumaniqICO.deployed();
        // Token contract
        var tokenContract = HumaniqToken.deployed();

        // we just started the ICO, therefore 49.9% bonus must be applied
        var bonus = 1.499;

        // save initial balance of the investor
        var initialBalance = web3.fromWei(web3.eth.getBalance(accounts[1]), "Ether");
        assert.isAtLeast(initialBalance.toNumber(), 10, "Not enough money");

        var initialTokens, initialTokenSupply, initialICOBalance;

        tokenContract.balanceOf.call(accounts[1]).then(function(balance) {
            // save initial tokens
            initialTokens = balance.toNumber();
            return tokenContract.totalSupply.call();
        }).then(function(totalSupply) {
            // save initial token supply
            initialTokenSupply = totalSupply.toNumber();
            return icoContract.icoBalance.call();
        }).then(function(icoBalance) {
            // save initial ICO balance
            initialICOBalance = icoBalance.toNumber();
            // fix 5 ETH investment using fundBTC()
            return icoContract.fundBTC(accounts[1], // beneficiary
                web3.toWei(5, "Ether"), {
                    from: accounts[0], // only owner can call this function
                    gas: gasAmount
                });
        }).then(function() {
            return tokenContract.balanceOf.call(accounts[1]);
        }).then(function(balance) {
            // check that beneficiary received correct number of tokens
            assert.closeTo(balance.toNumber(),
                initialTokens + (web3.toWei(5, "Ether") / baseTokenPrice) * bonus,
                0.0000001, // possible javascript computational error
                "Wrong number of tokens was given");

            return tokenContract.totalSupply.call();
        }).then(function(totalSupply) {
            // check that totalSupply of tokens is correct
            assert.closeTo(totalSupply.toNumber(),
                initialTokenSupply + (web3.toWei(5, "Ether") / baseTokenPrice) * bonus,
                0.0000001, // possible javascript computational error
                "Wrong total supply");
            return icoContract.icoBalance.call();
        }).then(function(icoBalance) {
            // check that ICO balance is correct
            assert.equal(icoBalance.toNumber(),
                initialICOBalance + parseInt(web3.toWei(5, "Ether")),
                "Wrong ICO balance");
        });
    });

    it("Should return current bonus", function() {
        var contract = HumaniqICO.deployed();

        return contract.getBonus.call({
            from: accounts[0]
        }).then(function(discount) {
            // check that IgetBonus() returns correct value
            assert.equal((discount - 1000) / 10, 49.9, "Wrong bonus");
        });
    });
});

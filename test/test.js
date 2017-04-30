var gasAmount = 4000000;
var baseTokenPrice = web3.toWei(0.001, "Ether");
var decimalDevider = 100000000;

var HumaniqICO = artifacts.require("./HumaniqICO.sol");
var HumaniqToken = artifacts.require("./HumaniqToken.sol");

contract('HumaniqICO', function(accounts) {
    // Owner of the contract
    var founder = accounts[0];

    // Start date of the ICO
    var startICODate = 1491433200;  // 2017-04-05 23:00:00 UTC

    // Multisig address
    var multisig = "0xa2c9a7578e2172f32a36c5c0e49d64776f9e7883";

    // Address where all tokens created during ICO stage initially allocated
    var allocationAddress = "0x1111111111111111111111111111111111111111";

    // Number of tokens minted during ICO
    var ICOsupply = 130158351 * 100000000;

    // Number of tokens minted during preICO
    var preICOsupply = 31820314 * 100000000;

    // Number of tokens founders are supposed to receive
    var foundersBalance = Math.floor((ICOsupply * 14) / 86);

    it("Should verify start date", function(done) {
        HumaniqICO.deployed().then(function(instance) {
            icoContract = instance;
            return instance.startDate.call();
        }).then(function(date) {
            assert.equal(date.toNumber(), startICODate, "Start Date should be equal to 1491433200");
        }).then(done);
    });

    it("Should verify allocation addresses", function(done) {
        HumaniqICO.deployed().then(function(instance) {
            return instance.allocationAddress.call();
        }).then(function(address) {
            assert.equal(address, allocationAddress, "ICO Contract Allocation address should be equal to 0x1111111111111111111111111111111111111111");
            return HumaniqToken.deployed();
        }).then(function(instance) {
            return instance.allocationAddressICO.call();
        }).then(function(address) {
            assert.equal(address, allocationAddress, "Token Contract Allocation address should be equal to 0x1111111111111111111111111111111111111111");
        }).then(done);
    });

    it("Should verify founders balance", function(done) {
        HumaniqToken.deployed().then(function(instance) {
            return instance.balanceOf.call(multisig);
        }).then(function(balance) {
            assert.equal(balance.toNumber(), foundersBalance, "Wrong founders balance");
        }).then(done);
    });

    it("Should verify max total supply", function(done) {
        HumaniqToken.deployed().then(function(instance) {
            return instance.maxTotalSupply.call();
        }).then(function(supply) {
            assert.equal(supply.toNumber(), 5 * (ICOsupply + foundersBalance + preICOsupply), "Wrong max total supply");
        }).then(done);
    });

    it("Should check bonuses", function(done) {

        var dateBeforeICO = startICODate - 1;
        var dateIn24Hours = startICODate + 24 * 60 * 60;
        var dateIn2Days = startICODate + 2 * 24 * 60 * 60;
        var dateIn9Days = startICODate + 9 * 24 * 60 * 60;
        var dateIn16Days = startICODate + 16 * 24 * 60 * 60;

        // ICO Contract
        var icoContract;

        HumaniqICO.deployed().then(function(instance) {
            icoContract = instance;
            return icoContract.getBonus.call(dateBeforeICO, { from: founder });
        }).then(function(bonus) {
            assert.equal(bonus.toNumber(), 1499, "Bonus should be equal to 1499");
            return icoContract.getBonus.call(startICODate, { from: founder });
        }).then(function(bonus) {
            assert.equal(bonus.toNumber(), 1499, "Bonus should be equal to 1499");
            return icoContract.getBonus.call(dateIn24Hours, { from: founder });
        }).then(function(bonus) {
            assert.equal(bonus.toNumber(), 1499, "Bonus should be equal to 1499");
            return icoContract.getBonus.call(dateIn2Days, { from: founder });
        }).then(function(bonus) {
            assert.equal(bonus.toNumber(), 1250, "Bonus should be equal to 1250");
            return icoContract.getBonus.call(dateIn9Days, { from: founder });
        }).then(function(bonus) {
            assert.equal(bonus.toNumber(), 1125, "Bonus should be equal to 1125");
            return icoContract.getBonus.call(dateIn16Days, { from: founder });
        }).then(function(bonus) {
            assert.equal(bonus.toNumber(), 1000, "Bonus should be equal to 1000");
        }).then(done);
    });

    it("Should fix investment", function(done) {

        // ICO Contract
        var icoContract;

        // HMQ Token Contract
        var tokenContract;

        // Address of investor
        var investor = accounts[1];

        // Investment
        var investment = web3.toWei(10, "Ether");

        // Investment Date
        var timestamp = startICODate;

        // Number of already distributed tokens
        var distributed;

        // Base price of one token without discount
        var tokenPrice;

        // Allocation address balance
        var allocationAddressBalance;

        // Investor balance
        var investorBalance;

        // Number of tokens distributed during the fixInvestment() call
        var tokensDistributed;

        HumaniqICO.deployed().then(function(instance) {
            icoContract = instance;
            return HumaniqToken.deployed();
        }).then(function(instance) {
            tokenContract = instance;
            return icoContract.tokensDistributed.call();
        }).then(function(number) {
            distributed = number.toNumber();
            return icoContract.baseTokenPrice.call();
        }).then(function(price) {
            tokenPrice = price.toNumber();
            return tokenContract.balanceOf(allocationAddress);
        }).then(function(balance) {
            allocationAddressBalance = balance.toNumber();
            return tokenContract.balanceOf(investor);
        }).then(function(balance) {
            investorBalance = balance.toNumber();
            return icoContract.fixInvestment(investor, investment, timestamp);
        }).then(function(tx) {
            return icoContract.tokensDistributed.call();
        }).then(function(number) {
            var discountedPrice = Math.floor((tokenPrice * 1000) / 1499);
            tokensDistributed = Math.floor(investment / discountedPrice);
            assert.equal(number.toNumber(), distributed + tokensDistributed);
            return tokenContract.balanceOf(allocationAddress);
        }).then(function(balance) {
            assert.equal(balance.toNumber(), allocationAddressBalance - tokensDistributed);
            return tokenContract.balanceOf(investor);
        }).then(function(balance) {
            assert.equal(balance.toNumber(), investorBalance + tokensDistributed);
        }).then(done);
    });
});

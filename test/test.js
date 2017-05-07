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

    // End date of the ICO
    var endICODate = 1493247600;  // 2017-04-26 23:00:00 UTC

    // Multisig address
    var multisig = "0xa2c9a7578e2172f32a36c5c0e49d64776f9e7883";

    // Address where all tokens created during ICO stage initially allocated
    var allocationAddress = "0x1111111111111111111111111111111111111111";

    // Number of tokens minted during ICO
    var ICOsupply = 131038286 * 100000000;

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

        var dates = [];
        // ICO Contract
        var icoContract;

        HumaniqICO.deployed().then(function(instance) {
            icoContract = instance;
            var promises = [];
            for (var date = startICODate - 3600; date <= endICODate; date += 3600) {
                dates.push(date);
                promises.push(icoContract.getBonus.call(date, { from: founder }));
            }
            console.log('await ' + promises.length + ' promises');
            return Promise.all(promises);
        }).then(function(results) {
            for (var i = 0; i < dates.length; ++i) {
                date = dates[i];
                bonus = results[i].toNumber();
                if (date >= dateIn16Days) {
                    assert.equal(bonus, 1000, "Bonus on " + date + " should be equal to 1000");
                } else if (date >= dateIn9Days) {
                    assert.equal(bonus, 1125, "Bonus on " + date + " should be equal to 1125");
                } else if (date >= dateIn2Days) {
                    assert.equal(bonus, 1250, "Bonus on " + date + " should be equal to 1250");
                } else {
                    assert.equal(bonus, 1499, "Bonus on " + date + " should be equal to 1125");
                }
            }
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

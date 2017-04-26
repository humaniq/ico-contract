pragma solidity ^0.4.6;

import "./HumaniqToken.sol";

/// @title HumaniqICO contract - Takes funds from users and issues tokens.
/// @author Evgeny Yurtaev - <evgeny@etherionlab.com>
contract HumaniqICO {

    /*
     * External contracts
     */
    HumaniqToken public humaniqToken;

    /*
     * Crowdfunding parameters
     */
    uint constant public CROWDFUNDING_PERIOD = 3 weeks;

    /*
     *  Storage
     */
    address public founder;
    address public multisig;
    uint public startDate = 0;
    uint public icoBalance = 0;
    uint public coinsIssued = 0;
    uint public baseTokenPrice = 1 finney; // 0.001 ETH
    uint public discountedPrice = baseTokenPrice;
    bool public isICOActive = false;

    // participant address => value in Wei
    mapping (address => uint) public investments;

    /*
     *  Modifiers
     */
    modifier onlyFounder() {
        // Only founder is allowed to do this action.
        if (msg.sender != founder) {
            throw;
        }
        _;
    }

    modifier minInvestment() {
        // User has to send at least the ether value of one token.
        if (msg.value < baseTokenPrice) {
            throw;
        }
        _;
    }

    modifier icoActive() {
        if (isICOActive == false) {
            throw;
        }
        _;
    }

    /// @dev Returns current bonus
    function getCurrentBonus()
        public
        constant
        returns (uint)
    {
        return getBonus(now);
    }

    /// @dev Returns bonus for the specific moment
    /// @param timestamp Time of investment (in seconds)
    function getBonus(uint timestamp)
        public
        constant
        returns (uint)
    {

        if (startDate == 0) {
            return 1499; // 49.9%
        }

        uint icoDuration = timestamp - startDate;
        if (icoDuration >= 16 days) {
            return 1000;  // 0%
        } else if (icoDuration >= 9 days) {
            return 1125;  // 12.5%
        } else if (icoDuration >= 2 days) {
            return 1250;  // 25%
        } else {
            return 1499;  // 49.9%
        }
    }

    function calculateTokens(uint investment, uint timestamp)
        public
        constant
        returns (uint)
    {
        // calculate discountedPrice
        discountedPrice = (baseTokenPrice * 1000) / getBonus(timestamp);

        // Token count is rounded down. Sent ETH should be multiples of baseTokenPrice.
        return investment / discountedPrice;
    }

    /// @dev Issues tokens
    /// @param beneficiary Address the tokens will be issued to.
    /// @param investment Invested amount in Wei
    /// @param timestamp Time of investment (in seconds)
    /// @param sendToFounders Whether to send received ethers to multisig address or not
    function issueTokens(address beneficiary, uint investment, uint timestamp, bool sendToFounders)
        private
        returns (uint)
    {
        uint tokenCount = calculateTokens(investment, timestamp);

        // Ether spent by user.
        uint roundedInvestment = tokenCount * discountedPrice;

        // Send change back to user.
        if (sendToFounders && investment > roundedInvestment && !beneficiary.send(investment - roundedInvestment)) {
            throw;
        }

        // Update fund's and user's balance and total supply of tokens.
        icoBalance += investment;
        coinsIssued += tokenCount;
        investments[beneficiary] += roundedInvestment;

        // Send funds to founders if investment was made
        if (sendToFounders && !multisig.send(roundedInvestment)) {
            // Could not send money
            throw;
        }

        if (!humaniqToken.issueTokens(beneficiary, tokenCount)) {
            // Tokens could not be issued.
            throw;
        }

        return tokenCount;
    }

    /// @dev Allows user to create tokens if token creation is still going
    /// and cap was not reached. Returns token count.
    function fund()
        public
        icoActive
        minInvestment
        payable
        returns (uint)
    {
        return issueTokens(msg.sender, msg.value, now, true);
    }

    /// @dev Issues tokens for users who made BTC purchases.
    /// @param beneficiary Address the tokens will be issued to.
    /// @param investment Invested amount in Wei
    /// @param timestamp Time of investment (in seconds)
    function fixInvestment(address beneficiary, uint investment, uint timestamp)
        external
        icoActive
        onlyFounder
        returns (uint)
    {
        if (timestamp == 0) {
            return issueTokens(beneficiary, investment, now, false);
        }

        return issueTokens(beneficiary, investment, timestamp, false);
    }

    /// @dev If ICO has successfully finished sends the money to multisig
    /// wallet.
    function finishCrowdsale()
        external
        onlyFounder
        returns (bool)
    {
        if (isICOActive == true) {
            isICOActive = false;
            // Founders receive 14% of all created tokens.
             uint founderBonus = (coinsIssued * 14) / 86;
             if (!humaniqToken.issueTokens(multisig, founderBonus)) {
                 // Tokens could not be issued.
                 throw;
             }
        }
    }

    /// @dev Sets token value in Wei.
    /// @param valueInWei New value.
    function changeBaseTokenPrice(uint valueInWei)
        external
        onlyFounder
        returns (bool)
    {
        baseTokenPrice = valueInWei;
        return true;
    }

    function changeTokenAddress(address token_address)
        public
        onlyFounder
    {
         humaniqToken = HumaniqToken(token_address);
    }

    function changeFounder(address _founder)
        public
        onlyFounder
    {
        founder = _founder;
    }

    /// @dev Function that activates ICO.
    function startICO()
        external
        onlyFounder
    {
        if (isICOActive == false && startDate == 0) {
          // Start ICO
          isICOActive = true;
          // Set start-date of token creation
          startDate = now;
        }
    }

    /// @dev Contract constructor function sets founder and multisig addresses.
    function HumaniqICO(address _founder, address _multisig, address token_address) {
        // Set founder address
        founder = _founder;
        // Set multisig address
        multisig = _multisig;
        // Set token address
        humaniqToken = HumaniqToken(token_address);
    }

    /// @dev Fallback function. Calls fund() function to create tokens.
    function () payable {
        fund();
    }
}

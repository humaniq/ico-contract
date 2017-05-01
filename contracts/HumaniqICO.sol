pragma solidity ^0.4.6;

import "./HumaniqToken.sol";
import "./SafeMath.sol";

/// @title HumaniqICO contract - Takes funds from users and issues tokens.
/// @author Evgeny Yurtaev - <evgeny@etherionlab.com>
/// @author Alexey Bashlykov - <alexey@etherionlab.com>
contract HumaniqICO is SafeMath {

    /*
     * External contracts
     */
    HumaniqToken public humaniqToken;

    // Address of the founder of Humaniq.
    address public founder = 0xc890b1f532e674977dfdb791cafaee898dfa9671;

    // Address where all tokens created during ICO stage initially allocated
    address public allocationAddress = 0x1111111111111111111111111111111111111111;

    // Start date of the ICO
    uint public startDate = 1491433200;  // 2017-04-05 23:00:00 UTC

    // End date of the ICO
    uint public endDate = 1493247600;  // 2017-04-26 23:00:00 UTC

    // Token price without discount during the ICO stage
    uint public baseTokenPrice = 10000000; // 0.001 ETH, considering 8 decimal places

    // Number of tokens distributed to investors
    uint public tokensDistributed = 0;

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

    modifier minInvestment(uint investment) {
        // User has to send at least the ether value of one token.
        if (investment < baseTokenPrice) {
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

        if (startDate > timestamp) {
            return 1499;  // 49.9%
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
        uint discountedPrice = div(mul(baseTokenPrice, 1000), getBonus(timestamp));

        // Token count is rounded down. Sent ETH should be multiples of baseTokenPrice.
        return div(investment, discountedPrice);
    }


    /// @dev Issues tokens for users who made BTC purchases.
    /// @param beneficiary Address the tokens will be issued to.
    /// @param investment Invested amount in Wei
    /// @param timestamp Time of investment (in seconds)
    function fixInvestment(address beneficiary, uint investment, uint timestamp)
        external
        onlyFounder
        minInvestment(investment)
        returns (uint)
    {   

        // Calculate number of tokens to mint
        uint tokenCount = calculateTokens(investment, timestamp);

        // Update fund's and user's balance and total supply of tokens.
        tokensDistributed = add(tokensDistributed, tokenCount);

        // Distribute tokens.
        if (!humaniqToken.transferFrom(allocationAddress, beneficiary, tokenCount)) {
            // Tokens could not be issued.
            throw;
        }

        return tokenCount;
    }

    /// @dev Contract constructor
    function HumaniqICO(address tokenAddress, address founderAddress) {
        // Set token address
        humaniqToken = HumaniqToken(tokenAddress);

        // Set founder address
        founder = founderAddress;
    }

    /// @dev Fallback function
    function () payable {
        throw;
    }
}

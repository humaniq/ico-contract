pragma solidity ^0.4.6;

import "./StandardToken.sol";
import "./SafeMath.sol";

/// @title Token contract - Implements Standard Token Interface with HumaniQ features.
/// @author Evgeny Yurtaev - <evgeny@etherionlab.com>
/// @author Alexey Bashlykov - <alexey@etherionlab.com>
contract HumaniqToken is StandardToken, SafeMath {

    /*
     * External contracts
     */
    address public minter;

    /*
     * Token meta data
     */
    string constant public name = "HumaniQ";
    string constant public symbol = "HMQ";
    uint8 constant public decimals = 8;

    // Address of the founder of Humaniq.
    address public founder = 0xc890b1f532e674977dfdb791cafaee898dfa9671;

    // Multisig address of the founders
    address public multisig = 0xa2c9a7578e2172f32a36c5c0e49d64776f9e7883;

    // Address where all tokens created during ICO stage initially allocated
    address public allocationAddress = 0x1111111111111111111111111111111111111111;

    // 31 820 314 tokens were minted during preICO
    uint public preICOSupply = mul(31820314, 100000000);

    // 130 158 351 tokens were minted during ICO
    uint public ICOSupply = mul(130158351, 100000000);

    // Max number of tokens that can be minted
    uint public maxTotalSupply;

    /*
     * Modifiers
     */
    modifier onlyFounder() {
        // Only founder is allowed to do this action.
        if (msg.sender != founder) {
            throw;
        }
        _;
    }

    modifier onlyMinter() {
        // Only minter is allowed to proceed.
        if (msg.sender != minter) {
            throw;
        }
        _;
    }

    /*
     * Contract functions
     */

    /// @dev Crowdfunding contract issues new tokens for address. Returns success.
    /// @param _for Address of receiver.
    /// @param tokenCount Number of tokens to issue.
    function issueTokens(address _for, uint tokenCount)
        external
        payable
        onlyMinter
        returns (bool)
    {
        if (tokenCount == 0) {
            return false;
        }

        if (add(totalSupply, tokenCount) > maxTotalSupply) {
            throw;
        }

        totalSupply = add(totalSupply, tokenCount);
        balances[_for] = add(balances[_for], tokenCount);
        Issuance(_for, tokenCount);
        return true;
    }

    /// @dev Function to change address that is allowed to do emission.
    /// @param newAddress Address of new emission contract.
    function changeMinter(address newAddress)
        public
        onlyFounder
        returns (bool)
    {
        minter = newAddress;

        // Allow emission contract to distribute tokens
        allowed[allocationAddress][minter] = ICOSupply;
    }

    /// @dev Function to change founder address.
    /// @param newAddress Address of new founder.
    function changeFounder(address newAddress)
        public
        onlyFounder
        returns (bool)
    {
        founder = newAddress;
    }

    /// @dev Function to change multisig address.
    /// @param newAddress Address of new multisig.
    function changeMultisig(address newAddress)
        public
        onlyFounder
        returns (bool)
    {
        multisig = newAddress;
    }

    /// @dev Contract constructor function sets initial token balances.
    function HumaniqToken(address founderAddress)
    {   
        // Set founder address
        founder = founderAddress;

        // Allocate all created tokens during ICO stage to allocationAddress.
        balances[allocationAddress] = ICOSupply;

        // Give 14 percent of all tokens to founders.
        balances[multisig] = div(mul(ICOSupply, 14), 86);

        // Set correct totalSupply and limit maximum total supply.
        totalSupply = add(balances[allocationAddress], balances[multisig]);
        maxTotalSupply = mul(totalSupply, 5);
    }
}

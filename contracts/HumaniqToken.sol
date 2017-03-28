pragma solidity ^0.4.2;

import "./StandardToken.sol";

/// @title Token contract - Implements Standard Token Interface with HumaniQ features.
/// @author Evgeny Yurtaev - <evgeny@etherionlab.com>
contract HumaniqToken is StandardToken {

    /*
     * External contracts
     */
    address public emissionContractAddress = 0x0;

    /*
     * Token meta data
     */
    string constant public name = "HumaniQ";
    string constant public symbol = "HMQ";
    uint8 constant public decimals = 8;

    address public founder = 0x0;
    bool locked = true;
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

    modifier isCrowdfundingContract() {
        // Only emission address is allowed to proceed.
        if (msg.sender != emissionContractAddress) {
            throw;
        }
        _;
    }

    modifier unlocked() {
        // Only when transferring coins is enabled.
        if (locked == true) {
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
        isCrowdfundingContract
        returns (bool)
    {
        if (tokenCount == 0) {
            return false;
        }
        balances[_for] += tokenCount;
        totalSupply += tokenCount;
        return true;
    }

    function transfer(address _to, uint256 _value)
        unlocked
        returns (bool success)
    {
        return super.transfer(_to, _value);
    }

    function transferFrom(address _from, address _to, uint256 _value)
        unlocked
        returns (bool success)
    {
        return super.transferFrom(_from, _to, _value);
    }

    /// @dev Function to change address that is allowed to do emission.
    /// @param newAddress Address of new emission contract.
    function changeEmissionContractAddress(address newAddress)
        external
        onlyFounder
        returns (bool)
    {
        emissionContractAddress = newAddress;
    }

    /// @dev Function that locks/unlocks transfers of token.
    /// @param value True/False
    function lock(bool value)
        external
        onlyFounder
    {
        locked = value;
    }

    /// @dev Contract constructor function sets initial token balances.
    /// @param _founder Address of the founder of HumaniQ.
    function HumaniqToken(address _founder)
    {
        totalSupply = 0;
        founder = _founder;
    }
}

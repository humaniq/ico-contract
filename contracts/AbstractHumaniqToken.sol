pragma solidity ^0.4.2;
import "AbstractToken.sol";

contract AbstractHumaniqToken is AbstractToken {
    function issueTokens(address _for, uint tokenCount) payable returns (bool);
    function changeEmissionContractAddress(address newAddress) returns (bool);
}

// SPDX-License-Identifier: MIT

pragma solidity ^0.8.10;

interface IExchange {
    function ethToTokenSwap(uint256 _minTokens) external payable;

    function ethToTokenTransfer(uint256 _minTokens, address _recipient)
        external
        payable;

    function getEthExchangeRate(uint256 _ethSold)
        external
        view
        returns (uint256);
}

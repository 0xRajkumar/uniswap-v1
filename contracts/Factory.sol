//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.10;

import './Exchange.sol';

contract Factory {
    mapping(address => address) public tokenToAddress;

    function createExchange(address _token) public returns (address) {
        require(_token != address(0), 'invalid token address');
        require(tokenToAddress[_token] == address(0), 'exchange already exist');

        Exchange exchange = new Exchange(_token);
        tokenToAddress[_token] = address(exchange);
        return address(exchange);
    }

    function getExchange(address _token) public view returns (address) {
        return tokenToAddress[_token];
    }
}

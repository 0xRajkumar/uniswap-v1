//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.10;

import 'hardhat/console.sol';
import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import '@openzeppelin/contracts/token/ERC20/ERC20.sol';

interface IFactory {
    function getExchange(address _token) external view returns (address);
}

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

contract Exchange is ERC20 {
    address tokenAddress;
    address factoryAddress;

    constructor(address _tokenAddress, address _factoryAddress)
        ERC20('Uniswap-V1', 'UNI-V1')
    {
        require(_tokenAddress != address(0), 'invalid token address');
        tokenAddress = _tokenAddress;
        factoryAddress = _factoryAddress;
    }

    function addLiquidity(uint256 _tokenAmount) public payable {
        uint256 _ethAmount = msg.value;
        require(
            _tokenAmount > 0 && _ethAmount > 0,
            'invalid tokenAmount or ethAmount '
        );
        if (getTokenReserve() == 0) {
            uint256 liquidity = getEthReserve();
            _mint(msg.sender, liquidity);
            IERC20(tokenAddress).transferFrom(
                msg.sender,
                address(this),
                _tokenAmount
            );
        } else {
            uint256 tokenAmount = (getTokenReserve() * _ethAmount) /
                (getEthReserve() - msg.value);
            require(_tokenAmount >= tokenAmount, 'insufficient token amount');
            uint256 liquidity = msg.value;
            _mint(msg.sender, liquidity);
            IERC20(tokenAddress).transferFrom(
                msg.sender,
                address(this),
                tokenAmount
            );
        }
    }

    function getTokenReserve() public view returns (uint256) {
        return IERC20(tokenAddress).balanceOf(address(this));
    }

    function getEthReserve() public view returns (uint256) {
        return address(this).balance;
    }

    function ethToToken(uint256 _minTokens, address recipient) private {
        uint256 tokenOut = exchangeRate(
            msg.value,
            getEthReserve() - msg.value,
            getTokenReserve()
        );
        require(tokenOut >= _minTokens, 'low tokenOut');
        IERC20(tokenAddress).transfer(recipient, tokenOut);
    }

    function ethToTokenSwap(uint256 _minTokens) public payable {
        ethToToken(_minTokens, msg.sender);
    }

    function ethToTokenTransfer(uint256 _minTokens, address _recipient)
        public
        payable
    {
        ethToToken(_minTokens, _recipient);
    }

    function tokenToEthSwap(uint256 _tokensSold, uint256 _minEth) public {
        uint256 ethOut = exchangeRate(
            _tokensSold,
            getTokenReserve(),
            getEthReserve()
        );
        require(ethOut >= _minEth, 'low ethOut');
        IERC20(tokenAddress).transferFrom(
            msg.sender,
            address(this),
            _tokensSold
        );
        (bool sent, ) = payable(msg.sender).call{ value: ethOut }('');
        require(sent, 'Failed to send Ether');
    }

    function getEthExchangeRate(uint256 _ethSold)
        public
        view
        returns (uint256)
    {
        require(_ethSold > 0, 'invalid ethSold');
        uint256 tokenReserve = getTokenReserve();
        uint256 ethReserve = getEthReserve();
        return exchangeRate(_ethSold, ethReserve, tokenReserve);
    }

    function getTokenExchangeRate(uint256 _tokensSold)
        public
        view
        returns (uint256)
    {
        require(_tokensSold > 0, 'invalid tokenSold');
        uint256 tokenReserve = getTokenReserve();
        uint256 ethReserve = getEthReserve();
        return exchangeRate(_tokensSold, tokenReserve, ethReserve);
    }

    function removeLiquidity(uint256 _amount)
        public
        returns (uint256, uint256)
    {
        require(_amount > 0, 'invalid amount');
        uint256 ethAmount = (getEthReserve() * _amount) / totalSupply();
        uint256 tokenAmount = (getTokenReserve() * _amount) / totalSupply();
        _burn(msg.sender, _amount);
        IERC20(tokenAddress).transfer(msg.sender, tokenAmount);
        (bool sent, ) = payable(msg.sender).call{ value: ethAmount }('');
        require(sent, 'Failed to send Ether');
        return (ethAmount, tokenAmount);
    }

    function exchangeRate(
        uint256 tokenIn,
        uint256 tokenInReserve,
        uint256 tokenOutReserve
    ) private pure returns (uint256) {
        require(tokenInReserve > 0 && tokenOutReserve > 0, 'invalid reserves');
        uint256 tokenInWithFee = tokenIn * 99;
        return
            (tokenOutReserve * tokenInWithFee) /
            (100 * tokenInReserve + tokenInWithFee);
    }

    function tokenToTokenSwap(
        uint256 _tokensSold,
        uint256 _minTokenBought,
        address _tokenAddress
    ) private {
        address exchangeAddress = IFactory(factoryAddress).getExchange(
            _tokenAddress
        );
        require(exchangeAddress != address(0), 'invalid exchange address');
        uint256 ethOut = exchangeRate(
            _tokensSold,
            getTokenReserve(),
            getEthReserve()
        );
        IERC20(tokenAddress).transferFrom(
            msg.sender,
            address(this),
            _tokensSold
        );

        IExchange(exchangeAddress).ethToTokenTransfer{ value: ethOut }(
            _minTokenBought,
            msg.sender
        );
    }

    function getTokenToTokenExchangeRate(
        uint256 _tokensSold,
        address _tokensBoughtAddress
    ) public view returns (uint256) {
        address exchangeAddress = IFactory(factoryAddress).getExchange(
            _tokensBoughtAddress
        );
        require(exchangeAddress != address(0), 'invalid exchange address');
        uint256 ethOut = getTokenExchangeRate(_tokensSold);
        return IExchange(exchangeAddress).getEthExchangeRate(ethOut);
    }
}

import { expect } from 'chai';
import { ethers } from 'hardhat';
import {
    Exchange,
    Exchange__factory,
    Token,
    Token__factory,
    Factory,
    Factory__factory
} from '../typechain-types';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { describe, it } from 'mocha';

const toWei = (value: number): string => {
    return ethers.utils.parseEther(value.toString()).toString();
};
const getBalance = ethers.provider.getBalance;
const fromWei = (value: string): number => {
    return Number(ethers.utils.formatEther(value));
};
async function createExchangeUsingFactory(
    factory: Factory,
    tokenAddress: string,
    sender: SignerWithAddress
) {
    const exchangeAddress = await factory
        .connect(sender)
        .callStatic.createExchange(tokenAddress);
    await factory.connect(sender).createExchange(tokenAddress);
    const Exchange = (await ethers.getContractFactory(
        'Exchange'
    )) as Exchange__factory;
    return Exchange.attach(exchangeAddress);
}

describe('Greeter', function () {
    let owner: SignerWithAddress;
    let user: SignerWithAddress;
    let exchange: Exchange;
    let daiToken: Token;

    beforeEach(async () => {
        [owner, user] = await ethers.getSigners();
        const Token = (await ethers.getContractFactory(
            'Token'
        )) as Token__factory;
        daiToken = await Token.deploy('Dai', 'DAI', toWei(10000));
        await daiToken.deployed();
        const Exchange = (await ethers.getContractFactory(
            'Exchange'
        )) as Exchange__factory;
        exchange = await Exchange.deploy(daiToken.address);
        await exchange.deployed();
    });

    it('is deployed', async () => {
        expect(exchange.address).to.be.not.undefined;
        expect(exchange.address).to.be.not.null;
    });
    describe('Liquidity', async () => {
        describe('addliquidity', async () => {
            beforeEach(async () => {
                await daiToken.approve(exchange.address, toWei(10));
                await exchange.addLiquidity(toWei(10), { value: toWei(100) });
            });
            it('adds liquidity', async () => {
                expect((await exchange.getEthReserve()).toString()).to.equal(
                    toWei(100)
                );
                expect((await exchange.getTokenReserve()).toString()).to.equal(
                    toWei(10)
                );
            });
            it('mints LP tokens', async () => {
                expect((await exchange.totalSupply()).toString()).to.equal(
                    toWei(100)
                );
            });
            it('fails when wrong ratio liquidity provided', async () => {
                await daiToken.approve(exchange.address, toWei(5));
                await expect(
                    exchange.addLiquidity(toWei(5), { value: toWei(100) })
                ).to.be.reverted;
            });
        });
        describe('removeLiquidity', async () => {
            beforeEach(async () => {
                await daiToken.approve(exchange.address, toWei(10));
                await exchange.addLiquidity(toWei(10), { value: toWei(100) });
            });
            it('removes liquidity', async () => {
                await exchange.removeLiquidity(toWei(10));
                expect((await exchange.getEthReserve()).toString()).to.be.equal(
                    toWei(90)
                );
                expect((await exchange.totalSupply()).toString()).to.be.equal(
                    toWei(90)
                );
            });
            it('removes all liquidity', async () => {
                await exchange.removeLiquidity(toWei(100));
                expect((await exchange.getEthReserve()).toString()).to.be.equal(
                    toWei(0)
                );
                expect((await exchange.totalSupply()).toString()).to.be.equal(
                    toWei(0)
                );
            });
            it(`doesn't allow invalid liquidity removal`, async () => {
                await expect(exchange.removeLiquidity(toWei(101))).to.be
                    .reverted;
            });
        });

        describe('getTokenAmount', async () => {
            it('will return correct token amount', async () => {
                await daiToken.approve(exchange.address, toWei(100));
                await exchange.addLiquidity(toWei(100), { value: toWei(10) });
                expect(
                    (await exchange.getTokenReserve()).toString()
                ).to.be.equal(toWei(100));
                await exchange.removeLiquidity(toWei(1));
                expect(
                    (await exchange.getTokenReserve()).toString()
                ).to.be.equal(toWei(90));
            });
        });

        describe('getEthAmount', async () => {
            it('will return correct ETH amount', async () => {
                await daiToken.approve(exchange.address, toWei(100));
                await exchange.addLiquidity(toWei(100), { value: toWei(10) });
                expect((await exchange.getEthReserve()).toString()).to.be.equal(
                    toWei(10)
                );
                await exchange.removeLiquidity(toWei(1));
                expect((await exchange.getEthReserve()).toString()).to.be.equal(
                    toWei(9)
                );
            });
        });

        describe('ethToTokenTransfer', async () => {
            beforeEach(async () => {
                await daiToken.approve(exchange.address, toWei(100));
                await exchange.addLiquidity(toWei(100), { value: toWei(10) });
            });
            it('will do eth to token transfer', async () => {
                const userBalanceETHBefore = await getBalance(user.address);
                await exchange
                    .connect(user)
                    .ethToTokenTransfer(toWei(9), user.address, {
                        value: toWei(1)
                    });
                const userBalanceETHAfter = await getBalance(user.address);
                expect(
                    userBalanceETHBefore.sub(userBalanceETHAfter)
                ).to.lessThan(toWei(1.1));
                const userTokenBalance = await daiToken.balanceOf(user.address);
                expect(userTokenBalance.toString()).to.be.equal(
                    '9008189262966333030'
                );
            });
            it('will be reverted when min amount is low', async () => {
                await expect(
                    exchange
                        .connect(user)
                        .ethToTokenTransfer(toWei(9.1), user.address, {
                            value: toWei(1)
                        })
                ).to.be.reverted;
            });
        });
        describe('ethToTokenSwap', async () => {
            beforeEach(async () => {
                await daiToken.approve(exchange.address, toWei(100));
                await exchange.addLiquidity(toWei(100), { value: toWei(10) });
            });
            it('will do eth to token Swap', async () => {
                const userBalanceETHBefore = await getBalance(user.address);
                await exchange.connect(user).ethToTokenSwap(toWei(9), {
                    value: toWei(1)
                });
                const userBalanceETHAfter = await getBalance(user.address);
                expect(
                    userBalanceETHBefore.sub(userBalanceETHAfter)
                ).to.lessThan(toWei(1.1));
                const userTokenBalance = await daiToken.balanceOf(user.address);
                expect(userTokenBalance.toString()).to.be.equal(
                    '9008189262966333030'
                );
            });
            it('will be reverted when min amount is low', async () => {
                await expect(
                    exchange.connect(user).ethToTokenSwap(toWei(9.1), {
                        value: toWei(1)
                    })
                ).to.be.reverted;
            });
        });
        describe('tokenToEthSwap', async () => {
            beforeEach(async () => {
                await daiToken.approve(exchange.address, toWei(100));
                await exchange.addLiquidity(toWei(100), { value: toWei(10) });
                await daiToken.transfer(user.address, toWei(10));
                await daiToken
                    .connect(user)
                    .approve(exchange.address, toWei(10));
            });
            it('will do token to eth Swap', async () => {
                const userBalanceDaiBefore = await getBalance(user.address);
                await exchange
                    .connect(user)
                    .tokenToEthSwap(toWei(10), toWei(0.9));
                const userBalanceDaiAfter = await getBalance(user.address);
                const userBalanceDai = await daiToken.balanceOf(user.address);
                expect(userBalanceDai.toString()).to.be.equal(toWei(0));
                expect(fromWei(userBalanceDaiAfter.toString())).is.greaterThan(
                    fromWei(userBalanceDaiBefore.toString())
                );
            });
            it('will be reverted when min amount is low', async () => {
                await expect(
                    exchange.connect(user).tokenToEthSwap(toWei(10), toWei(1))
                ).to.be.reverted;
            });
        });

        describe('tokenToTokenSwap', async () => {
            let USDC: Token;
            let USDT: Token;
            let exchangeUSDC: Exchange;
            let exchangeUSDT: Exchange;
            beforeEach(async () => {
                const Factory = (await ethers.getContractFactory(
                    'Factory'
                )) as Factory__factory;
                const Token = (await ethers.getContractFactory(
                    'Token'
                )) as Token__factory;
                const factory: Factory = await Factory.deploy();
                USDC = await Token.deploy('USDC', 'USDC', toWei(10000));
                USDT = await Token.connect(user).deploy(
                    'USDT',
                    'USDT',
                    toWei(10000)
                );
                await factory.deployed();
                await USDC.deployed();
                await USDT.deployed();
                exchangeUSDC = await createExchangeUsingFactory(
                    factory,
                    USDC.address,
                    owner
                );
                exchangeUSDT = await createExchangeUsingFactory(
                    factory,
                    USDT.address,
                    user
                );
                await exchangeUSDC.deployed();
                await exchangeUSDT.deployed();
                await USDC.approve(exchangeUSDC.address, toWei(100));
                await USDT.connect(user).approve(
                    exchangeUSDT.address,
                    toWei(100)
                );
                await exchangeUSDC.addLiquidity(toWei(100), {
                    value: toWei(100)
                });
                await exchangeUSDT
                    .connect(user)
                    .addLiquidity(toWei(100), { value: toWei(100) });
            });
            it('checks Exchanges rate of tokens to tokens', async () => {
                const totalUSDT =
                    await exchangeUSDC.getTokenToTokenExchangeRate(
                        toWei(10),
                        USDT.address
                    );
                const totalUSDC =
                    await exchangeUSDT.getTokenToTokenExchangeRate(
                        toWei(10),
                        USDC.address
                    );
                expect(totalUSDC.toString()).to.be.equal(totalUSDT.toString());
            });

            it('swapping tokens for tokens', async () => {
                await USDC.approve(exchangeUSDC.address, toWei(10));
                expect(
                    (await USDT.balanceOf(owner.address)).toString()
                ).to.be.equal('0');
                await exchangeUSDC.tokenToTokenSwap(
                    toWei(10),
                    toWei(5),
                    USDT.address
                );
                expect(
                    (await USDT.balanceOf(owner.address)).toString()
                ).to.be.equal('8187901521290548951');
                expect(
                    (await USDC.balanceOf(user.address)).toString()
                ).to.be.equal('0');
                await USDT.connect(user).approve(
                    exchangeUSDT.address,
                    toWei(10)
                );
                await exchangeUSDT
                    .connect(user)
                    .tokenToTokenSwap(toWei(10), toWei(5), USDC.address);
                expect(
                    (await USDC.balanceOf(user.address)).toString()
                ).to.be.equal('11384166581494990388');
            });
        });
    });
});

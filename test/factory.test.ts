import { expect } from 'chai';
import { ethers } from 'hardhat';
import {
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

describe('Factory', () => {
    let factory: Factory;
    let token: Token;
    let owner: SignerWithAddress;
    beforeEach(async () => {
        [owner] = await ethers.getSigners();
        const Factory = (await ethers.getContractFactory(
            'Factory'
        )) as Factory__factory;
        factory = await Factory.deploy();
        await factory.deployed();

        const Token = (await ethers.getContractFactory(
            'Token'
        )) as Token__factory;
        token = await Token.deploy('TOKEN', 'TKN', toWei(1000));
        await token.deployed();
    });
    it('is contracts deployed', () => {
        expect(factory.address).to.be.not.null;
        expect(factory.address).to.be.not.undefined;
        expect(token.address).to.be.not.null;
        expect(token.address).to.be.not.undefined;
    });

    it('creating exchange', async () => {
        const exchangeAddress: string = await factory.callStatic.createExchange(
            token.address
        );
        await factory.createExchange(token.address);
        expect(exchangeAddress).to.be.equal(
            await factory.getExchange(token.address)
        );
    });

    it(`doesn't allow zero address`, async () => {
        await expect(factory.createExchange(ethers.constants.AddressZero)).to.be
            .reverted;
    });
});

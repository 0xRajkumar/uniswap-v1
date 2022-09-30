import { ethers } from 'hardhat';
import { Token__factory, Factory__factory } from '../typechain-types';
async function main() {
    const Factory = (await ethers.getContractFactory(
        'Factory'
    )) as Factory__factory;
    const factory = await Factory.deploy();
    await factory.deployed();

    const Token = (await ethers.getContractFactory('Token')) as Token__factory;
    const token = await Token.deploy('TOKEN', 'TOKEN', 10 ** 18 + '');
    await token.deployed();

    await factory.createExchange(token.address);
    console.log('Factory address', factory.address);
    console.log('Token address', token.address);
    console.log(
        'First Exchange address',
        await factory.getExchange(token.address)
    );
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

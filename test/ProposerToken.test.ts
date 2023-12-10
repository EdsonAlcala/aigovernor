import { expect } from "chai";
import { deployments, ethers } from "hardhat";

import { ProposerToken, ProposerToken__factory } from '../typechain-types'
import { CONSTANTS } from "../constants";

describe("ProposerToken Tests", function () {
    let proposerToken: ProposerToken;

    const TOKEN_NAME = CONSTANTS.ProposerToken;
    const TOKEN_SYMBOL = TOKEN_NAME;
    const TOKEN_DECIMALS = 18;
    const TOTAL_SUPPLY = ethers.parseEther("100000000"); // 100 million

    beforeEach(async function () {
        await deployments.fixture(CONSTANTS.ProposerToken);
        const proposerTokenDeployment = await deployments.get(CONSTANTS.ProposerToken);

        proposerToken = ProposerToken__factory.connect(proposerTokenDeployment.address, ethers.provider);
    })

    it("should have the right parameters", async () => {
        expect(await proposerToken.name()).to.equal(TOKEN_NAME);
        expect(await proposerToken.symbol()).to.equal(TOKEN_SYMBOL);
        expect(await proposerToken.decimals()).to.equal(TOKEN_DECIMALS);
        expect(await proposerToken.totalSupply()).to.equal(TOTAL_SUPPLY);
    })

    it("should allow delegate", async () => {
        const allSigners = await ethers.getSigners();

        for (let i = 0; i < allSigners.length; i++) {
            const signer = allSigners[i];
            const balance = await proposerToken.balanceOf(signer.address);
            await proposerToken.connect(signer).delegate(signer.address);
            expect(await proposerToken.getVotes(signer.address)).to.equal(balance);
        }
    })
});

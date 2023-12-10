import { expect } from "chai";
import { deployments, ethers } from "hardhat";

import { AIGovernanceToken, AIGovernanceToken__factory } from '../typechain-types'

describe("AIGovernanceToken Tests", function () {
    let aiGovernanceToken: AIGovernanceToken;

    const TOKEN_NAME = "AIGovernance Token";
    const TOKEN_SYMBOL = "AIGovernor";
    const TOKEN_DECIMALS = 18;
    const TOTAL_SUPPLY = ethers.parseEther("100000000"); // 100 million

    beforeEach(async function () {
        await deployments.fixture("AIGovernanceToken");
        const proposerTokenDeployment = await deployments.get("AIGovernanceToken");

        aiGovernanceToken = AIGovernanceToken__factory.connect(proposerTokenDeployment.address, ethers.provider);
    })

    it("should have the right parameters", async () => {
        expect(await aiGovernanceToken.name()).to.equal(TOKEN_NAME);
        expect(await aiGovernanceToken.symbol()).to.equal(TOKEN_SYMBOL);
        expect(await aiGovernanceToken.decimals()).to.equal(TOKEN_DECIMALS);
        expect(await aiGovernanceToken.totalSupply()).to.equal(TOTAL_SUPPLY);
    })

    it("should allow delegate", async () => {
        const allSigners = await ethers.getSigners();

        for (let i = 0; i < allSigners.length; i++) {
            const signer = allSigners[i];
            const balance = await aiGovernanceToken.balanceOf(signer.address);
            await aiGovernanceToken.connect(signer).delegate(signer.address);
            expect(await aiGovernanceToken.getVotes(signer.address)).to.equal(balance);
        }
    })
});

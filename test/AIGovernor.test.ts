import { expect } from "chai";
import { deployments, ethers } from "hardhat";

import { AIGovernor, AIGovernor__factory, ProposerToken, ProposerToken__factory, AIGovernorTimelockController, AIGovernorTimelockController__factory, AIGovernanceToken, AIGovernanceToken__factory } from '../typechain-types'

import { CONSTANTS } from "../constants";
import { config } from "../config";

describe("AIGovernor Tests", function () {
    let aiveGovernor: AIGovernor;
    let votingToken: AIGovernanceToken;
    let timelock: AIGovernorTimelockController;
    let proposerToken: ProposerToken;

    beforeEach(async function () {
        await deployments.fixture("all");
        const aiGovernorDeployment = await deployments.get(CONSTANTS.AIGovernor);

        const aiGovernanceTokenDeployment = await deployments.get(CONSTANTS.AIGovernanceToken);
        const aiGovernanceTokenAddress = aiGovernanceTokenDeployment.address;

        const timelockDeployment = await deployments.get(CONSTANTS.AIGovernorTimelockController);
        const timelockAddress = timelockDeployment.address;

        const proposerTokenDeployment = await deployments.get(CONSTANTS.ProposerToken);
        const proposerTokenAddress = proposerTokenDeployment.address;

        aiveGovernor = AIGovernor__factory.connect(aiGovernorDeployment.address, ethers.provider);
        votingToken = AIGovernanceToken__factory.connect(aiGovernanceTokenAddress, ethers.provider);
        timelock = AIGovernorTimelockController__factory.connect(timelockAddress, ethers.provider);
        proposerToken = ProposerToken__factory.connect(proposerTokenAddress, ethers.provider);
    })

    it("should check governor's properties", async function () {
        expect(await aiveGovernor.name()).to.equal(config.governance.name);
        expect(await aiveGovernor.votingDelay()).to.equal(config.governance.votingDelay);
        expect(await aiveGovernor.votingPeriod()).to.equal(config.governance.votingPeriod);
        expect(await aiveGovernor.proposalThreshold()).to.equal(config.governance.proposalThreshold);
        expect(await (aiveGovernor as any).quorumNumerator()).to.equal(config.governance.quorumNumerator);
        expect(await aiveGovernor.token()).to.equal(await proposerToken.getAddress()); // @dev Be aware that the token for the governor is the proposer token but only voting token can vote
        expect(await aiveGovernor.timelock()).to.equal(await timelock.getAddress());
        expect(await aiveGovernor.quorumDenominator()).to.equal(100);
    });
});

import { expect } from "chai";
import { deployments, ethers } from "hardhat";
import { time, mine } from "@nomicfoundation/hardhat-network-helpers";

import { AIGovernor, AIGovernor__factory, ProposerToken, ProposerToken__factory, AIGovernorTimelockController, AIGovernorTimelockController__factory, AIGovernanceToken, AIGovernanceToken__factory } from '../typechain-types'

import { CONSTANTS } from "../constants";
import { config } from "../config";

describe("AIGovernor Tests", function () {
    let aiGovernor: AIGovernor;
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

        aiGovernor = AIGovernor__factory.connect(aiGovernorDeployment.address, ethers.provider);
        votingToken = AIGovernanceToken__factory.connect(aiGovernanceTokenAddress, ethers.provider);
        timelock = AIGovernorTimelockController__factory.connect(timelockAddress, ethers.provider);
        proposerToken = ProposerToken__factory.connect(proposerTokenAddress, ethers.provider);
    })

    it("should check governor's properties", async function () {
        expect(await aiGovernor.name()).to.equal(config.governance.name);
        expect(await aiGovernor.votingDelay()).to.equal(config.governance.votingDelay);
        expect(await aiGovernor.votingPeriod()).to.equal(config.governance.votingPeriod);
        expect(await aiGovernor.proposalThreshold()).to.equal(config.governance.proposalThreshold);
        expect(await (aiGovernor as any).quorumNumerator()).to.equal(config.governance.quorumNumerator);
        expect(await aiGovernor.token()).to.equal(await proposerToken.getAddress()); // @dev Be aware that the token for the governor is the proposer token but only voting token can vote
        expect(await aiGovernor.timelock()).to.equal(await timelock.getAddress());
        expect(await aiGovernor.quorumDenominator()).to.equal(100);
    });

    it("should allow proposals and voting", async function () {
        const allSigners = await ethers.getSigners();

        // signer0 transfer his voting tokens to signer1
        const signer0Balance = await votingToken.balanceOf(allSigners[0].address);
        await votingToken.connect(allSigners[0]).transfer(allSigners[1].address, signer0Balance);

        expect(await votingToken.balanceOf(allSigners[0].address)).to.equal(0);
        expect(await votingToken.balanceOf(allSigners[1].address)).to.equal(signer0Balance + signer0Balance);

        // first all delegate to themselves, except from signer 0 that has balance 0
        for (let i = 1; i < allSigners.length; i++) {
            const signer = allSigners[i];
            const balance = await votingToken.balanceOf(signer.address);

            await votingToken.connect(signer).delegate(signer.address);
            expect(await votingToken.getVotes(signer.address)).to.equal(balance);
        }

        // create proposal
        const proposalFunction = "setVotingDelay";
        const proposalDescription = "Increase quorum absolute value";
        const proposalTarget = await aiGovernor.getAddress()
        const encodedFunctionCall = aiGovernor.interface.encodeFunctionData(proposalFunction, [7200]);

        // propose
        const proposerBalancerToken = await proposerToken.balanceOf(allSigners[0].address);
        await proposerToken.connect(allSigners[0]).delegate(allSigners[0].address);

        expect(await proposerToken.getVotes(allSigners[0].address)).to.equal(proposerBalancerToken);

        console.log("proposerBalancerToken", proposerBalancerToken.toString());

        const proposalThreshold = await aiGovernor.proposalThreshold();
        console.log("proposalThreshold", proposalThreshold.toString());

        await mine(5);

        const proposalId = await aiGovernor.connect(allSigners[0]).propose.staticCall(
            [proposalTarget],
            [0],
            [encodedFunctionCall],
            proposalDescription);
        console.log("proposalId", proposalId)

        await mine(5);

        const proposal = await aiGovernor.connect(allSigners[0]).propose(
            [proposalTarget],
            [0],
            [encodedFunctionCall],
            proposalDescription);

        console.log("proposal created");

        const proposalBlock = await time.latestBlock();
        console.log("proposalBlock: ", proposalBlock.toString());

        await proposal.wait(1);

        console.log("proposal state: ", (await aiGovernor.state(proposalId)).toString());

        // Fast forward at least 1 block to set proposal as active
        let proposalBlockCounter = proposalBlock + 1;
        await mine(proposalBlockCounter);

        console.log("proposal state: ", (await aiGovernor.state(proposalId)).toString());

        // VOTE

        // @dev The users who delegated to themselves can vote now
        for (let i = 1; i < allSigners.length; i++) {
            const signer = allSigners[i];

            await expect(
                aiGovernor.connect(signer).castVote(proposalId, 1, { gasLimit: 500000 })
            ).not.to.be.reverted;
        }

        console.log("voting block : ", await time.latestBlock());

        // QUEUE

        proposalBlockCounter = proposalBlockCounter + config.governance.votingPeriod + 100

        // fast forward time
        await mine(proposalBlockCounter);

        const descriptionHash = ethers.keccak256(
            ethers.toUtf8Bytes(proposalDescription)
        );

        const queueTx = await aiGovernor.connect(allSigners[0]).queue(
            [proposalTarget],
            [0],
            [encodedFunctionCall],
            descriptionHash,
            { gasLimit: 500000 }
        );

        await queueTx.wait(1);

        // EXECUTE

        proposalBlockCounter = proposalBlockCounter + config.governance.minDelay
        await mine(proposalBlockCounter);

        await expect(
            aiGovernor.connect(allSigners[0]).execute(
                [proposalTarget],
                [0],
                [encodedFunctionCall],
                descriptionHash,
                { gasLimit: 500000 }
            )
        ).not.to.be.reverted;
    })
});

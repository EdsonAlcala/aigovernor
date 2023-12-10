import { expect } from "chai";
import { deployments, ethers } from "hardhat";

import { AIGovernorTimelockController, AIGovernorTimelockController__factory } from '../typechain-types'

import { CONSTANTS } from "../constants";
import { config } from "../config";

describe("AIGovernorTimelockController Tests", function () {
    let aiGovernorTimelockController: AIGovernorTimelockController;

    beforeEach(async function () {
        await deployments.fixture("all");
        const deployment = await deployments.get(CONSTANTS.AIGovernorTimelockController);

        aiGovernorTimelockController = AIGovernorTimelockController__factory.connect(deployment.address, ethers.provider);
    })

    it("should have the right parameters", async () => {
        expect(await aiGovernorTimelockController.getMinDelay()).to.be.equal(config.governance.minDelay);
    })
});

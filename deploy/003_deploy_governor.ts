import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';

import { CONSTANTS } from '../constants'
import { config } from '../config';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const { deployments, getNamedAccounts } = hre;
    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();

    const tokenDeployment = await deployments.get(CONSTANTS.AIGovernanceToken);
    const tokenAddress = tokenDeployment.address;

    const proposeTokenDeployment = await deployments.get(CONSTANTS.ProposerToken);
    const proposeTokenAddress = proposeTokenDeployment.address;

    const timelockDeployment = await deployments.get(CONSTANTS.AIGovernorTimelockController);
    const timelockAddress = timelockDeployment.address;

    await deploy(CONSTANTS.AIGovernor, {
        from: deployer,
        args: [
            {
                name: config.governance.name,
                votingDelay: config.governance.votingDelay,
                votingPeriod: config.governance.votingPeriod,
                proposalThreshold: config.governance.proposalThreshold,
                quorumNumerator: config.governance.quorumNumerator,
                proposerToken: proposeTokenAddress,
                timelock: timelockAddress,
                votingToken: tokenAddress,
            }
        ],
        log: true,
        gasLimit: 7000000,
    });
};

export default func;

func.tags = [CONSTANTS.ALL, CONSTANTS.AIGovernor, 'governor'];
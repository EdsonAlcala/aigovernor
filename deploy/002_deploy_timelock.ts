import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';

import { CONSTANTS } from '../constants'
import { config } from '../config';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const { deployments, getNamedAccounts } = hre;
    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();

    const deployerWallet = await hre.ethers.provider.getSigner(deployer);
    const nonce = await deployerWallet.getNonce();

    const governorAddress = hre.ethers.getCreateAddress({
        from: deployer,
        nonce: hre.ethers.toQuantity(nonce + 1)
    });

    await deploy(CONSTANTS.AIGovernorTimelockController, {
        from: deployer,
        args: [
            config.governance.minDelay,
            governorAddress,
            config.governance.proposers,
            config.governance.executors,
        ],
        log: true,
    });
};
export default func;

func.tags = [CONSTANTS.ALL, CONSTANTS.AIGovernorTimelockController, 'timelock'];
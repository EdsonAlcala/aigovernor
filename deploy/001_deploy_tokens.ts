import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';

import { generateAddressesFromMnemonic } from "../utils"
import { CONSTANTS } from '../constants'
import { config } from '../config';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const { deployments, getNamedAccounts } = hre;
    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();

    const allAddresses = await generateAddressesFromMnemonic(process.env.MASTER_MNEMONIC || "", 5);

    const recipients = allAddresses.map((currentAddress) => {
        return {
            to: currentAddress,
            amount: hre.ethers.parseEther((config.totalSupply / 5).toString()),
        }
    });

    await deploy(CONSTANTS.AIGovernanceToken, {
        from: deployer,
        args: [recipients],
        log: true,
    });

    await deploy(CONSTANTS.ProposerToken, {
        from: deployer,
        args: [],
        log: true,
    })

};
export default func;

func.tags = [CONSTANTS.ALL, CONSTANTS.AIGovernanceToken, CONSTANTS.ProposerToken, 'tokens'];
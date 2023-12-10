import { ethers } from 'ethers';

export async function generateAddressesFromMnemonic(mnemonic: string, numberOfAddresses: number) {
    let result: string[] = [];

    for (let i = 0; i < numberOfAddresses; i++) {
        const hdNode = ethers.HDNodeWallet.fromMnemonic(ethers.Mnemonic.fromPhrase(mnemonic), `m/44'/60'/0'/0/${i}`);
        const address = ethers.getAddress(hdNode.address);
        result.push(address);
    }
    return result;
}

export function delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
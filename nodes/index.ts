require('dotenv').config()

import { backOff } from "exponential-backoff";
import { ethers, NonceManager } from 'ethers';
import OpenAI from 'openai';

import AIGovernorArtifact from '../deployments/base_goerli/AIGovernor.json';
import AIGovernanceTokenArtifact from '../deployments/base_goerli/AIGovernanceToken.json';

import { delay } from '../utils';

const WEB_SOCKET_URL = `wss://base-goerli.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY || ""}`;
const ACCOUNT_INDEX = process.env.ACCOUNT_INDEX || 0;

const web3SockerProvider = new ethers.WebSocketProvider(WEB_SOCKET_URL);

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const getProvider = () => {
    const jsonRPCProvider = new ethers.JsonRpcProvider(`https://base-goerli.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY || ""}`);
    return jsonRPCProvider;
}

const getUserSigner = () => {
    const anotherProvider = getProvider();
    const hdNode = ethers.HDNodeWallet.fromMnemonic(ethers.Mnemonic.fromPhrase(process.env.MASTER_MNEMONIC || ""), `m/44'/60'/0'/0/${ACCOUNT_INDEX}`);
    const wallet = new ethers.Wallet(hdNode.privateKey, anotherProvider);
    console.log("Address:", wallet.address)
    const nonceManager = new NonceManager(wallet);
    return nonceManager.signer
}

const userSigner = getUserSigner();

const main = async () => {
    const aiGovernanceTokenContract = new ethers.Contract(AIGovernanceTokenArtifact.address, AIGovernanceTokenArtifact.abi, userSigner);
    const contract = new ethers.Contract(AIGovernorArtifact.address, AIGovernorArtifact.abi, web3SockerProvider);

    const hasDelegated = await aiGovernanceTokenContract.getVotes(await userSigner.getAddress());

    if (hasDelegated == 0) {
        console.log("No delegation, delegating...")
        const tx = await aiGovernanceTokenContract.delegate(await userSigner.getAddress());
        await tx.wait();

        console.log("Delegated!")
    }

    const eventFilter = {
        address: AIGovernorArtifact.address as string,
        topics: [ethers.id("ProposalCreated(uint256,address,address[],uint256[],string[],bytes[],uint256,uint256,string)")]
    };

    web3SockerProvider.on(eventFilter, async (event) => {
        await delay(4000);

        console.log('Event:', event);
        // Handle the event data here
        const decodedData = contract.interface.parseLog(event);
        console.log('Decoded Data:', decodedData);

        // Access decoded event parameters
        const proposalId = decodedData?.args[0]
        console.log('Proposal ID:', proposalId);

        const description = decodedData?.args[8]

        const decision = await getDecision(description);
        console.log("Decision:", decision);

        await vote(decodedData?.args[0], decision);
    });

    const allProposalCreatedEvents = await contract.queryFilter(contract.filters.ProposalCreated(null, null, null, null, null, null, null, null, null), 0, 'latest');
    console.log("All Proposals", allProposalCreatedEvents);

    const address = await userSigner.getAddress();

    allProposalCreatedEvents.forEach(async (proposalCreatedEvent: any) => {
        const eventData = contract.interface.parseLog(proposalCreatedEvent);

        const currentProposalId = eventData?.args[0]

        console.log("Current Proposal ID:", currentProposalId)

        const currentProposalState = await contract.state(currentProposalId);

        console.log("Current Proposal State:", currentProposalState)

        const ACTIVE_STATUS = 1;

        if (currentProposalState == ACTIVE_STATUS) {
            console.log("About to process an active proposal")

            const hasVoted = await contract.hasVoted(currentProposalId, address);

            if (!hasVoted) {
                console.log("Havent voted yet, so I vote")
                const description = eventData?.args[8]
                const decision = await getDecision(description);
                console.log("Decision:", decision);
                await vote(currentProposalId, decision);
                await delay(4000);
            }
        }
    });

    console.log("Listening for ProposalCreated events...")
}

const getDecision = async (proposal: string) => {
    const chatCompletion: OpenAI.Chat.ChatCompletion = await backOff(() => openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
            {
                "role": "system",
                "content": "Pretend you are the sole decision maker for a Blockchain protocol. You will say no to proposal that present a security risk."
            },
            {
                "role": "user",
                "content": "You must make a clear 'Yay' or 'Nay' vote. Respond in the following format: Answer: <answer>. Here's a proposal for you to consider: " + proposal
            }
        ],
    }))

    console.log(chatCompletion.choices[0].message);

    if (chatCompletion.choices[0].message.content?.includes("Answer: Nay")) {
        return 0;
    }
    return 1;
}

const vote = async (proposalId: any, answer: number) => {
    const anotherProvider = getProvider();
    const contract = new ethers.Contract(AIGovernorArtifact.address, AIGovernorArtifact.abi, anotherProvider);
    const contractWithSigner = contract.connect(userSigner);
    const governorInstance = await (contractWithSigner as any).castVote(proposalId, answer, {
        gasLimit: 500000,
    });
    await governorInstance.wait();
    console.log("Voted")
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

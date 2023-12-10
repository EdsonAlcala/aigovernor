import { DeploymentConfig } from "../types";

export const config: DeploymentConfig = {
    totalSupply: 100000000, // 100 M 
    governance: {
        minDelay: 600,
        proposers: [],
        executors: [],
        name: "AIGovernor",
        votingDelay: 0, // after proposals are being made, they are inmediately available for voting
        votingPeriod: 7200 * 1 / 24, // 1 hour => 7200 blocks per day * 1/24
        proposalThreshold: "1000000000000000000000000", // 1M tokens
        quorumNumerator: 60, // since denominator is 100 => this is 60%  of the total supply (100M) or 60,000,000 tokens
    }
}
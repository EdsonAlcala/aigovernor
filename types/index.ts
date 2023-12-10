export interface DeploymentConfig {
    totalSupply: number;
    governance: GovernanceConfig;
}

interface GovernanceConfig {
    name: string;
    votingDelay: number;
    votingPeriod: number;
    minDelay: number;
    proposers: string[];
    executors: string[];
    proposalThreshold: string;
    quorumNumerator: number;
}
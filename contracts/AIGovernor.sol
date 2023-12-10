// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "@openzeppelin/contracts/governance/Governor.sol";
import "@openzeppelin/contracts/governance/TimelockController.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorSettings.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorCountingSimple.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorVotes.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorVotesQuorumFraction.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorTimelockControl.sol";

import "./GovernorAIAssisted.sol";

// @notice Custom OZ Governor implementation that adds the notion of Proposer token and Voting token.
// This means proposer token holders can only make a proposal if they have enough tokens.
// This is still compatible with UIs like Tally and allow users to delegate between them.
// However, only the voting token holders will be able to vote on the proposal.
// Use cases:
// Imagine delegating the voting and decision making of your proposals to an external entity like AI.
contract AIGovernor is
    Governor,
    GovernorSettings,
    GovernorCountingSimple,
    GovernorVotes,
    GovernorVotesQuorumFraction,
    GovernorTimelockControl,
    GovernorAIAssisted
{
    struct GovernorParameters {
        string name;
        uint256 votingDelay;
        uint256 votingPeriod;
        uint256 proposalThreshold;
        uint256 quorumNumerator;
        IVotes proposerToken;
        TimelockController timelock;
        IVotes votingToken;
    }

    constructor(GovernorParameters memory _parameters)
        Governor(_parameters.name)
        GovernorSettings(_parameters.votingDelay, _parameters.votingPeriod, _parameters.proposalThreshold)
        GovernorVotes(_parameters.proposerToken)
        GovernorVotesQuorumFraction(_parameters.quorumNumerator)
        GovernorTimelockControl(_parameters.timelock)
        GovernorAIAssisted(_parameters.votingToken)
    {}

    // OVERRIDES REQUIRED BY SOLIDITY TO IMPLEMENT THE OZ GOVERNOR
    function _getVotes(address account, uint256 timepoint, bytes memory /*params*/ )
        internal
        view
        override(Governor, GovernorVotes, GovernorAIAssisted)
        returns (uint256)
    {
        return super._getVotes(account, timepoint, "");
    }

    function getVotes(address account, uint256 timepoint)
        public
        view
        override(Governor, IGovernor, GovernorAIAssisted)
        returns (uint256)
    {
        return super.getVotes(account, timepoint);
    }

    function getVotesWithParams(address account, uint256 timepoint, bytes memory)
        public
        view
        override(Governor, IGovernor, GovernorAIAssisted)
        returns (uint256)
    {
        return super.getVotes(account, timepoint);
    }

    function votingDelay() public view override(IGovernor, GovernorSettings) returns (uint256) {
        return super.votingDelay();
    }

    function votingPeriod() public view override(IGovernor, GovernorSettings) returns (uint256) {
        return super.votingPeriod();
    }

    function quorum(uint256 blockNumber)
        public
        view
        override(IGovernor, GovernorVotesQuorumFraction)
        returns (uint256)
    {
        return super.quorum(blockNumber);
    }

    function state(uint256 proposalId)
        public
        view
        override(Governor, GovernorTimelockControl)
        returns (ProposalState)
    {
        return super.state(proposalId);
    }

    function propose(
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        string memory description
    ) public override(Governor, IGovernor) returns (uint256) {
        return super.propose(targets, values, calldatas, description);
    }

    function proposalThreshold() public view override(Governor, GovernorSettings) returns (uint256) {
        return super.proposalThreshold();
    }

    function _execute(
        uint256 proposalId,
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        bytes32 descriptionHash
    ) internal override(Governor, GovernorTimelockControl) {
        super._execute(proposalId, targets, values, calldatas, descriptionHash);
    }

    function _cancel(
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        bytes32 descriptionHash
    ) internal override(Governor, GovernorTimelockControl) returns (uint256) {
        return super._cancel(targets, values, calldatas, descriptionHash);
    }

    function _executor() internal view override(Governor, GovernorTimelockControl) returns (address) {
        return super._executor();
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(Governor, GovernorTimelockControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}

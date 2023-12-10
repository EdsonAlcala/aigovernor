// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "@openzeppelin/contracts/governance/Governor.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorVotes.sol";

abstract contract GovernorAIAssisted is Governor, GovernorVotes {
    IVotes public votingToken;

    constructor(IVotes _votingToken) {
        votingToken = _votingToken;
    }

    // GovernorVotes overrides

    // @dev Since this is called when casting a vote, we use votingToken instead of token
    function _getVotes(address account, uint256 timepoint, bytes memory /*params*/ )
        internal
        view
        virtual
        override(Governor, GovernorVotes)
        returns (uint256)
    {
        return votingToken.getPastVotes(account, timepoint);
    }

    // Governor overrides

    // @dev Since this is called when proposing a vote, we use token instead of votingToken
    function getVotes(address account, uint256 timepoint) public view virtual override returns (uint256) {
        return token.getPastVotes(account, timepoint);
    }

    function getVotesWithParams(address account, uint256 timepoint, bytes memory)
        public
        view
        virtual
        override
        returns (uint256)
    {
        return token.getPastVotes(account, timepoint);
    }
}

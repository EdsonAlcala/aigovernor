// SPDX-License-Identifier: agpl-3.0
// OpenZeppelin Contracts (last updated v4.7.0) (governance/TimelockController.sol)

pragma solidity 0.8.19;

import "@openzeppelin/contracts/governance/TimelockController.sol";

contract AIGovernorTimelockController is TimelockController {
    constructor(uint256 _minDelay, address _governor, address[] memory _proposers, address[] memory _executors)
        TimelockController(_minDelay, _proposers, _executors, address(0))
    {
        // @dev address(0) for non additional admins
        if (_governor != address(0)) {
            _setupRole(PROPOSER_ROLE, _governor);
            _setupRole(CANCELLER_ROLE, _governor);
        }

        _setupRole(EXECUTOR_ROLE, address(0)); // Allow anybody to execute the proposals

        _revokeRole(TIMELOCK_ADMIN_ROLE, _msgSender()); // @dev revoke deployer's admin role
    }
}

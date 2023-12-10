//SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";

error TokenBadInitialTotalSupply();

contract AIGovernanceToken is ERC20, ERC20Votes {
    uint256 private constant MAX_SUPPLY = 100_000_000 ether; // 100 million

    struct Recipient {
        address to;
        uint256 amount;
    }

    constructor(Recipient[] memory _recipients) ERC20("AIGovernance Token", "AIGovernor") ERC20Permit("AIGovernor") {
        for (uint256 i = 0; i < _recipients.length; i++) {
            _mint(_recipients[i].to, _recipients[i].amount);
        }

        if (totalSupply() != MAX_SUPPLY) {
            revert TokenBadInitialTotalSupply();
        }
    }

    // @dev standard ERC20 transfer functions
    function _afterTokenTransfer(address from, address to, uint256 amount) internal override(ERC20, ERC20Votes) {
        super._afterTokenTransfer(from, to, amount);
    }

    function _beforeTokenTransfer(address from, address to, uint256 amount) internal override(ERC20) {
        super._beforeTokenTransfer(from, to, amount);
    }

    function _mint(address to, uint256 amount) internal override(ERC20, ERC20Votes) {
        super._mint(to, amount);
    }

    function _burn(address account, uint256 amount) internal override(ERC20, ERC20Votes) {
        super._burn(account, amount);
    }
}

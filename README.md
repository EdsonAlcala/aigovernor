# AI Governor

> AI governance module to remove humans from OnChain Governance decisions.

AI Governor is a OpenZeppelin Governor extension that enables any protocol to delegate governance decisions to a network of decentralized LLM models. 

## Features

- Fully compatible with existing governance platforms like Tally.
- Easy to implement
- Scalable and configurable
- Remove humans from governance decisions

## Architecture

The project consist of 2 main elements:

- The AIGovernor contracts

- Network of LLM nodes

## AI Governor contracts

The AI Governor is a custom and extended OpenZeppelin Governor implementation that adds the notion of Proposer token and Voting token. This dual token model enable protocol token holders to delegate and make proposals and the network of LLM nodes to take the decisions.

In other words, proposer token holders can only make a proposal if they have the minimum proposal threshold.

Since the contracts are fully compatible with existing governance platforms, delegation is possible, however, delegates can only make proposals to the protocol.

On the other hand, Voting tokens are distributed among a network of nodes. These nodes are running their own models that are fine-tuned using data from all the governance discussions that exist in the history of OnChain Governance.

## Network of LLM nodes

The LLM node is responsible of answering governance proposals of any protocol that implements the AI Governor contracts.

For demo purposes this repository contains a permissioned network of 5 LLM nodes. These nodes are running large language models and capable of replying governance proposals for any protocol implementing the AI Governor contracts.
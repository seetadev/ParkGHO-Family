## L1MessagesSender

## Introduction

This is a simple contract that can send L1 block hashes, Poseidon Merkle Mountain Range (MMR) and Keccak MMR tree root hashes alongside tree sizes read from one of our aggregators contract.

The recipient is sitting on the other side on L2 (Starknet). We are using the native messaging system to communicate between those two layers.

### Build

```shell
$ forge build
```

### Deploy

```shell
$ source .env; forge script script/L1MessagesSender.s.sol:L1MessagesSenderDeployer --rpc-url $DEPLOY_RPC_URL --broadcast --verify -vvvv
```

### Test

```shell
$ forge test
```

### Format

```shell
$ forge fmt
```

### Gas Snapshots

```shell
$ forge snapshot
```

### Anvil

```shell
$ anvil
```

### Cast

```shell
$ cast <subcommand>
```

### Help

```shell
$ forge --help
$ anvil --help
$ cast --help
```

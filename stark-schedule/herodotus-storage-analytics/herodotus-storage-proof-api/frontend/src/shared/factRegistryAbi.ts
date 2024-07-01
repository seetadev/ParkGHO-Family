export const factRegistryAbi = [
  {
    "inputs": [
      {
        "internalType": "contract IHeadersProcessor",
        "name": "_headersProcessor",
        "type": "address"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [],
    "name": "IndexOutOfBounds",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "InvalidPeaksArrayLength",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "InvalidProof",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "InvalidRoot",
    "type": "error"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "address",
        "name": "account",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "blockNumber",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "nonce",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "balance",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "bytes32",
        "name": "codeHash",
        "type": "bytes32"
      },
      {
        "indexed": false,
        "internalType": "bytes32",
        "name": "storageHash",
        "type": "bytes32"
      }
    ],
    "name": "AccountProven",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "blockNumber",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "bytes32",
        "name": "rlpEncodedTxIndex",
        "type": "bytes32"
      },
      {
        "indexed": false,
        "internalType": "bytes",
        "name": "rlpEncodedTx",
        "type": "bytes"
      }
    ],
    "name": "TransactionProven",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "accountBalances",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "accountCodeHashes",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "accountNonces",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "accountStorageHashes",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "blockNumber",
        "type": "uint256"
      },
      {
        "internalType": "bytes32",
        "name": "rlpEncodedTxIndex",
        "type": "bytes32"
      },
      {
        "internalType": "uint256",
        "name": "blockProofLeafIndex",
        "type": "uint256"
      },
      {
        "internalType": "bytes32",
        "name": "blockProofLeafValue",
        "type": "bytes32"
      },
      {
        "internalType": "uint256",
        "name": "mmrTreeSize",
        "type": "uint256"
      },
      {
        "internalType": "bytes32[]",
        "name": "blockProof",
        "type": "bytes32[]"
      },
      {
        "internalType": "bytes32[]",
        "name": "mmrPeaks",
        "type": "bytes32[]"
      },
      {
        "internalType": "bytes",
        "name": "headerSerialized",
        "type": "bytes"
      },
      {
        "internalType": "bytes",
        "name": "proof",
        "type": "bytes"
      }
    ],
    "name": "checkTransactionReceipt",
    "outputs": [
      {
        "internalType": "bytes",
        "name": "receiptRlp",
        "type": "bytes"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "headersProcessor",
    "outputs": [
      {
        "internalType": "contract IHeadersProcessor",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint16",
        "name": "paramsBitmap",
        "type": "uint16"
      },
      {
        "internalType": "uint256",
        "name": "blockNumber",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "blockProofLeafIndex",
        "type": "uint256"
      },
      {
        "internalType": "bytes32",
        "name": "blockProofLeafValue",
        "type": "bytes32"
      },
      {
        "internalType": "uint256",
        "name": "mmrTreeSize",
        "type": "uint256"
      },
      {
        "internalType": "bytes32[]",
        "name": "blockProof",
        "type": "bytes32[]"
      },
      {
        "internalType": "bytes32[]",
        "name": "mmrPeaks",
        "type": "bytes32[]"
      },
      {
        "internalType": "bytes",
        "name": "headerSerialized",
        "type": "bytes"
      },
      {
        "internalType": "bytes",
        "name": "proof",
        "type": "bytes"
      }
    ],
    "name": "proveAccount",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "blockNumber",
        "type": "uint256"
      },
      {
        "internalType": "bytes32",
        "name": "slot",
        "type": "bytes32"
      },
      {
        "internalType": "bytes",
        "name": "storageProof",
        "type": "bytes"
      }
    ],
    "name": "proveStorage",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint16",
        "name": "paramsBitmap",
        "type": "uint16"
      },
      {
        "internalType": "uint256",
        "name": "blockNumber",
        "type": "uint256"
      },
      {
        "internalType": "bytes32",
        "name": "rlpEncodedTxIndex",
        "type": "bytes32"
      },
      {
        "internalType": "uint256",
        "name": "blockProofLeafIndex",
        "type": "uint256"
      },
      {
        "internalType": "bytes32",
        "name": "blockProofLeafValue",
        "type": "bytes32"
      },
      {
        "internalType": "uint256",
        "name": "mmrTreeSize",
        "type": "uint256"
      },
      {
        "internalType": "bytes32[]",
        "name": "blockProof",
        "type": "bytes32[]"
      },
      {
        "internalType": "bytes32[]",
        "name": "mmrPeaks",
        "type": "bytes32[]"
      },
      {
        "internalType": "bytes",
        "name": "headerSerialized",
        "type": "bytes"
      },
      {
        "internalType": "bytes",
        "name": "proof",
        "type": "bytes"
      }
    ],
    "name": "proveTransactionReceipt",
    "outputs": [
      {
        "internalType": "bytes",
        "name": "receiptRlp",
        "type": "bytes"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      },
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "name": "transactionStatuses",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      },
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "name": "transactionsCumulativeGasUsed",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      },
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "name": "transactionsLogs",
    "outputs": [
      {
        "internalType": "bytes",
        "name": "",
        "type": "bytes"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      },
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "name": "transactionsLogsBlooms",
    "outputs": [
      {
        "internalType": "bytes",
        "name": "",
        "type": "bytes"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
]
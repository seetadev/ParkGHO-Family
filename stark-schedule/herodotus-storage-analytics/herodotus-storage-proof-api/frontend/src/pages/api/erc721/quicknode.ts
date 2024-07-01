const quicknode_endpoint = process.env.QUICKNODE_API as string

export const getTxsInBlockInterval = async (fromBlock: number, toBlock: number, contractAddress: string, walletAddress: string) => {
  const req = await fetch(quicknode_endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      "jsonrpc": "2.0",
      "id": 0,
      "method": "eth_getLogs",
      "params": [
        {
          "fromBlock": `0x${fromBlock.toString(16)}`,
          "toBlock": `0x${toBlock.toString(16)}`,
          "address": contractAddress,
          "topics": [
            null,
            `0x000000000000000000000000${walletAddress.slice(2)}`
          ]
        }
      ]
    })
  })

  const data = await req.json()
  return data.result
}

// Getting the block number by transaction hash
export const getTxBlockNum = async (txHash: string) => {
  const req = await fetch(quicknode_endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      "id": 0,
      "method": "eth_getTransactionByHash",
      "params": [
        txHash
      ],
      "jsonrpc": "2.0"
    }),
  })

  const data: any = await req.json()
  return parseInt(data.result.blockNumber, 16)
}


// Getting the current block number to compare with the blocknumber that a ERC20 contract has deployed
export const getCurrentBlockNum = async () => {
  const req = await fetch(quicknode_endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      "method": "eth_blockNumber",
      "params": [],
      "jsonrpc": "2.0"
    }),
    redirect: 'follow'
  })


  const data: any = await req.json()
  return parseInt(data.result, 16)
}

export const ethGetProof = async (address: string, slots: string[], blockNumber: number) => {
  const req = await fetch(quicknode_endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      "method": "eth_getProof",
      "params": [
        address,
        slots,
        `0x${blockNumber.toString(16)}`
      ],
      "jsonrpc": "2.0",
      "id": 0
    })
  })

  const data: any = await req.json()
  return data.result
}

export const ethGetStorageAt = async (address: string, slot: string, blockNumber: number) => {
  const req = await fetch(quicknode_endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      "method": "eth_getStorageAt",
      "params": [
        address,
        slot,
        `0x${blockNumber.toString(16)}`
      ],
      "jsonrpc": "2.0",
      "id": 0
    })
  })

  const data: any = await req.json()
  return data.result
}

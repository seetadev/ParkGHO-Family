import { defaultWagmiConfig } from '@web3modal/wagmi/react/config'

import { cookieStorage, createStorage } from 'wagmi'
import { mainnet, sepolia,avalancheFuji, optimismSepolia, arbitrumSepolia, polygonMumbai, polygonAmoy, gnosisChiado } from 'wagmi/chains'

// Get projectId from https://cloud.walletconnect.com
export const projectId = "73bfede1812912189a63f8b354eac692";

if (!projectId) throw new Error('Project ID is not defined')

const metadata = {
  name: 'Web3Modal',
  description: 'Web3Modal Example',
  url: 'https://web3modal.com', // origin must match your domain & subdomain
  icons: ['https://avatars.githubusercontent.com/u/37784886']
}

// Create wagmiConfig
const chains = [mainnet, sepolia, avalancheFuji,optimismSepolia, arbitrumSepolia, polygonAmoy, gnosisChiado] as const
export const config = defaultWagmiConfig({
  chains,
  projectId,
  metadata,
  ssr: true,
  storage: createStorage({
    storage: cookieStorage
  }),
})
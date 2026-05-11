import { createWeb3Modal } from '@web3modal/wagmi/react';
import { defaultWagmiConfig } from '@web3modal/wagmi/react/config';
import { WagmiProvider } from 'wagmi';
import { arbitrum, avalancheFuji, mainnet, sepolia, polygonAmoy, filecoin } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || '73bfede1812912189a63f8b354eac692';

const metadata = {
  name: 'SafeRoads DApp',
  description: 'Decentralized Road Safety & Mobility Platform',
  url: 'https://saferoads.vercel.app',
  icons: ['https://avatars.githubusercontent.com/u/37784886'],
};

// Polygon Amoy is chain ID 80002; Filecoin mainnet is 314
const chains = [polygonAmoy, mainnet, filecoin, arbitrum, sepolia, avalancheFuji];

const config = defaultWagmiConfig({
  chains,
  projectId,
  metadata,
});

createWeb3Modal({
  wagmiConfig: config,
  projectId,
  enableAnalytics: true,
  enableOnramp: true,
  defaultChain: polygonAmoy,
});

export function Web3ModalProvider({ children }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}
import "@/styles/globals.css";
import "@rainbow-me/rainbowkit/styles.css";
import type { AppProps } from "next/app";
import {
  RainbowKitProvider,
  getDefaultWallets,
  connectorsForWallets,
} from "@rainbow-me/rainbowkit";
import { createClient, configureChains, WagmiConfig, goerli } from "wagmi";
import { publicProvider } from "wagmi/providers/public";
import { zkSync } from "viem/chains";

export const { chains, provider, webSocketProvider } = configureChains(
  [zkSync, goerli],
  [publicProvider()]
);

const { wallets } = getDefaultWallets({
  appName: "RainbowKit Mint NFT Demo",
  chains,
  projectId: "rainbowkit-mint-nft-demo",
});

const connectors = connectorsForWallets([...wallets]);

const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider,
  webSocketProvider,
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <WagmiConfig client={wagmiClient}>
      <RainbowKitProvider chains={chains}>
        <Component {...pageProps} />
      </RainbowKitProvider>
    </WagmiConfig>
  );
}

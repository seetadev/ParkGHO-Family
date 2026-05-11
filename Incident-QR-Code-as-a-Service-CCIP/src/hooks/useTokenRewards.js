import { useReadContract, useAccount } from 'wagmi';
import { formatEther } from 'viem';
import { CONTRACTS, TOKEN_ABI } from '../config/contracts';

export function useTokenRewards() {
  const { address } = useAccount();
  const tokenAddress = CONTRACTS.polygon.safeRoadsToken;
  const enabled = !!address && !!tokenAddress && tokenAddress !== '0x0000000000000000000000000000000000000000';

  const { data: rawBalance } = useReadContract({
    address: tokenAddress,
    abi: TOKEN_ABI,
    functionName: 'balanceOf',
    args: [address],
    query: { enabled },
  });

  const { data: symbol } = useReadContract({
    address: tokenAddress,
    abi: TOKEN_ABI,
    functionName: 'symbol',
    query: { enabled },
  });

  const balance = rawBalance ? parseFloat(formatEther(rawBalance)).toFixed(2) : '0.00';

  return { balance, symbol: symbol || 'SRT', rawBalance };
}

import { useWriteContract, useReadContract, useAccount } from 'wagmi';
import { CONTRACTS, INCIDENT_MANAGER_ABI } from '../config/contracts';

export function useIncidentContract() {
  const { address } = useAccount();
  const contractAddress = CONTRACTS.polygon.incidentManager;

  const { writeContractAsync, isPending } = useWriteContract();

  const { data: rewardBalance, refetch: refetchBalance } = useReadContract({
    address: contractAddress,
    abi: INCIDENT_MANAGER_ABI,
    functionName: 'userRewardBalance',
    args: [address],
    query: { enabled: !!address && !!contractAddress && contractAddress !== '0x0000000000000000000000000000000000000000' },
  });

  const { data: userIncidents, refetch: refetchIncidents } = useReadContract({
    address: contractAddress,
    abi: INCIDENT_MANAGER_ABI,
    functionName: 'getUserIncidents',
    args: [address],
    query: { enabled: !!address && !!contractAddress && contractAddress !== '0x0000000000000000000000000000000000000000' },
  });

  const reportIncident = async (type, ipfsCID, location, severity) => {
    const hash = await writeContractAsync({
      address: contractAddress,
      abi: INCIDENT_MANAGER_ABI,
      functionName: 'reportIncident',
      args: [type, ipfsCID, location, severity],
    });
    await refetchIncidents();
    return hash;
  };

  const claimRewards = async () => {
    const hash = await writeContractAsync({
      address: contractAddress,
      abi: INCIDENT_MANAGER_ABI,
      functionName: 'claimRewards',
    });
    await refetchBalance();
    return hash;
  };

  return {
    reportIncident,
    claimRewards,
    rewardBalance,
    userIncidents,
    isPending,
    contractAddress,
  };
}

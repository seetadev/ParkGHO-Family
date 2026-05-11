import { useAccount } from 'wagmi';
import { formatEther } from 'viem';
import { useIncidentContract } from '../../hooks/useIncidentContract';
import { useTokenRewards } from '../../hooks/useTokenRewards';

export default function TokenDashboard() {
  const { address, isConnected } = useAccount();
  const { rewardBalance, userIncidents, claimRewards, isPending } = useIncidentContract();
  const { balance: tokenBalance, symbol } = useTokenRewards();

  if (!isConnected) {
    return (
      <div className="sr-card connect-prompt">
        <p>Connect your wallet to view your rewards dashboard.</p>
      </div>
    );
  }

  const pendingRewards = rewardBalance
    ? parseFloat(formatEther(rewardBalance)).toFixed(2)
    : '0.00';

  const hasPendingRewards = rewardBalance && rewardBalance > 0n;

  return (
    <div className="sr-card token-dashboard">
      <h2>Rewards Dashboard</h2>
      <p className="sr-subtitle">Track your incident reports and SRT token rewards</p>

      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-label">Reports Submitted</span>
          <span className="stat-value">{userIncidents?.length ?? 0}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Pending Rewards</span>
          <span className="stat-value">{pendingRewards} {symbol}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Token Balance</span>
          <span className="stat-value">{tokenBalance} {symbol}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Wallet</span>
          <span className="stat-value mono">{address?.slice(0, 6)}...{address?.slice(-4)}</span>
        </div>
      </div>

      {hasPendingRewards && (
        <button
          className="sr-btn-primary"
          onClick={claimRewards}
          disabled={isPending}
        >
          {isPending ? 'Claiming...' : `Claim ${pendingRewards} ${symbol}`}
        </button>
      )}

      <div className="incidents-list-section">
        <h3>My Incident Reports</h3>
        {!userIncidents || userIncidents.length === 0 ? (
          <p className="sr-hint">No reports yet. Head to Report Incident to submit your first!</p>
        ) : (
          <div className="incidents-list">
            {userIncidents.map((id) => (
              <div key={id.toString()} className="incident-list-item">
                <span className="incident-id">Report #{id.toString()}</span>
                <a
                  href={`https://amoy.polygonscan.com`}
                  target="_blank"
                  rel="noreferrer"
                  className="incident-link"
                >
                  View &rarr;
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

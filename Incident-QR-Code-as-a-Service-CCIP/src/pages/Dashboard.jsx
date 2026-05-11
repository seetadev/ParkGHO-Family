import TokenDashboard from '../components/TokenDashboard/TokenDashboard';

export default function Dashboard() {
  return (
    <div className="page-layout">
      <div className="page-header">
        <h1>My Dashboard</h1>
        <p className="sr-subtitle">
          Track your incident reports, pending SRT token rewards, and claim your earnings.
        </p>
      </div>
      <TokenDashboard />
    </div>
  );
}

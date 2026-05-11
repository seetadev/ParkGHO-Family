import IncidentReport from '../components/IncidentReport/IncidentReport';
import IncidentDashboard from '../components/IncidentDashboard';

export default function Report() {
  return (
    <div className="page-layout">
      <div className="page-header">
        <h1>Incident Reporting</h1>
        <p className="sr-subtitle">
          Submit road incidents to the blockchain and earn SRT token rewards.
          Reports are stored on IPFS and verified by the community.
        </p>
      </div>
      <div className="two-col-layout">
        <IncidentReport />
        <IncidentDashboard />
      </div>
    </div>
  );
}

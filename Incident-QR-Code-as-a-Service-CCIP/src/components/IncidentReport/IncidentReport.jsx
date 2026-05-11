import { useState } from 'react';
import { useAccount } from 'wagmi';
import { useIPFS } from '../../hooks/useIPFS';
import { useIncidentContract } from '../../hooks/useIncidentContract';

const INCIDENT_TYPES = [
  { value: 'pothole', label: 'Pothole' },
  { value: 'accident', label: 'Accident' },
  { value: 'parking_violation', label: 'Parking Violation' },
  { value: 'road_damage', label: 'Road Damage' },
  { value: 'flooding', label: 'Road Flooding' },
  { value: 'debris', label: 'Road Debris' },
];

const SEVERITY_LABELS = { 1: 'Low', 2: 'Medium', 3: 'High' };

export default function IncidentReport() {
  const { address, isConnected } = useAccount();
  const { uploadToIPFS, uploading } = useIPFS();
  const { reportIncident, isPending } = useIncidentContract();

  const [form, setForm] = useState({ type: '', description: '', location: '', severity: 1 });
  const [status, setStatus] = useState(null);
  const [txHash, setTxHash] = useState(null);

  const handleGetLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((pos) => {
      setForm((f) => ({
        ...f,
        location: `${pos.coords.latitude.toFixed(6)},${pos.coords.longitude.toFixed(6)}`,
      }));
    });
  };

  const handleSubmit = async () => {
    if (!form.type || !form.description || !form.location) {
      alert('Please fill in all required fields.');
      return;
    }

    try {
      setStatus('uploading');
      const cid = await uploadToIPFS({
        type: form.type,
        description: form.description,
        location: form.location,
        severity: form.severity,
        reporter: address,
        timestamp: new Date().toISOString(),
      });

      setStatus('submitting');
      const hash = await reportIncident(form.type, cid, form.location, form.severity);
      setTxHash(hash);
      setStatus('success');
      setForm({ type: '', description: '', location: '', severity: 1 });
    } catch (err) {
      console.error(err);
      setStatus('error');
    }
  };

  const busy = status === 'uploading' || status === 'submitting' || isPending;

  if (!isConnected) {
    return (
      <div className="sr-card connect-prompt">
        <p>Connect your wallet to report incidents and earn SRT rewards.</p>
      </div>
    );
  }

  return (
    <div className="sr-card incident-form">
      <h2>Report a Road Incident</h2>
      <p className="sr-subtitle">Earn SRT tokens for every verified report</p>

      <div className="sr-form-group">
        <label>Incident Type *</label>
        <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
          <option value="">Select type...</option>
          {INCIDENT_TYPES.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </div>

      <div className="sr-form-group">
        <label>Description *</label>
        <textarea
          rows={4}
          placeholder="Describe the incident in detail..."
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
      </div>

      <div className="sr-form-group">
        <label>Location *</label>
        <div className="location-row">
          <input
            placeholder="lat,lng or address"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
          />
          <button className="sr-btn-secondary" onClick={handleGetLocation}>
            Use GPS
          </button>
        </div>
      </div>

      <div className="sr-form-group">
        <label>Severity: {SEVERITY_LABELS[form.severity]}</label>
        <input
          type="range" min={1} max={3} step={1}
          value={form.severity}
          onChange={(e) => setForm({ ...form, severity: Number(e.target.value) })}
          className="sr-range"
        />
        <div className="severity-labels">
          <span>Low</span><span>Medium</span><span>High</span>
        </div>
      </div>

      <button className="sr-btn-primary" onClick={handleSubmit} disabled={busy}>
        {status === 'uploading' && 'Uploading to IPFS...'}
        {status === 'submitting' && 'Submitting to blockchain...'}
        {!busy && 'Submit Report & Earn Rewards'}
      </button>

      {status === 'success' && (
        <div className="sr-success-box">
          <p>Incident reported successfully!</p>
          <a
            href={`https://amoy.polygonscan.com/tx/${txHash}`}
            target="_blank"
            rel="noreferrer"
          >
            View on Polygonscan &rarr;
          </a>
        </div>
      )}
      {status === 'error' && (
        <div className="sr-error-box">Transaction failed. Please try again.</div>
      )}
    </div>
  );
}

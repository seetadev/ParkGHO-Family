import { Link } from 'react-router-dom';

const FEATURES = [
  {
    icon: '📍',
    title: 'Report Incidents',
    desc: 'Report road hazards, potholes, and accidents. Earn SRT token rewards for every verified report.',
    to: '/report',
    cta: 'Report Now',
  },
  {
    icon: '📲',
    title: 'QR Payments',
    desc: 'Generate multi-chain QR codes to accept payments at parking lots and service stations.',
    to: '/pay',
    cta: 'Generate QR',
  },
  {
    icon: '🗺️',
    title: 'Service Map',
    desc: 'Find nearby vehicle repair shops and service providers in real time.',
    to: '/map',
    cta: 'View Map',
  },
  {
    icon: '🏆',
    title: 'Rewards Dashboard',
    desc: 'Track your reports, pending rewards, and claim your SRT tokens.',
    to: '/dashboard',
    cta: 'My Dashboard',
  },
];

const CHAINS = ['Polygon Amoy', 'Filecoin', 'Ethereum', 'Arbitrum', 'Chainlink CCIP'];

export default function Home() {
  return (
    <div className="home-page">
      {/* Hero */}
      <section className="hero-section">
        <h1 className="hero-title">
          Decentralized Road Safety<br />
          <span className="hero-highlight">Powered by Web3</span>
        </h1>
        <p className="hero-desc">
          Report incidents, earn rewards, and access hyperlocal vehicle services —
          all secured by blockchain across 11 Delhi university campuses.
        </p>
        <div className="hero-actions">
          <Link to="/report" className="sr-btn-primary">Start Reporting</Link>
          <Link to="/map" className="sr-btn-secondary">Find Services</Link>
        </div>
        <div className="chain-badges">
          {CHAINS.map((c) => (
            <span key={c} className="chain-badge">{c}</span>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section className="features-grid">
        {FEATURES.map((f) => (
          <div key={f.to} className="feature-card">
            <div className="feature-icon">{f.icon}</div>
            <h3>{f.title}</h3>
            <p>{f.desc}</p>
            <Link to={f.to} className="sr-btn-secondary feature-cta">{f.cta}</Link>
          </div>
        ))}
      </section>

      {/* Pilot Info */}
      <section className="pilot-section">
        <h2>Delhi University Pilot</h2>
        <p>
          Launching across <strong>11 Delhi campuses</strong> starting with NSUT under the
          D.T.T.E. initiative. Join us in building safer roads through decentralized
          citizen participation.
        </p>
        <a
          href="https://ethercalc.net/veg1fcob7fe3"
          target="_blank"
          rel="noreferrer"
          className="sr-btn-secondary"
        >
          View Service Registry
        </a>
      </section>
    </div>
  );
}

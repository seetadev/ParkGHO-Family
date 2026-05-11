import { useWeb3Modal } from '@web3modal/wagmi/react';
import { useAccount } from 'wagmi';
import { Link, useLocation } from 'react-router-dom';

const NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/report', label: 'Report Incident' },
  { to: '/pay', label: 'QR Pay' },
  { to: '/map', label: 'Service Map' },
  { to: '/dashboard', label: 'Dashboard' },
];

export default function Navbar() {
  const { open } = useWeb3Modal();
  const { address, isConnected } = useAccount();
  const { pathname } = useLocation();

  const shortAddress = address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : null;

  return (
    <nav className="saferoads-navbar">
      <div className="navbar-brand">
        <span className="brand-icon">🚦</span>
        <span className="brand-name">SafeRoads</span>
      </div>

      <div className="navbar-links">
        {NAV_LINKS.map(({ to, label }) => (
          <Link
            key={to}
            to={to}
            className={`nav-link${pathname === to ? ' active' : ''}`}
          >
            {label}
          </Link>
        ))}
      </div>

      <button
        className="wallet-btn"
        onClick={() => open(isConnected ? { view: 'Account' } : {})}
      >
        {isConnected ? shortAddress : 'Connect Wallet'}
      </button>
    </nav>
  );
}

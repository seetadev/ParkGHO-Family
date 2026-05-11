export default function Footer() {
  return (
    <footer className="saferoads-footer">
      <div className="footer-content">
        <div className="footer-brand">
          <span>🚦 SafeRoads DApp</span>
          <p>Decentralized road safety powered by Polygon, Filecoin & Chainlink CCIP</p>
        </div>
        <div className="footer-links">
          <a href="https://ethercalc.net/veg1fcob7fe3" target="_blank" rel="noreferrer">
            EtherCalc Registry
          </a>
          <a href="https://amoy.polygonscan.com" target="_blank" rel="noreferrer">
            Polygon Amoy Explorer
          </a>
          <a href="https://calibration.filfox.info" target="_blank" rel="noreferrer">
            Filecoin Calibration
          </a>
        </div>
      </div>
      <p className="footer-copy">© 2026 SafeRoads · C4GT · NSUT · Built on Web3</p>
    </footer>
  );
}

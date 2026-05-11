export default function EtherCalcView() {
  return (
    <div className="sr-card ethercalc-card">
      <h2>Vehicle Service Provider Registry</h2>
      <p className="sr-subtitle">
        Live registry powered by EtherCalc &amp; Filecoin decentralized storage
      </p>
      <iframe
        src="https://ethercalc.net/veg1fcob7fe3"
        width="100%"
        height="520"
        style={{ border: 'none', borderRadius: '12px' }}
        title="SafeRoads Service Provider Registry"
        loading="lazy"
      />
      <p className="sr-hint">
        Contribute to the registry by editing the EtherCalc sheet — all data is
        persisted to Filecoin for permanent, decentralized access.
      </p>
    </div>
  );
}

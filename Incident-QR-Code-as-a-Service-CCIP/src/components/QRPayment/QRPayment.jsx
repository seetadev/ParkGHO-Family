import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useAccount } from 'wagmi';

const SUPPORTED_CHAINS = [
  { id: 'polygon', label: 'Polygon (MATIC)', prefix: 'polygon:' },
  { id: 'ethereum', label: 'Ethereum (ETH)', prefix: 'ethereum:' },
  { id: 'filecoin', label: 'Filecoin (FIL)', prefix: 'fil:' },
];

export default function QRPayment() {
  const { address, isConnected } = useAccount();
  const [amount, setAmount] = useState('');
  const [chain, setChain] = useState('polygon');
  const [memo, setMemo] = useState('');
  const [copied, setCopied] = useState(false);

  const selectedChain = SUPPORTED_CHAINS.find((c) => c.id === chain);
  const qrValue = address
    ? amount
      ? `${selectedChain.prefix}${address}?value=${amount}&memo=${encodeURIComponent(memo)}`
      : `${selectedChain.prefix}${address}`
    : '';

  const copyLink = () => {
    navigator.clipboard.writeText(qrValue);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="sr-card qr-payment">
      <h2>QR Code Payment</h2>
      <p className="sr-subtitle">Accept payments at parking &amp; service locations</p>

      <div className="sr-form-group">
        <label>Blockchain</label>
        <select value={chain} onChange={(e) => setChain(e.target.value)}>
          {SUPPORTED_CHAINS.map((c) => (
            <option key={c.id} value={c.id}>{c.label}</option>
          ))}
        </select>
      </div>

      <div className="sr-form-group">
        <label>Amount (optional)</label>
        <input
          type="number"
          placeholder="0.00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </div>

      <div className="sr-form-group">
        <label>Memo / Service (optional)</label>
        <input
          placeholder="e.g. Parking Slot A-12"
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
        />
      </div>

      {isConnected && address ? (
        <div className="qr-display">
          <QRCodeSVG value={qrValue} size={220} level="H" includeMargin />
          <p className="qr-address">{address.slice(0, 6)}...{address.slice(-4)}</p>
          {amount && (
            <p className="qr-amount">{amount} {chain.toUpperCase()}</p>
          )}
          {memo && <p className="qr-memo">{memo}</p>}
        </div>
      ) : (
        <div className="sr-card connect-prompt">
          <p>Connect your wallet to generate a payment QR code.</p>
        </div>
      )}

      {isConnected && (
        <button className="sr-btn-secondary" onClick={copyLink}>
          {copied ? 'Copied!' : 'Copy Payment Link'}
        </button>
      )}
    </div>
  );
}

import QRPayment from '../components/QRPayment/QRPayment';
import EtherCalcView from '../components/EtherCalc/EtherCalcView';

export default function Pay() {
  return (
    <div className="page-layout">
      <div className="page-header">
        <h1>QR Code Payments</h1>
        <p className="sr-subtitle">
          Accept multi-chain crypto payments at parking locations and service stations
          using ConnectKit-compatible QR codes.
        </p>
      </div>
      <div className="two-col-layout">
        <QRPayment />
        <EtherCalcView />
      </div>
    </div>
  );
}

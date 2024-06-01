import React from 'react'
import IncidentReporter from './components/QR-Code-Dapp/incident-reporter';
import ConnectButton from './components/QR-Code-Dapp/Wallet-Connet';

const IncidentReportPage = () => {
  return (
    <div className='w-full mt-7'>
      <ConnectButton/>
      <IncidentReporter/>
    </div>
  )
}

export default IncidentReportPage;
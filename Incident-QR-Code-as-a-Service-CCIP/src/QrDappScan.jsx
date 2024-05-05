import React, { useState } from 'react'
import ConnectButton from './components/QR-Code-Dapp/Wallet-Connet'
import QrReader from './components/QR-Code-Dapp/QrReader'
const QrDappScan = () => {
  const [showComponent, setShowComponent] = useState(false)

  const toggleComponent = () => {
    setShowComponent(!showComponent)
  }

  return (
    <div className='w-full p-5'>
      <ConnectButton />
      <button
        onClick={toggleComponent}
        className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'
      >
        {showComponent ? 'Close' : 'Scan QR to Report Incident'}
      </button>
      {showComponent && <QrReader/>}
    </div>
  )
}



export default QrDappScan
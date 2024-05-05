import { useWeb3Modal } from '@web3modal/wagmi/react'
import { useAccount } from 'wagmi'

export default function ConnectButton() {
  const { open } = useWeb3Modal()
  const { address, isDisconnected } = useAccount()

  function showAddress(str) {
    if (str.length <= 7) {
      return str; 
    } else {
      const start = str.substring(0, 4);
      const end = str.substring(str.length - 4);
      return `${start}...${end}`;
    }
  }

  return (
    <div className="flex justify-between ">
      <div>
        <p className='font-extrabold text-3xl'>Qr-Dapp</p>
      </div>
      {
        isDisconnected ? (
          <button
            className="bg-orange-500 text-black font-bold py-2 px-4 rounded-md "
            onClick={() => open()}
          >
            Connet Wallet
          </button>
        ) : (
          <button
            className="bg-orange-500 text-black font-bold py-2 px-4 rounded-md "
            onClick={() => open({ view: 'Account' })}
          >
            {showAddress(address)}
          </button>
        )
      }
    </div>
  )
}
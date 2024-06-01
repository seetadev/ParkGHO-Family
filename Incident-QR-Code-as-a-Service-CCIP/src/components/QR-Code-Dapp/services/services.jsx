import { useReadContract } from 'wagmi'
import USDTAbi from './abi.json'

import  USDTAddress from './address.json'



function Contract() {
    console.log(USDTAbi, USDTAddress);
    const { data, error } = useReadContract({
      abi: USDTAbi,
      address: USDTAddress.address,
      functionName: 'name',
      
    });
  
    if (error) {
      console.error('Error fetching totalSupply:', error);
      return <div>Error fetching totalSupply</div>;
    }
  
    const totalSupply = data ? data.toString() : 'Fetching total supply...';
  
    return (
      <div>
        <p>Total Supply: {totalSupply}</p>
      </div>
    );
  }
  
  export default Contract;
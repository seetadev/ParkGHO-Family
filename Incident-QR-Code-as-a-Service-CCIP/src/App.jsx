
import { Route, Routes } from 'react-router-dom'
import "./App.css";
import IncidentAnalyzer from './IncidentAnalyzer';
import QrDapp from './QrDapp';

const App = () => {
  return (
    <main>
      <div className='main'>
        <div className='gradient' />
      </div>

      <div className='app'>
        <Routes>
          <Route path='/' Component={IncidentAnalyzer}></Route>
          <Route path='/qr-dapp' Component={QrDapp}></Route>
        </Routes>
       
      </div>
    </main>
  );
};

export default App;
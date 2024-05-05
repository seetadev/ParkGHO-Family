
import { Route, Routes } from 'react-router-dom'
import "./App.css";
import IncidentAnalyzer from '../IncidentAnalyzer';

const App = () => {
  return (
    <main>
      <div className='main'>
        <div className='gradient' />
      </div>

      <div className='app'>
        <Routes>
          <Route path='/' Component={IncidentAnalyzer}></Route>
        </Routes>
       
      </div>
    </main>
  );
};

export default App;
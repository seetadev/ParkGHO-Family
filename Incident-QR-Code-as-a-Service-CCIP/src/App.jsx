import { Route, Routes } from 'react-router-dom';
import './App.css';
import './styles/saferoads.css';
import Navbar from './components/Layout/Navbar';
import Footer from './components/Layout/Footer';

// SafeRoads pages
import Home from './pages/Home';
import Report from './pages/Report';
import Pay from './pages/Pay';
import MapPage from './pages/Map';
import Dashboard from './pages/Dashboard';

// Legacy routes preserved
import IncidentAnalyzer from './IncidentAnalyzer';
import QrDapp from './QrDappScan';
import IncidentReportPage from './IncidentReport';

const App = () => {
  return (
    <div className="saferoads-app">
      <Navbar />
      <main className="saferoads-main">
        <div className="main">
          <div className="gradient" />
        </div>
        <div className="app">
          <Routes>
            {/* SafeRoads routes */}
            <Route path="/" element={<Home />} />
            <Route path="/report" element={<Report />} />
            <Route path="/pay" element={<Pay />} />
            <Route path="/map" element={<MapPage />} />
            <Route path="/dashboard" element={<Dashboard />} />

            {/* Legacy routes */}
            <Route path="/analyze" Component={IncidentAnalyzer} />
            <Route path="/qr-dapp" Component={QrDapp} />
            <Route path="/incident-reporter" Component={IncidentReportPage} />
          </Routes>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default App;
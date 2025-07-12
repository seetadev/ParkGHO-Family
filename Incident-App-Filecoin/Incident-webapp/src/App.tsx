import IncidentForm from './components/IncidentForm';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-blue-100">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <h1 className="text-2xl font-semibold text-blue-900">
            Incident Management System - Filecoin + Storacha
          </h1>
          <p className="text-blue-600 text-sm mt-1">
            Report and track incidents efficiently
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-blue-100 p-6">
          <IncidentForm />
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-12 py-6 text-center text-blue-500 text-sm">
        <div className="max-w-4xl mx-auto px-6">
          © 2025 Incident Management System
        </div>
      </footer>
    </div>
  );
}

export default App;
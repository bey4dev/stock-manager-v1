import { useState, useEffect } from 'react';
import { AppProvider, useApp } from './contexts/AppContext';

// Components
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Products from './components/Products';
import Sales from './components/Sales';
import Purchases from './components/Purchases';
import Contacts from './components/Contacts';
import Debts from './components/Debts';
import Settings from './components/Settings';
import Authentication from './components/Authentication';

function AppContent() {
  const { state } = useApp();
  const { isAuthenticated, user } = state;
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [isAppReady, setIsAppReady] = useState(false);

  // Give app time to initialize
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAppReady(true);
    }, 200); // Small delay to let everything initialize
    
    return () => clearTimeout(timer);
  }, []);

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'products':
        return <Products />;
      case 'sales':
        return <Sales />;
      case 'purchases':
        return <Purchases />;
      case 'contacts':
        return <Contacts />;
      case 'debts':
        return <Debts />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  // Show loading while app is initializing
  if (!isAppReady) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Stock Manager...</p>
        </div>
      </div>
    );
  }

  // Show authentication page if not authenticated
  if (!isAuthenticated || !user) {
    return <Authentication />;
  }

  return (
    <Layout currentPage={currentPage} onNavigate={setCurrentPage}>
      {renderPage()}
    </Layout>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;

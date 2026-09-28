import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { AssetsPage } from './pages/AssetsPage';
import { AssetDetailPage } from './pages/AssetDetailPage';
import { MapPage } from './pages/MapPage';
import { InspectionsPage } from './pages/InspectionsPage';
import { TasksPage } from './pages/TasksPage';
import { ComplaintsPage } from './pages/ComplaintsPage';
import { ReportsPage } from './pages/ReportsPage';
import { UserManagementPage } from './pages/UserManagementPage';

function AppContent() {
  const { user, loading } = useAuth();
  const isCitizen = user?.role === 'citizen';
  const [currentTab, setCurrentTab] = useState(user?.role === 'citizen' ? 'complaints' : 'dashboard');
  const [selectedAsset, setSelectedAsset] = useState(null);

  // Strictly lock citizen to complaints view
  React.useEffect(() => {
    if (isCitizen && currentTab !== 'complaints') {
      setCurrentTab('complaints');
    }
  }, [isCitizen, currentTab]);

  // Loading spinner while verifying authentication
  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-main)'
      }}>
        <div style={{
          width: '36px',
          height: '36px',
          border: '3px solid rgba(2, 132, 199, 0.2)',
          borderTop: '3px solid #0284c7',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
          marginBottom: '12px'
        }} />
        <div style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>
          Loading Gujarat R&amp;B Portal...
        </div>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // Strict Login Landing Page: Unauthenticated users ONLY see LoginPage
  if (!user) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-main)' }}>
        <LoginPage onLoginSuccess={(loggedInUser) => {
          if (loggedInUser?.role === 'citizen') {
            setCurrentTab('complaints');
          } else {
            setCurrentTab('dashboard');
          }
        }} />
      </div>
    );
  }

  const handleSelectAsset = (asset) => {
    if (isCitizen) return;
    setSelectedAsset(asset);
    setCurrentTab('asset-detail');
  };

  const renderContent = () => {
    // Citizen role strictly has access to File & Track Grievance only
    if (isCitizen) {
      return <ComplaintsPage />;
    }

    switch (currentTab) {
      case 'dashboard':
        return (
          <DashboardPage
            onNavigate={(tab) => setCurrentTab(tab)}
            onSelectAsset={handleSelectAsset}
          />
        );

      case 'assets':
        return <AssetsPage onSelectAsset={handleSelectAsset} />;

      case 'asset-detail':
        return (
          <AssetDetailPage
            asset={selectedAsset}
            onBack={() => setCurrentTab('assets')}
          />
        );

      case 'map':
        return <MapPage onSelectAsset={handleSelectAsset} />;

      case 'inspections':
        return <InspectionsPage />;

      case 'tasks':
        return <TasksPage />;

      case 'complaints':
        return <ComplaintsPage />;

      case 'reports':
        return <ReportsPage />;

      case 'users':
        return <UserManagementPage />;

      case 'login':
        return <LoginPage onLoginSuccess={() => setCurrentTab('dashboard')} />;

      default:
        return (
          <DashboardPage
            onNavigate={(tab) => setCurrentTab(tab)}
            onSelectAsset={handleSelectAsset}
          />
        );
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar currentTab={currentTab} onSelectTab={setCurrentTab} />

      <div style={{ display: 'flex', flex: 1 }}>
        <Sidebar
          currentTab={currentTab}
          onSelectTab={(tab) => {
            if (tab === 'assets') setSelectedAsset(null);
            setCurrentTab(tab);
          }}
        />

        <main style={{ flex: 1, overflowY: 'auto', background: 'transparent' }}>
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

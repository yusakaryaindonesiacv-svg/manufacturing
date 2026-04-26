/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppProvider, useApp } from './AppContext';
import LoginPage from './components/auth/LoginPage';
import Sidebar from './components/layout/Sidebar';
import Navbar from './components/layout/Navbar';
import Dashboard from './pages/Dashboard';
import MaterialsPage from './pages/MaterialsPage';
import PackagingPage from './pages/PackagingPage';
import ProductsPage from './pages/ProductsPage';
import FormulaPage from './pages/FormulaPage';
import ProductionPage from './pages/ProductionPage';
import PurchasePage from './pages/PurchasePage';
import SuppliersPage from './pages/SuppliersPage';
import ReportsPage from './pages/ReportsPage';
import SettingsPage from './pages/SettingsPage';
import UsersPage from './pages/UsersPage';
import { AnimatePresence, motion } from 'motion/react';
import InstallPWA from './components/common/InstallPWA';
import { useRegisterSW } from 'virtual:pwa-register/react';

function AppContent() {
  const { user } = useApp();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // PWA registration with auto-update
  useRegisterSW({
    onRegistered(r) {
      console.log('SW Registered: ' + r);
    },
    onRegisterError(error) {
      console.log('SW registration error', error);
    },
  });

  if (!user) {
    return (
      <>
        <LoginPage />
        <InstallPWA />
      </>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard />;
      case 'materials': return <MaterialsPage />;
      case 'packaging': return <PackagingPage />;
      case 'products': return <ProductsPage />;
      case 'formula': return <FormulaPage />;
      case 'production': return <ProductionPage />;
      case 'purchase': return <PurchasePage />;
      case 'suppliers': return <SuppliersPage />;
      case 'reports': return <ReportsPage />;
      case 'users': return <UsersPage />;
      case 'settings': return <SettingsPage />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-bg-deep overflow-hidden">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar 
          activeTab={activeTab} 
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="max-w-7xl mx-auto w-full"
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
      <InstallPWA />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}


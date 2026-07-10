import React, { useState, useEffect } from 'react';
import { ShopProvider } from './context/ShopContext';
import Sidebar from './components/Sidebar';
import DashboardView from './components/DashboardView';
import SalesRegistryView from './components/SalesRegistryView';
import InventoryView from './components/InventoryView';
import OrdersHistoryView from './components/OrdersHistoryView';
import ExpensesView from './components/ExpensesView';
import ReportsView from './components/ReportsView';
import ProfitLossView from './components/ProfitLossView';
import DistributorsView from './components/DistributorsView';
import SettingsView from './components/SettingsView';

function AppContent() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [darkMode, setDarkMode] = useState(true);

  // Sync dark class on body for custom bg styling
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode-active');
    } else {
      document.body.classList.remove('dark-mode-active');
    }
  }, [darkMode]);

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView setActiveTab={setActiveTab} />;
      case 'sales':
        return <SalesRegistryView />;
      case 'inventory':
        return <InventoryView />;
      case 'orders':
        return <OrdersHistoryView />;
      case 'expenses':
        return <ExpensesView />;
      case 'reports':
        return <ReportsView />;
      case 'pl':
        return <ProfitLossView />;
      case 'distributors':
        return <DistributorsView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className={`min-h-screen flex ${darkMode ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-800'} transition-colors duration-250`}>
      {/* Sidebar Navigation */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        darkMode={darkMode} 
        setDarkMode={setDarkMode} 
      />

      {/* Main Content Area */}
      <main className="flex-1 ml-64 p-8 overflow-y-auto min-h-screen bg-slate-50/50 dark:bg-slate-900/50 transition-colors duration-250">
        <div className="max-w-6xl mx-auto animate-fade-in">
          {renderActiveView()}
        </div>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <ShopProvider>
      <AppContent />
    </ShopProvider>
  );
}

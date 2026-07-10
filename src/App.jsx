import React, { useState, useEffect } from 'react';
import { ShopProvider, useShop } from './context/ShopContext';
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
import { Menu } from 'lucide-react';

function AppContent() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [darkMode, setDarkMode] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { shopDetails } = useShop();

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
    <div className={`min-h-screen flex flex-col md:flex-row ${darkMode ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-800'} transition-colors duration-250`}>
      {/* Sidebar Navigation */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        darkMode={darkMode} 
        setDarkMode={setDarkMode}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />

      {/* Main Content Wrap */}
      <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
        {/* Mobile top header bar */}
        <header className="md:hidden bg-slate-900 text-white p-4 flex items-center justify-between sticky top-0 z-20 border-b border-slate-850 shadow-md">
          <div className="flex items-center space-x-3.5">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-1 hover:bg-slate-800 rounded-lg text-slate-350 hover:text-white transition-colors cursor-pointer"
            >
              <Menu className="w-6 h-6" />
            </button>
            <span className="font-bold tracking-tight text-sm bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
              {shopDetails?.name || 'Gokulam Agency'}
            </span>
          </div>
          <span className="text-[10px] uppercase font-bold text-violet-400 bg-violet-500/10 px-2.5 py-1 rounded-full">
            Admin
          </span>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-8 overflow-y-auto bg-slate-50/50 dark:bg-slate-900/50 transition-colors duration-250 md:ml-64">
          <div className="max-w-6xl mx-auto animate-fade-in">
            {renderActiveView()}
          </div>
        </main>
      </div>
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

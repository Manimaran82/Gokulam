import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  History, 
  Receipt, 
  BarChart3, 
  TrendingUp, 
  AlertTriangle,
  Moon,
  Sun,
  Truck,
  Settings
} from 'lucide-react';
import { useShop } from '../context/ShopContext';

export default function Sidebar({ activeTab, setActiveTab, darkMode, setDarkMode }) {
  const { products, shopDetails } = useShop();

  // Calculate low stock alert count
  const lowStockCount = products.filter(p => p.stock <= p.minStock).length;

  const navItems = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { id: 'sales', name: 'Billing & POS', icon: ShoppingCart },
    { id: 'inventory', name: 'Inventory / Stock', icon: Package, badge: lowStockCount > 0 ? lowStockCount : null },
    { id: 'orders', name: 'Orders / History', icon: History },
    { id: 'expenses', name: 'Expenses', icon: Receipt },
    { id: 'reports', name: 'Reports', icon: BarChart3 },
    { id: 'pl', name: 'Profit & Loss', icon: TrendingUp },
    { id: 'distributors', name: 'Distributors', icon: Truck },
    { id: 'settings', name: 'Settings', icon: Settings },
  ];

  // Dynamically compute initials
  const initials = shopDetails?.name
    ? shopDetails.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : 'GA';

  return (
    <aside className="w-64 bg-slate-900 text-white flex flex-col h-screen fixed left-0 top-0 border-r border-slate-800 shadow-2xl z-30 transition-transform duration-300">
      {/* Brand logo */}
      <div className="p-6 border-b border-slate-800 flex items-center space-x-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-400 flex items-center justify-center font-bold text-lg text-white shadow-lg shadow-violet-500/30">
          {initials}
        </div>
        <div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent leading-none">
            {shopDetails?.name || 'Gokulam Agency'}
          </h1>
          <span className="text-xs text-slate-404">Shop Management</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group relative ${
                isActive 
                  ? 'bg-violet-600/90 text-white shadow-lg shadow-violet-600/20' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Icon className={`w-5 h-5 mr-3 transition-transform duration-200 group-hover:scale-105 ${
                isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'
              }`} />
              <span>{item.name}</span>
              
              {/* Badge for Alerts (e.g. low stock) */}
              {item.badge && (
                <span className="ml-auto bg-amber-500 text-slate-950 font-bold text-xs px-2 py-0.5 rounded-full flex items-center space-x-1 animate-pulse">
                  <AlertTriangle className="w-3 h-3" />
                  <span>{item.badge}</span>
                </span>
              )}

              {/* Hover indicator bar */}
              {isActive && (
                <div className="absolute left-0 top-3 bottom-3 w-1 bg-white rounded-r-md" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom controls / Theme toggler */}
      <div className="p-4 border-t border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-semibold">
            M
          </div>
          <div className="leading-tight">
            <p className="text-sm font-medium text-slate-200">Manager</p>
            <p className="text-xs text-slate-500">Active Session</p>
          </div>
        </div>

        <button
          onClick={() => setDarkMode(!darkMode)}
          className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors duration-200"
          title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-violet-400" />}
        </button>
      </div>
    </aside>
  );
}

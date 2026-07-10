import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { 
  DollarSign, 
  TrendingUp, 
  ShoppingCart, 
  Package, 
  ArrowRight,
  TrendingDown,
  Calendar
} from 'lucide-react';

export default function DashboardView({ setActiveTab }) {
  const { sales, products, expenses } = useShop();
  const [hoveredPoint, setHoveredPoint] = useState(null);

  // 1. Calculations for KPIs
  const activeSales = sales.filter(s => s.status === 'Completed');
  const totalRevenue = activeSales.reduce((sum, s) => sum + s.total, 0);
  const totalCOGS = activeSales.reduce((sum, s) => sum + s.totalCost, 0);
  const grossProfit = totalRevenue - totalCOGS;
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const netProfit = grossProfit - totalExpenses;

  const lowStockProducts = products.filter(p => p.stock <= p.minStock);
  const completedOrdersCount = activeSales.length;

  // Let's calculate dynamic stats for *this month* (July 2026) vs *previous month* (June 2026)
  // Current month: July 2026
  const getMonthStats = (year, monthIndex) => {
    const monthlySales = activeSales.filter(s => {
      const d = new Date(s.date);
      return d.getFullYear() === year && d.getMonth() === monthIndex;
    });
    const monthlyExp = expenses.filter(e => {
      const d = new Date(e.date);
      return d.getFullYear() === year && d.getMonth() === monthIndex;
    });

    const rev = monthlySales.reduce((sum, s) => sum + s.total, 0);
    const cogs = monthlySales.reduce((sum, s) => sum + s.totalCost, 0);
    const exp = monthlyExp.reduce((sum, e) => sum + e.amount, 0);
    const prof = (rev - cogs) - exp;

    return { rev, prof, count: monthlySales.length };
  };

  const julyStats = getMonthStats(2026, 6); // 0-indexed: July is 6
  const juneStats = getMonthStats(2026, 5); // June is 5

  // Percentage changes
  const revenueGrowth = juneStats.rev > 0 ? ((julyStats.rev - juneStats.rev) / juneStats.rev) * 100 : 0;
  const profitGrowth = juneStats.prof > 0 ? ((julyStats.prof - juneStats.prof) / juneStats.prof) * 100 : 0;

  // 2. Prepare Data for July Daily Revenue Custom SVG Chart
  // We plot days 1 to 10 of July 2026
  const chartDays = Array.from({ length: 10 }, (_, i) => i + 1);
  const chartData = chartDays.map(day => {
    const daySales = activeSales.filter(s => {
      const d = new Date(s.date);
      return d.getFullYear() === 2026 && d.getMonth() === 6 && d.getDate() === day;
    });
    const total = daySales.reduce((sum, s) => sum + s.total, 0);
    return { day: `Jul ${day}`, total: parseFloat(total.toFixed(2)) };
  });

  // SVG Chart Dimensions & Computations
  const width = 600;
  const height = 220;
  const padding = 40;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  const maxVal = Math.max(...chartData.map(d => d.total), 100) * 1.15; // padding top

  // Generate points
  const points = chartData.map((d, index) => {
    const x = padding + (index / (chartData.length - 1)) * chartWidth;
    const y = height - padding - (d.total / maxVal) * chartHeight;
    return { x, y, data: d };
  });

  // Generate line path
  const linePath = points.length > 0 
    ? points.reduce((path, p, i) => i === 0 ? `M ${p.x} ${p.y}` : `${path} L ${p.x} ${p.y}`, '')
    : '';

  // Generate closed area path for fill gradient
  const areaPath = points.length > 0
    ? `${linePath} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`
    : '';

  return (
    <div className="space-y-6">
      {/* Welcome header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Welcome back, Manager</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Here's what's happening at your store today.</p>
        </div>
        <div className="flex items-center space-x-2 bg-white dark:bg-slate-800 px-4 py-2 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 text-sm text-slate-600 dark:text-slate-300 font-medium">
          <Calendar className="w-4 h-4 text-violet-500" />
          <span>July 10, 2026</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        {/* Total Revenue */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow duration-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-400 dark:text-slate-500 text-xs font-semibold uppercase tracking-wider">Total Revenue</p>
              <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mt-1">₹{totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
            </div>
            <div className="p-3 bg-violet-500/10 rounded-xl text-violet-600 dark:text-violet-400">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>
          <div className="flex items-center mt-4 text-xs font-medium">
            {revenueGrowth >= 0 ? (
              <span className="text-emerald-500 flex items-center bg-emerald-500/10 px-1.5 py-0.5 rounded mr-1.5">
                <TrendingUp className="w-3.5 h-3.5 mr-0.5" />
                +{revenueGrowth.toFixed(1)}%
              </span>
            ) : (
              <span className="text-rose-500 flex items-center bg-rose-500/10 px-1.5 py-0.5 rounded mr-1.5">
                <TrendingDown className="w-3.5 h-3.5 mr-0.5" />
                {revenueGrowth.toFixed(1)}%
              </span>
            )}
            <span className="text-slate-400 dark:text-slate-500">vs. last month</span>
          </div>
        </div>

        {/* Net Profit */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow duration-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-400 dark:text-slate-500 text-xs font-semibold uppercase tracking-wider">Net Profit</p>
              <h3 className={`text-2xl font-bold mt-1 ${netProfit >= 0 ? 'text-slate-800 dark:text-slate-100' : 'text-rose-600'}`}>
                {netProfit < 0 ? '-' : ''}₹{Math.abs(netProfit).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h3>
            </div>
            <div className={`p-3 rounded-xl ${netProfit >= 0 ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-rose-500/10 text-rose-600'}`}>
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
          <div className="flex items-center mt-4 text-xs font-medium">
            {profitGrowth >= 0 ? (
              <span className="text-emerald-500 flex items-center bg-emerald-500/10 px-1.5 py-0.5 rounded mr-1.5">
                <TrendingUp className="w-3.5 h-3.5 mr-0.5" />
                +{profitGrowth.toFixed(1)}%
              </span>
            ) : (
              <span className="text-rose-500 flex items-center bg-rose-500/10 px-1.5 py-0.5 rounded mr-1.5">
                <TrendingDown className="w-3.5 h-3.5 mr-0.5" />
                {profitGrowth.toFixed(1)}%
              </span>
            )}
            <span className="text-slate-400 dark:text-slate-500">vs. last month</span>
          </div>
        </div>

        {/* Sales Completed */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow duration-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-400 dark:text-slate-500 text-xs font-semibold uppercase tracking-wider">Sales Made</p>
              <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mt-1">{completedOrdersCount}</h3>
            </div>
            <div className="p-3 bg-sky-500/10 rounded-xl text-sky-600 dark:text-sky-400">
              <ShoppingCart className="w-6 h-6" />
            </div>
          </div>
          <div className="flex items-center mt-4 text-xs font-medium">
            <span className="text-emerald-500 flex items-center bg-emerald-500/10 px-1.5 py-0.5 rounded mr-1.5">
              <TrendingUp className="w-3.5 h-3.5 mr-0.5" />
              +5.1%
            </span>
            <span className="text-slate-400 dark:text-slate-500">transaction counts</span>
          </div>
        </div>

        {/* Low Stock Items */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow duration-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-400 dark:text-slate-500 text-xs font-semibold uppercase tracking-wider">Low Stock Items</p>
              <h3 className={`text-2xl font-bold mt-1 ${lowStockProducts.length > 0 ? 'text-amber-600 dark:text-amber-500' : 'text-slate-800 dark:text-slate-100'}`}>
                {lowStockProducts.length}
              </h3>
            </div>
            <div className={`p-3 rounded-xl ${lowStockProducts.length > 0 ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 animate-pulse' : 'bg-slate-500/10 text-slate-400'}`}>
              <Package className="w-6 h-6" />
            </div>
          </div>
          <div className="flex items-center mt-4 text-xs font-medium">
            {lowStockProducts.length > 0 ? (
              <span className="text-amber-600 dark:text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded mr-1.5 flex items-center">
                Action required
              </span>
            ) : (
              <span className="text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded mr-1.5">
                All goods healthy
              </span>
            )}
            <span className="text-slate-400 dark:text-slate-500">needs replenishment</span>
          </div>
        </div>
      </div>

      {/* Main Charts & Stock alerts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* SVG Sales Trend Chart */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h4 className="font-bold text-slate-800 dark:text-slate-100">Revenue Trend (July 2026)</h4>
              <p className="text-slate-400 dark:text-slate-500 text-xs">Daily gross invoice totals for July 1st - 10th</p>
            </div>
            <div className="flex items-center space-x-1.5 text-xs text-violet-600 dark:text-violet-400 font-semibold bg-violet-600/10 px-2.5 py-1 rounded-lg">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Active Growth</span>
            </div>
          </div>

          {/* SVG Container */}
          <div className="relative">
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible select-none">
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.45" />
                  <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.00" />
                </linearGradient>
                <filter id="glow" x="-10%" y="-10%" width="120%" height="120%">
                  <feGaussianBlur stdDeviation="4" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Horizontal Gridlines */}
              {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => {
                const y = padding + ratio * chartHeight;
                const gridVal = maxVal * (1 - ratio);
                return (
                  <g key={index}>
                    <line
                      x1={padding}
                      y1={y}
                      x2={width - padding}
                      y2={y}
                      stroke="currentColor"
                      className="text-slate-100 dark:text-slate-700/60"
                      strokeWidth="1"
                      strokeDasharray="4 4"
                    />
                    <text
                      x={padding - 8}
                      y={y + 4}
                      textAnchor="end"
                      className="text-[10px] fill-slate-400 font-medium"
                    >
                      ₹{Math.round(gridVal)}
                    </text>
                  </g>
                );
              })}

              {/* Chart Paths */}
              {points.length > 0 && (
                <>
                  {/* Fill Area */}
                  <path d={areaPath} fill="url(#chartGradient)" />

                  {/* Stroke Line */}
                  <path
                    d={linePath}
                    fill="none"
                    stroke="#8b5cf6"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    filter="url(#glow)"
                  />

                  {/* Interactive Circles */}
                  {points.map((p, i) => (
                    <g key={i}>
                      <circle
                        cx={p.x}
                        cy={p.y}
                        r={hoveredPoint === i ? "6" : "4.5"}
                        fill={hoveredPoint === i ? "#fff" : "#8b5cf6"}
                        stroke="#8b5cf6"
                        strokeWidth={hoveredPoint === i ? "3.5" : "2"}
                        className="transition-all duration-150 cursor-pointer"
                        onMouseEnter={() => setHoveredPoint(i)}
                        onMouseLeave={() => setHoveredPoint(null)}
                      />
                    </g>
                  ))}
                </>
              )}

              {/* X Axis Labels */}
              {chartData.map((d, index) => {
                const x = padding + (index / (chartData.length - 1)) * chartWidth;
                return (
                  <text
                    key={index}
                    x={x}
                    y={height - padding + 16}
                    textAnchor="middle"
                    className="text-[10px] fill-slate-400 font-semibold"
                  >
                    {d.day.split(' ')[1]}
                  </text>
                );
              })}
            </svg>

            {/* Custom Interactive Tooltip */}
            {hoveredPoint !== null && (
              <div 
                className="absolute bg-slate-950/95 text-white px-3 py-1.5 rounded-lg text-xs shadow-xl border border-slate-800 pointer-events-none transition-all duration-150"
                style={{
                  left: `${(points[hoveredPoint].x / width) * 100}%`,
                  top: `${(points[hoveredPoint].y / height) * 100 - 22}%`,
                  transform: 'translate(-50%, -100%)'
                }}
              >
                <div className="font-semibold text-slate-400">{points[hoveredPoint].data.day}</div>
                <div className="font-bold text-violet-400">₹{points[hoveredPoint].data.total}</div>
              </div>
            )}
          </div>
        </div>

        {/* Low Stock Replenish Panel */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-4">
              <h4 className="font-bold text-slate-800 dark:text-slate-100">Low Stock Alerts</h4>
              <span className="bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs px-2 py-0.5 rounded-full font-bold">
                {lowStockProducts.length} Items
              </span>
            </div>
            
            <div className="space-y-3 max-h-[170px] overflow-y-auto pr-1">
              {lowStockProducts.length > 0 ? (
                lowStockProducts.map(prod => (
                  <div key={prod.id} className="flex justify-between items-center p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-xs">
                    <div>
                      <p className="font-bold text-slate-700 dark:text-slate-300">{prod.name}</p>
                      <p className="text-[10px] text-slate-400">Min: {prod.minStock} | SKU: {prod.sku}</p>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-amber-600 dark:text-amber-500 bg-amber-500/10 px-2 py-1 rounded">
                        {prod.stock} Left
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-slate-400 text-xs flex flex-col items-center">
                  <Package className="w-8 h-8 text-slate-300 dark:text-slate-600 mb-2" />
                  <span>No low stock products. All inventory is fully stocked!</span>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={() => setActiveTab('inventory')}
            className="w-full mt-4 flex items-center justify-center text-xs font-bold text-violet-600 dark:text-violet-400 hover:text-white bg-violet-600/5 hover:bg-violet-600 px-4 py-2.5 rounded-xl border border-violet-600/20 hover:border-transparent transition-all duration-200"
          >
            <span>Manage Inventory</span>
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </button>
        </div>
      </div>

      {/* Bottom row: Recent activities and top items */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Completed Transactions */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-bold text-slate-800 dark:text-slate-100">Recent Completed Orders</h4>
            <button
              onClick={() => setActiveTab('orders')}
              className="text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center transition-colors"
            >
              <span>See All</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </button>
          </div>

          <div className="space-y-3.5">
            {activeSales.slice(0, 4).map(sale => (
              <div key={sale.id} className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-700/60 last:border-0 last:pb-0">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-700 dark:text-slate-300 text-sm">{sale.id}</span>
                    <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 dark:bg-slate-900 px-1.5 py-0.5 rounded">
                      {sale.paymentMethod}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">{sale.customerName} • {new Date(sale.date).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-slate-800 dark:text-slate-100 text-sm">₹{sale.total.toFixed(2)}</p>
                  <p className="text-[10px] text-slate-400">{sale.items.reduce((sum, i) => sum + i.quantity, 0)} items</p>
                </div>
              </div>
            ))}
            {activeSales.length === 0 && (
              <p className="text-slate-400 text-xs text-center py-6">No sales recorded yet.</p>
            )}
          </div>
        </div>

        {/* Popular / Top Selling Products */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
          <h4 className="font-bold text-slate-800 dark:text-slate-100 mb-4">Top-Selling Products</h4>
          
          <div className="space-y-3.5">
            {products
              .map(p => {
                // Count units sold
                const unitsSold = activeSales
                  .flatMap(s => s.items)
                  .filter(item => item.productId === p.id)
                  .reduce((sum, item) => sum + item.quantity, 0);
                
                const revenueGenerated = unitsSold * p.price;
                return { ...p, unitsSold, revenueGenerated };
              })
              .filter(p => p.unitsSold > 0)
              .sort((a, b) => b.unitsSold - a.unitsSold)
              .slice(0, 4)
              .map(p => (
                <div key={p.id} className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-700/60 last:border-0 last:pb-0">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-violet-600/10 text-violet-600 dark:text-violet-400 flex items-center justify-center font-bold text-xs">
                      {p.sku.slice(0, 3)}
                    </div>
                    <div>
                      <p className="font-bold text-slate-700 dark:text-slate-300 text-xs">{p.name}</p>
                      <p className="text-[10px] text-slate-400">{p.category} • ₹{p.price}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-800 dark:text-slate-100 text-xs">{p.unitsSold} sold</p>
                    <p className="text-[10px] text-emerald-500 font-semibold">+₹{p.revenueGenerated.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            {activeSales.length === 0 && (
              <p className="text-slate-400 text-xs text-center py-6">Product sales stats will show once items are sold.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

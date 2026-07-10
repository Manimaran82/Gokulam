import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { 
  Download, 
  Printer
} from 'lucide-react';

export default function ReportsView() {
  const { sales } = useShop();
  const [hoveredSlice, setHoveredSlice] = useState(null);

  // Filters state (defaults to May, June, July 2026 data range)
  const activeSales = sales.filter(s => s.status === 'Completed');

  // 1. Compile Monthly Sales Statistics
  const months = ['2026-05', '2026-06', '2026-07'];
  const monthlyStats = months.map(m => {
    const monthSales = activeSales.filter(s => s.date.startsWith(m));
    const revenue = monthSales.reduce((sum, s) => sum + s.total, 0);
    const cost = monthSales.reduce((sum, s) => sum + s.totalCost, 0);
    const count = monthSales.length;
    const avgTicket = count > 0 ? revenue / count : 0;
    
    return {
      id: m,
      monthName: new Date(m + '-02').toLocaleDateString(undefined, { month: 'long', year: 'numeric' }),
      revenue,
      cost,
      profit: revenue - cost,
      count,
      avgTicket
    };
  });

  // 2. Compile Category Breakdown (Current Database All-Time Sales)
  const categorySales = {};
  activeSales.forEach(s => {
    s.items.forEach(item => {
      // Find item details
      const cat = item.category || 'Other';
      if (!categorySales[cat]) {
        categorySales[cat] = { qty: 0, revenue: 0 };
      }
      categorySales[cat].qty += item.quantity;
      categorySales[cat].revenue += item.price * item.quantity;
    });
  });

  const categoryData = Object.keys(categorySales).map(cat => ({
    name: cat,
    qty: categorySales[cat].qty,
    revenue: parseFloat(categorySales[cat].revenue.toFixed(2))
  }));

  const totalCatRevenue = categoryData.reduce((sum, d) => sum + d.revenue, 0);

  // SVG Donut Chart Setup
  const size = 200;
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const strokeWidth = 22;
  const center = size / 2;

  // Predefined gorgeous colors matching our palette
  const sliceColors = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ec4899'];

  // Calculate arc slices
  let accumulatedPercent = 0;
  const slices = categoryData.map((d, index) => {
    const percent = totalCatRevenue > 0 ? d.revenue / totalCatRevenue : 0;
    const strokeLength = percent * circumference;
    const strokeOffset = circumference - strokeLength + (accumulatedPercent * circumference);
    accumulatedPercent -= percent; // decrement to rotate clockwise

    return {
      ...d,
      percent,
      strokeLength,
      strokeOffset,
      color: sliceColors[index % sliceColors.length]
    };
  });

  // Handle Export Mockups
  const handleExportCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,Month,Revenue,COGS,Net Profit,Sales Count,Avg Ticket Size\n';
    monthlyStats.forEach(row => {
      csvContent += `${row.monthName},${row.revenue.toFixed(2)},${row.cost.toFixed(2)},${row.profit.toFixed(2)},${row.count},${row.avgTicket.toFixed(2)}\n`;
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `apexretail_sales_report_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header controls */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Monthly Sales Reports</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Analyze general revenue progression, sales volumes, ticket size trends, and categories share.</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={handlePrint}
            className="flex items-center space-x-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-650 dark:text-slate-200 font-semibold text-xs px-3.5 py-2.5 rounded-xl border border-slate-150 dark:border-slate-750 transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span className="hidden sm:inline">Print Report</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center space-x-1.5 bg-violet-600 hover:bg-violet-750 text-white font-bold text-xs px-3.5 py-2.5 rounded-xl shadow-lg shadow-violet-600/10 transition-all duration-200 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Monthly Sales Breakdown Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
          <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm">Monthly Performance Registry</h4>
          <span className="text-[10px] text-slate-400 font-mono">May 2026 - Present</span>
        </div>

        <div className="overflow-x-auto text-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/60 text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                <th className="p-4 pl-6">Reporting Month</th>
                <th className="p-4 text-right">Gross Sales (Revenue)</th>
                <th className="p-4 text-right">Cost of Goods Sold (COGS)</th>
                <th className="p-4 text-right">Gross Margins (Sales Profit)</th>
                <th className="p-4 text-center">Transaction Count</th>
                <th className="p-4 text-right pr-6">Average Basket Size</th>
              </tr>
            </thead>
            <tbody className="text-slate-650 dark:text-slate-350 divide-y divide-slate-100 dark:divide-slate-800">
              {monthlyStats.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors">
                  <td className="p-4 pl-6 font-bold text-slate-800 dark:text-slate-100">{row.monthName}</td>
                  <td className="p-4 text-right font-semibold font-mono">₹{row.revenue.toFixed(2)}</td>
                  <td className="p-4 text-right font-mono text-slate-400">₹{row.cost.toFixed(2)}</td>
                  <td className="p-4 text-right font-bold font-mono text-emerald-500">₹{row.profit.toFixed(2)}</td>
                  <td className="p-4 text-center font-semibold font-mono">{row.count}</td>
                  <td className="p-4 text-right pr-6 font-semibold font-mono text-slate-750 dark:text-slate-205">₹{row.avgTicket.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Category Sales Breakdown Chart */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Category breakdown visual Donut */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col md:flex-row items-center justify-around gap-6">
          <div className="text-center md:text-left space-y-1">
            <h4 className="font-bold text-slate-800 dark:text-slate-100">Category Share</h4>
            <p className="text-slate-400 dark:text-slate-500 text-xs">Revenue contribution by product category</p>
            
            {/* Center metric inside donut preview */}
            <div className="pt-4 hidden md:block">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Total Sales</span>
              <span className="text-xl font-black text-slate-800 dark:text-slate-100">₹{totalCatRevenue.toFixed(2)}</span>
            </div>
          </div>

          {/* SVG Donut Chart */}
          <div className="relative w-[200px] h-[200px]">
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="transform -rotate-90">
              <circle
                cx={center}
                cy={center}
                r={radius}
                fill="transparent"
                stroke="currentColor"
                className="text-slate-100 dark:text-slate-900"
                strokeWidth={strokeWidth}
              />
              {slices.map((slice, idx) => (
                <circle
                  key={idx}
                  cx={center}
                  cy={center}
                  r={radius}
                  fill="transparent"
                  stroke={slice.color}
                  strokeWidth={strokeWidth}
                  strokeDasharray={`${slice.strokeLength} ${circumference}`}
                  strokeDashoffset={slice.strokeOffset}
                  strokeLinecap="round"
                  className="transition-all duration-300 cursor-pointer origin-center"
                  style={{
                    transform: hoveredSlice === idx ? 'scale(1.04)' : 'scale(1)'
                  }}
                  onMouseEnter={() => setHoveredSlice(idx)}
                  onMouseLeave={() => setHoveredSlice(null)}
                />
              ))}
            </svg>

            {/* Inner center text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none text-center">
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                {hoveredSlice !== null ? slices[hoveredSlice].name : 'Active Share'}
              </span>
              <span className="text-sm font-bold text-slate-850 dark:text-white leading-none mt-1">
                {hoveredSlice !== null 
                  ? `${(slices[hoveredSlice].percent * 100).toFixed(1)}%`
                  : `₹${totalCatRevenue.toFixed(0)}`
                }
              </span>
            </div>
          </div>
        </div>

        {/* Legend table listing */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col justify-center">
          <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm mb-4">Category Statistics</h4>
          <div className="space-y-3 text-xs">
            {slices.map((slice, idx) => (
              <div 
                key={idx} 
                className={`flex justify-between items-center p-2 rounded-xl transition-all ${
                  hoveredSlice === idx ? 'bg-slate-50 dark:bg-slate-900/60 font-semibold' : ''
                }`}
                onMouseEnter={() => setHoveredSlice(idx)}
                onMouseLeave={() => setHoveredSlice(null)}
              >
                <div className="flex items-center space-x-2.5">
                  <div className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: slice.color }} />
                  <span className="text-slate-700 dark:text-slate-300 font-medium">{slice.name}</span>
                </div>
                <div className="text-right flex items-center space-x-4">
                  <span className="text-slate-400 font-mono">{slice.qty} sold</span>
                  <span className="font-bold text-slate-800 dark:text-slate-100 font-mono">₹{slice.revenue.toFixed(2)}</span>
                  <span className="text-[10px] font-bold text-violet-600 dark:text-violet-400 font-mono min-w-[2.5rem] text-right">
                    {(slice.percent * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            ))}
            {slices.length === 0 && (
              <p className="text-slate-450 py-8 text-center">No category sales metrics available.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { 
  Percent, 
  Printer,
  ArrowDownCircle,
  CheckCircle,
  TrendingUp,
  Clock
} from 'lucide-react';

export default function ProfitLossView() {
  const { sales, expenses } = useShop();

  const months = ['2026-05', '2026-06', '2026-07'];

  // Helper to compile full profit & loss figures for a given month
  const compilePLForMonth = (yrMo) => {
    const monthSales = sales.filter(s => s.date.startsWith(yrMo));
    const monthExpenses = expenses.filter(e => e.date.startsWith(yrMo));

    // Gross Revenue & Refunds
    const completedSales = monthSales.filter(s => s.status === 'Completed');
    const refundedSales = monthSales.filter(s => s.status === 'Refunded');

    const grossRevenue = monthSales.reduce((sum, s) => sum + s.total, 0); // gross includes refunded initially
    const refunds = refundedSales.reduce((sum, s) => sum + s.total, 0);
    const netRevenue = completedSales.reduce((sum, s) => sum + s.total, 0); // net = completed only

    // COGS (only for completed/non-refunded sales)
    const cogs = completedSales.reduce((sum, s) => sum + s.totalCost, 0);

    const grossProfit = netRevenue - cogs;

    // Expenses categories
    const rent = monthExpenses.filter(e => e.category === 'Rent').reduce((sum, e) => sum + e.amount, 0);
    const utilities = monthExpenses.filter(e => e.category === 'Utilities').reduce((sum, e) => sum + e.amount, 0);
    const salaries = monthExpenses.filter(e => e.category === 'Salaries').reduce((sum, e) => sum + e.amount, 0);
    const marketing = monthExpenses.filter(e => e.category === 'Marketing').reduce((sum, e) => sum + e.amount, 0);
    const other = monthExpenses.filter(e => e.category === 'Other').reduce((sum, e) => sum + e.amount, 0);
    
    const totalExpenses = rent + utilities + salaries + marketing + other;
    const netProfit = grossProfit - totalExpenses;

    const grossMargin = netRevenue > 0 ? (grossProfit / netRevenue) * 100 : 0;
    const netMargin = netRevenue > 0 ? (netProfit / netRevenue) * 100 : 0;

    return {
      grossRevenue,
      refunds,
      netRevenue,
      cogs,
      grossProfit,
      expenses: { rent, utilities, salaries, marketing, other, totalExpenses },
      netProfit,
      grossMargin,
      netMargin
    };
  };

  // Compile data for each month
  const monthlyPLData = months.map(m => ({
    id: m,
    name: new Date(m + '-02').toLocaleDateString(undefined, { month: 'short', year: '2-digit' }),
    fullMonthName: new Date(m + '-02').toLocaleDateString(undefined, { month: 'long', year: 'numeric' }),
    ...compilePLForMonth(m)
  }));

  // Compile YTD (Cumulative) column
  const ytdData = monthlyPLData.reduce((acc, curr) => {
    return {
      grossRevenue: acc.grossRevenue + curr.grossRevenue,
      refunds: acc.refunds + curr.refunds,
      netRevenue: acc.netRevenue + curr.netRevenue,
      cogs: acc.cogs + curr.cogs,
      grossProfit: acc.grossProfit + curr.grossProfit,
      expenses: {
        rent: acc.expenses.rent + curr.expenses.rent,
        utilities: acc.expenses.utilities + curr.expenses.utilities,
        salaries: acc.expenses.salaries + curr.expenses.salaries,
        marketing: acc.expenses.marketing + curr.expenses.marketing,
        other: acc.expenses.other + curr.expenses.other,
        totalExpenses: acc.expenses.totalExpenses + curr.expenses.totalExpenses
      },
      netProfit: acc.netProfit + curr.netProfit
    };
  }, {
    grossRevenue: 0, refunds: 0, netRevenue: 0, cogs: 0, grossProfit: 0,
    expenses: { rent: 0, utilities: 0, salaries: 0, marketing: 0, other: 0, totalExpenses: 0 },
    netProfit: 0
  });

  const ytdGrossMargin = ytdData.netRevenue > 0 ? (ytdData.grossProfit / ytdData.netRevenue) * 100 : 0;
  const ytdNetMargin = ytdData.netRevenue > 0 ? (ytdData.netProfit / ytdData.netRevenue) * 100 : 0;

  // Selected period summary details
  const [selectedPeriod, setSelectedPeriod] = useState('2026-07'); // Default to July 2026

  const getDaysInPeriod = (periodId) => {
    if (periodId === 'YTD') {
      return 31 + 30 + 10; // May (31) + June (30) + July (10 days in)
    }
    if (periodId === '2026-07') {
      return 10; // July has been active for 10 days
    }
    if (periodId === '2026-06') {
      return 30;
    }
    if (periodId === '2026-05') {
      return 31;
    }
    return 30;
  };

  const periodData = selectedPeriod === 'YTD'
    ? {
        name: 'YTD Cumulative',
        fullMonthName: 'Year-to-Date (YTD) Cumulative',
        grossRevenue: ytdData.grossRevenue,
        netRevenue: ytdData.netRevenue,
        expenses: ytdData.expenses,
        netProfit: ytdData.netProfit
      }
    : monthlyPLData.find(d => d.id === selectedPeriod) || monthlyPLData[monthlyPLData.length - 1];

  const daysCount = getDaysInPeriod(selectedPeriod);
  const dailyAverageSales = periodData.netRevenue / daysCount;

  // Custom Grouped Bar Chart Setup
  // Chart dimensions
  const width = 600;
  const height = 240;
  const padding = 40;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  // Find max value for chart scaling (maximum of Net Revenue and total outlays)
  const allValues = monthlyPLData.flatMap(d => [d.netRevenue, d.cogs + d.expenses.totalExpenses, Math.abs(d.netProfit)]);
  const maxChartVal = Math.max(...allValues, 100) * 1.15;

  const barGroupWidth = chartWidth / monthlyPLData.length;
  const singleBarWidth = 14;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Profit & Loss (P&L) Ledger</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Analyze general revenue progression, sales volumes, ticket sizes, and category share.</p>
        </div>
        <div className="flex items-center space-x-3 w-full sm:w-auto">
          {/* Period selector */}
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="flex-1 sm:flex-initial bg-white dark:bg-slate-800 border border-slate-150 dark:border-slate-750 text-slate-700 dark:text-slate-200 font-semibold text-xs px-3.5 py-2.5 rounded-xl transition-all focus:outline-none focus:ring-1 focus:ring-violet-500 cursor-pointer"
          >
            <option value="2026-07">July 2026 (Current Month)</option>
            <option value="2026-06">June 2026</option>
            <option value="2026-05">May 2026</option>
            <option value="YTD">Year-To-Date (Cumulative)</option>
          </select>
          <button
            onClick={handlePrint}
            className="flex items-center justify-center space-x-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-655 dark:text-slate-200 font-semibold text-xs px-3.5 py-2.5 rounded-xl border border-slate-150 dark:border-slate-750 transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span className="hidden sm:inline">Print Statement</span>
          </button>
        </div>
      </div>

      {/* Simplified KPI Dashboard Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Monthly / YTD sales */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-wider">
              {selectedPeriod === 'YTD' ? 'Cumulative Sales' : 'Net Sales Revenue'}
            </p>
            <h3 className="text-xl font-bold text-slate-850 dark:text-slate-100 font-mono">
              ₹{periodData.netRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
            <p className="text-[10px] text-slate-400">Total net receipts in period</p>
          </div>
          <div className="p-3 bg-violet-500/10 rounded-xl text-violet-650 dark:text-violet-400">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        {/* Daily average sales */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-wider">Daily Average Sales</p>
            <h3 className="text-xl font-bold text-slate-850 dark:text-slate-100 font-mono">
              ₹{dailyAverageSales.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
            <p className="text-[10px] text-slate-400">Calculated over {daysCount} days</p>
          </div>
          <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-650 dark:text-indigo-400">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* Total expenses */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-wider">Operating Expenses</p>
            <h3 className="text-xl font-bold text-rose-500 font-mono">
              ₹{periodData.expenses.totalExpenses.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
            <p className="text-[10px] text-slate-400">Log ledger outlays</p>
          </div>
          <div className="p-3 bg-rose-500/10 rounded-xl text-rose-500">
            <ArrowDownCircle className="w-6 h-6" />
          </div>
        </div>

        {/* Net Profit */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-wider">Net Profit / Margin</p>
            <h3 className={`text-xl font-bold font-mono ${periodData.netProfit >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
              ₹{periodData.netProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
            <p className="text-[10px] text-slate-400">
              Profit after COGS & OPEX
            </p>
          </div>
          <div className={`p-3 rounded-xl ${
            periodData.netProfit >= 0 ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-rose-500/10 text-rose-500'
          }`}>
            <CheckCircle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* P&L Visual Grouped Bar Chart */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
        <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
          <div>
            <h4 className="font-bold text-slate-800 dark:text-slate-100">Monthly Cash Flows Comparer</h4>
            <p className="text-slate-400 dark:text-slate-500 text-xs">Visual comparison of Net Sales, Total Costs (COGS + OPEX), and Net Profit</p>
          </div>
          {/* Chart Legend */}
          <div className="flex items-center space-x-4 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            <div className="flex items-center space-x-1.5">
              <div className="w-3 h-3 rounded-md bg-violet-500" />
              <span>Net Sales</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <div className="w-3 h-3 rounded-md bg-amber-500" />
              <span>Total Cost</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <div className="w-3 h-3 rounded-md bg-emerald-500" />
              <span>Net Profit</span>
            </div>
          </div>
        </div>

        {/* SVG Chart */}
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible select-none text-xs">
          {/* Horizontal lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
            const y = padding + ratio * chartHeight;
            const gridVal = maxChartVal * (1 - ratio);
            return (
              <g key={idx}>
                <line
                  x1={padding}
                  y1={y}
                  x2={width - padding}
                  y2={y}
                  stroke="currentColor"
                  className="text-slate-100 dark:text-slate-700/60"
                  strokeWidth="1"
                />
                <text
                  x={padding - 8}
                  y={y + 4}
                  textAnchor="end"
                  className="text-[9px] fill-slate-400 font-semibold"
                >
                  ₹{Math.round(gridVal)}
                </text>
              </g>
            );
          })}

          {/* Render grouped columns */}
          {monthlyPLData.map((d, index) => {
            const groupX = padding + index * barGroupWidth;
            const centerOffset = barGroupWidth / 2;

            // Bar heights
            const netSalesHeight = (d.netRevenue / maxChartVal) * chartHeight;
            const totalCostHeight = ((d.cogs + d.expenses.totalExpenses) / maxChartVal) * chartHeight;
            const netProfitHeight = (Math.max(0, d.netProfit) / maxChartVal) * chartHeight;

            // Bar coordinates
            const salesY = height - padding - netSalesHeight;
            const costY = height - padding - totalCostHeight;
            const profitY = height - padding - netProfitHeight;

            // Center group position
            const salesX = groupX + centerOffset - singleBarWidth * 1.5 - 2;
            const costX = groupX + centerOffset - singleBarWidth * 0.5;
            const profitX = groupX + centerOffset + singleBarWidth * 0.5 + 2;

            return (
              <g key={d.id}>
                {/* Net Sales bar */}
                <rect
                  x={salesX}
                  y={salesY}
                  width={singleBarWidth}
                  height={netSalesHeight}
                  fill="#8b5cf6"
                  rx="3"
                  className="transition-all duration-300 hover:opacity-90 cursor-pointer"
                />
                
                {/* Total Cost bar */}
                <rect
                  x={costX}
                  y={costY}
                  width={singleBarWidth}
                  height={totalCostHeight}
                  fill="#f59e0b"
                  rx="3"
                  className="transition-all duration-300 hover:opacity-90 cursor-pointer"
                />

                {/* Net Profit bar */}
                <rect
                  x={profitX}
                  y={profitY}
                  width={singleBarWidth}
                  height={netProfitHeight}
                  fill="#10b981"
                  rx="3"
                  className="transition-all duration-300 hover:opacity-90 cursor-pointer"
                />

                {/* X labels */}
                <text
                  x={groupX + centerOffset}
                  y={height - padding + 16}
                  textAnchor="middle"
                  className="text-[10px] font-bold fill-slate-400 uppercase tracking-wider"
                >
                  {d.fullMonthName.split(' ')[0]}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Spreadsheet Matrix P&L Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="overflow-x-auto text-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/60 text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                <th className="p-4 pl-6 w-80">Line Item Description</th>
                {monthlyPLData.map(d => (
                  <th key={d.id} className="p-4 text-right">{d.fullMonthName}</th>
                ))}
                <th className="p-4 text-right bg-slate-50 dark:bg-slate-900 pr-6 font-black text-slate-700 dark:text-slate-350">YTD Cumulative</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              
              {/* REVENUE ROW SECTION */}
              <tr className="bg-slate-50/30 dark:bg-slate-900/10 font-bold text-slate-750 dark:text-slate-300">
                <td className="p-3.5 pl-6 text-[10px] uppercase tracking-wider text-slate-400">1. Operating Revenue</td>
                {months.map(m => <td key={m} className="p-3.5"></td>)}
                <td className="p-3.5 bg-slate-50 dark:bg-slate-900"></td>
              </tr>
              <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 text-slate-600 dark:text-slate-400">
                <td className="p-3 pl-8">Gross Sales Invoices</td>
                {monthlyPLData.map(d => <td key={d.id} className="p-3 text-right font-mono">₹{d.grossRevenue.toFixed(2)}</td>)}
                <td className="p-3 text-right font-mono bg-slate-50 dark:bg-slate-900 font-semibold">₹{ytdData.grossRevenue.toFixed(2)}</td>
              </tr>
              <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 text-slate-655 text-rose-500">
                <td className="p-3 pl-8 flex items-center">Less: Sales Returns & Refunds</td>
                {monthlyPLData.map(d => <td key={d.id} className="p-3 text-right font-mono">-₹{d.refunds.toFixed(2)}</td>)}
                <td className="p-3 text-right font-mono bg-slate-50 dark:bg-slate-900 font-semibold">-₹{ytdData.refunds.toFixed(2)}</td>
              </tr>
              <tr className="font-bold text-slate-800 dark:text-slate-100 border-t border-slate-100 dark:border-slate-800">
                <td className="p-3.5 pl-8">Net Sales Revenue</td>
                {monthlyPLData.map(d => <td key={d.id} className="p-3.5 text-right font-mono">₹{d.netRevenue.toFixed(2)}</td>)}
                <td className="p-3.5 text-right font-mono bg-slate-50 dark:bg-slate-900 text-violet-650 dark:text-violet-400 font-black">₹{ytdData.netRevenue.toFixed(2)}</td>
              </tr>

              {/* COGS SECTION */}
              <tr className="bg-slate-50/30 dark:bg-slate-900/10 font-bold text-slate-750 dark:text-slate-300 border-t border-slate-100 dark:border-slate-800">
                <td className="p-3.5 pl-6 text-[10px] uppercase tracking-wider text-slate-400">2. Cost of Sales</td>
                {months.map(m => <td key={m} className="p-3.5"></td>)}
                <td className="p-3.5 bg-slate-50 dark:bg-slate-900"></td>
              </tr>
              <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 text-slate-600 dark:text-slate-400">
                <td className="p-3 pl-8">Cost of Goods Sold (COGS)</td>
                {monthlyPLData.map(d => <td key={d.id} className="p-3 text-right font-mono">₹{d.cogs.toFixed(2)}</td>)}
                <td className="p-3 text-right font-mono bg-slate-50 dark:bg-slate-900 font-semibold">₹{ytdData.cogs.toFixed(2)}</td>
              </tr>
              <tr className="font-bold text-slate-800 dark:text-slate-100 border-t border-slate-100 dark:border-slate-800 bg-slate-50/10 dark:bg-slate-900/5">
                <td className="p-3.5 pl-8 text-emerald-600 dark:text-emerald-500">Gross Profit (Marginal)</td>
                {monthlyPLData.map(d => <td key={d.id} className="p-3.5 text-right font-mono text-emerald-600 dark:text-emerald-500">₹{d.grossProfit.toFixed(2)}</td>)}
                <td className="p-3.5 text-right font-mono bg-slate-50 dark:bg-slate-900 text-emerald-600 dark:text-emerald-500 font-black">₹{ytdData.grossProfit.toFixed(2)}</td>
              </tr>

              {/* OPEX SECTION */}
              <tr className="bg-slate-50/30 dark:bg-slate-900/10 font-bold text-slate-750 dark:text-slate-300 border-t border-slate-100 dark:border-slate-800">
                <td className="p-3.5 pl-6 text-[10px] uppercase tracking-wider text-slate-400">3. Operating Expenses (OPEX)</td>
                {months.map(m => <td key={m} className="p-3.5"></td>)}
                <td className="p-3.5 bg-slate-50 dark:bg-slate-900"></td>
              </tr>
              <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 text-slate-600 dark:text-slate-400">
                <td className="p-3 pl-8">Shop Space Rental</td>
                {monthlyPLData.map(d => <td key={d.id} className="p-3 text-right font-mono">₹{d.expenses.rent.toFixed(2)}</td>)}
                <td className="p-3 text-right font-mono bg-slate-50 dark:bg-slate-900 font-semibold">₹{ytdData.expenses.rent.toFixed(2)}</td>
              </tr>
              <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 text-slate-600 dark:text-slate-400">
                <td className="p-3 pl-8">Utilities (Electricity, Water, internet)</td>
                {monthlyPLData.map(d => <td key={d.id} className="p-3 text-right font-mono">₹{d.expenses.utilities.toFixed(2)}</td>)}
                <td className="p-3 text-right font-mono bg-slate-50 dark:bg-slate-900 font-semibold">₹{ytdData.expenses.utilities.toFixed(2)}</td>
              </tr>
              <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 text-slate-650 dark:text-slate-400">
                <td className="p-3 pl-8">Employee Wages / Salaries</td>
                {monthlyPLData.map(d => <td key={d.id} className="p-3 text-right font-mono">₹{d.expenses.salaries.toFixed(2)}</td>)}
                <td className="p-3 text-right font-mono bg-slate-50 dark:bg-slate-900 font-semibold">₹{ytdData.expenses.salaries.toFixed(2)}</td>
              </tr>
              <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 text-slate-600 dark:text-slate-400">
                <td className="p-3 pl-8">Marketing & Advertising</td>
                {monthlyPLData.map(d => <td key={d.id} className="p-3 text-right font-mono">₹{d.expenses.marketing.toFixed(2)}</td>)}
                <td className="p-3 text-right font-mono bg-slate-50 dark:bg-slate-900 font-semibold">₹{ytdData.expenses.marketing.toFixed(2)}</td>
              </tr>
              <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 text-slate-600 dark:text-slate-400">
                <td className="p-3 pl-8">Miscellaneous / Other</td>
                {monthlyPLData.map(d => <td key={d.id} className="p-3 text-right font-mono">₹{d.expenses.other.toFixed(2)}</td>)}
                <td className="p-3 text-right font-mono bg-slate-50 dark:bg-slate-900 font-semibold">₹{ytdData.expenses.other.toFixed(2)}</td>
              </tr>
              <tr className="font-bold text-slate-800 dark:text-slate-100 border-t border-slate-100 dark:border-slate-800 bg-rose-500/[0.01]">
                <td className="p-3.5 pl-8 text-rose-550">Total Operating Expenses</td>
                {monthlyPLData.map(d => <td key={d.id} className="p-3.5 text-right font-mono text-rose-550">₹{d.expenses.totalExpenses.toFixed(2)}</td>)}
                <td className="p-3.5 text-right font-mono bg-slate-50 dark:bg-slate-900 text-rose-600 font-black">₹{ytdData.expenses.totalExpenses.toFixed(2)}</td>
              </tr>

              {/* NET PROFIT SECTION */}
              <tr className="bg-slate-900 dark:bg-slate-950 text-white font-black border-t-2 border-slate-900">
                <td className="p-4 pl-6 text-sm flex items-center">
                  <span>NET OPERATING INCOME</span>
                </td>
                {monthlyPLData.map(d => (
                  <td key={d.id} className={`p-4 text-right font-mono text-sm ${d.netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    ₹{d.netProfit.toFixed(2)}
                  </td>
                ))}
                <td className={`p-4 text-right font-mono text-sm bg-slate-950 ${ytdData.netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  ₹{ytdData.netProfit.toFixed(2)}
                </td>
              </tr>

              {/* KEY RATIOS SECTION */}
              <tr className="bg-slate-50/30 dark:bg-slate-900/10 font-bold text-slate-750 dark:text-slate-350 border-t border-slate-150">
                <td className="p-3.5 pl-6 text-[10px] uppercase tracking-wider text-slate-400">4. Key Financial Ratios</td>
                {months.map(m => <td key={m} className="p-3.5"></td>)}
                <td className="p-3.5 bg-slate-50 dark:bg-slate-900"></td>
              </tr>
              <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 text-slate-600 dark:text-slate-400 font-medium">
                <td className="p-3 pl-8 flex items-center"><Percent className="w-3.5 h-3.5 text-slate-400 mr-1.5" /> Gross Profit Margin</td>
                {monthlyPLData.map(d => <td key={d.id} className="p-3 text-right font-mono text-emerald-500">{d.grossMargin.toFixed(1)}%</td>)}
                <td className="p-3 text-right font-mono bg-slate-50 dark:bg-slate-900 text-emerald-500 font-bold">{ytdGrossMargin.toFixed(1)}%</td>
              </tr>
              <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 text-slate-650 dark:text-slate-400 font-medium">
                <td className="p-3 pl-8 flex items-center"><Percent className="w-3.5 h-3.5 text-slate-400 mr-1.5" /> Net Profit Margin</td>
                {monthlyPLData.map(d => (
                  <td key={d.id} className={`p-3 text-right font-mono ${d.netMargin >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {d.netMargin.toFixed(1)}%
                  </td>
                ))}
                <td className={`p-3 text-right font-mono bg-slate-50 dark:bg-slate-900 font-bold ${ytdNetMargin >= 0 ? 'text-emerald-500' : 'text-rose-505'}`}>
                  {ytdNetMargin.toFixed(1)}%
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

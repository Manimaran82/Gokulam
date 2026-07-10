import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  DollarSign, 
  Receipt,
  Filter,
  Calendar,
  X 
} from 'lucide-react';

export default function ExpensesView() {
  const { expenses, addExpense, editExpense, deleteExpense } = useShop();

  // Search & Filter
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [monthFilter, setMonthFilter] = useState('All'); // 'All' | '2026-05' | '2026-06' | '2026-07'

  // Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);

  // Form states
  const emptyForm = { date: new Date().toISOString().split('T')[0], category: 'Rent', amount: '', description: '' };
  const [formData, setFormData] = useState(emptyForm);

  // Default categories
  const defaultCategories = ['Rent', 'Utilities', 'Salaries', 'Marketing', 'Other'];

  // All unique categories in database plus default categories for autofill datalist
  const uniqueCategories = Array.from(
    new Set([...defaultCategories, ...expenses.map(e => e.category)])
  );

  // Months lists from expenses
  const months = ['All', ...new Set(expenses.map(e => e.date.substring(0, 7)))].sort().reverse();

  // Filtering logic
  const filteredExpenses = expenses.filter(exp => {
    const matchesSearch = exp.description.toLowerCase().includes(search.toLowerCase()) || 
                          exp.category.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || exp.category === categoryFilter;
    const matchesMonth = monthFilter === 'All' || exp.date.startsWith(monthFilter);

    return matchesSearch && matchesCategory && matchesMonth;
  });

  // Totals calculations
  const filteredTotal = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  
  // Calculate expenses for current month (July 2026)
  const currentMonthStr = '2026-07';
  const currentMonthTotal = expenses
    .filter(e => e.date.startsWith(currentMonthStr))
    .reduce((sum, e) => sum + e.amount, 0);

  // Handle forms
  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!formData.amount || !formData.category) {
      alert('Please fill out Amount and Category.');
      return;
    }
    addExpense(formData);
    setFormData(emptyForm);
    setIsAddModalOpen(false);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!formData.amount || !formData.category) {
      alert('Please fill out Amount and Category.');
      return;
    }
    editExpense(formData);
    setEditingExpense(null);
    setFormData(emptyForm);
  };

  const startEdit = (expense) => {
    setEditingExpense(expense);
    setFormData(expense);
  };

  const handleDelete = (id, desc) => {
    if (window.confirm(`Are you sure you want to delete expense record "${desc || 'Untitled'}"?`)) {
      deleteExpense(id);
    }
  };

  // Format Helper for month titles e.g. 2026-07 -> July 2026
  const formatMonthName = (yrMo) => {
    if (yrMo === 'All') return 'All Months';
    const [year, month] = yrMo.split('-');
    const date = new Date(year, parseInt(month) - 1, 1);
    return date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Expenses Ledger</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Log utility bills, rent, employee salaries, and advertising fees to compute net margins.</p>
        </div>
        <button
          onClick={() => { setFormData(emptyForm); setIsAddModalOpen(true); }}
          className="flex items-center space-x-2 bg-violet-650 hover:bg-violet-750 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-violet-650/15 cursor-pointer transition-all duration-200"
        >
          <Plus className="w-4 h-4" />
          <span>Log New Expense</span>
        </button>
      </div>

      {/* Summary KPI widgets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Selected Month Summary */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex items-center justify-between">
          <div className="space-y-1.5">
            <p className="text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-wider">Filtered Months Total</p>
            <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 font-mono">₹{filteredTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
            <p className="text-[10px] text-slate-400">Total in active query</p>
          </div>
          <div className="p-3 bg-violet-500/10 rounded-xl text-violet-650 dark:text-violet-400">
            <Receipt className="w-6 h-6" />
          </div>
        </div>

        {/* Current Month Summary */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex items-center justify-between">
          <div className="space-y-1.5">
            <p className="text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-wider">July 2026 Overhead</p>
            <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 font-mono">₹{currentMonthTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
            <p className="text-[10px] text-slate-450">Current month outlays</p>
          </div>
          <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-650 dark:text-indigo-400">
            <Calendar className="w-6 h-6" />
          </div>
        </div>

        {/* Categories Count */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex items-center justify-between">
          <div className="space-y-1.5">
            <p className="text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-wider">Operational Ledgers</p>
            <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{uniqueCategories.length}</h3>
            <p className="text-[10px] text-slate-400">Operational expense categories</p>
          </div>
          <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-650 dark:text-emerald-400">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filters ledger bar */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between text-xs">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by description or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-150 dark:border-slate-850 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all dark:text-slate-200"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Category Filter */}
          <div className="flex items-center space-x-1.5 w-full sm:w-auto">
            <span className="text-slate-400 font-semibold flex items-center"><Filter className="w-3.5 h-3.5 mr-1" /> Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-slate-50 dark:bg-slate-900 border border-slate-150 dark:border-slate-850 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-violet-500 font-medium dark:text-slate-200"
            >
              <option value="All">All Categories</option>
              {uniqueCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Month Filter */}
          <div className="flex items-center space-x-1.5 w-full sm:w-auto">
            <span className="text-slate-400 font-semibold">Month:</span>
            <select
              value={monthFilter}
              onChange={(e) => setMonthFilter(e.target.value)}
              className="bg-slate-50 dark:bg-slate-900 border border-slate-150 dark:border-slate-850 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-violet-500 font-medium dark:text-slate-200"
            >
              {months.map(mo => (
                <option key={mo} value={mo}>{formatMonthName(mo)}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/60 text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                <th className="p-4 pl-6">Log Date</th>
                <th className="p-4">Category</th>
                <th className="p-4">Description</th>
                <th className="p-4 text-right">Debit Amount</th>
                <th className="p-4 text-center pr-6">Actions</th>
              </tr>
            </thead>
            <tbody className="text-xs text-slate-650 dark:text-slate-350 divide-y divide-slate-100 dark:divide-slate-800">
              {filteredExpenses.map((exp) => (
                <tr key={exp.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors">
                  <td className="p-4 pl-6 font-semibold font-mono text-slate-450 dark:text-slate-500">{exp.date}</td>
                  <td className="p-4">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full font-bold text-[9px] uppercase tracking-wider ${
                      exp.category === 'Rent' ? 'bg-amber-500/10 text-amber-650 dark:text-amber-400' :
                      exp.category === 'Utilities' ? 'bg-sky-500/10 text-sky-650 dark:text-sky-400' :
                      exp.category === 'Salaries' ? 'bg-emerald-500/10 text-emerald-650 dark:text-emerald-450' :
                      exp.category === 'Marketing' ? 'bg-violet-500/10 text-violet-650 dark:text-violet-400' :
                      'bg-slate-100 dark:bg-slate-900 text-slate-550'
                    }`}>
                      {exp.category}
                    </span>
                  </td>
                  <td className="p-4 font-semibold text-slate-800 dark:text-slate-200">{exp.description || '—'}</td>
                  <td className="p-4 text-right font-bold font-mono text-rose-500">-₹{exp.amount.toFixed(2)}</td>
                  <td className="p-4 text-center pr-6">
                    <div className="flex items-center justify-center space-x-1.5">
                      <button
                        onClick={() => startEdit(exp)}
                        className="p-1.5 text-slate-400 hover:text-slate-850 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-lg transition-colors"
                        title="Edit expense"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(exp.id, exp.description)}
                        className="p-1.5 text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors"
                        title="Delete expense"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredExpenses.length === 0 && (
                <tr>
                  <td colSpan="5" className="p-12 text-center text-slate-400 text-sm">
                    No expense entries log found matching active filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Form Modal (Add / Edit) */}
      {(isAddModalOpen || editingExpense) && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-[2px] flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-2xl max-w-sm w-full overflow-hidden transform scale-100 transition-all">
            <div className="p-4 border-b border-slate-100 dark:border-slate-700/60 flex justify-between items-center bg-slate-50 dark:bg-slate-900/60">
              <h3 className="font-bold text-slate-800 dark:text-white text-xs">
                {isAddModalOpen ? 'Log New Expense' : 'Edit Expense Details'}
              </h3>
              <button
                onClick={() => { setIsAddModalOpen(false); setEditingExpense(null); }}
                className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg"
              >
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            <form onSubmit={isAddModalOpen ? handleAddSubmit : handleEditSubmit} className="p-5 space-y-4 text-xs">
              {/* Date */}
              <div className="space-y-1">
                <label className="font-semibold text-slate-650 dark:text-slate-400 block">Transaction Date *</label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-150 dark:border-slate-850 rounded-xl focus:outline-none focus:ring-1 focus:ring-violet-500 font-medium dark:text-slate-200"
                />
              </div>

              {/* Category */}
              <div className="space-y-1">
                <label className="font-semibold text-slate-650 dark:text-slate-400 block">Expense Category *</label>
                <input
                  type="text"
                  list="expense-categories"
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="e.g. Rent, Utilities, Salaries, Transport..."
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-150 dark:border-slate-850 rounded-xl focus:outline-none focus:ring-1 focus:ring-violet-500 font-medium dark:text-slate-200"
                />
                <datalist id="expense-categories">
                  {uniqueCategories.map(cat => (
                    <option key={cat} value={cat} />
                  ))}
                </datalist>
              </div>

              {/* Amount */}
              <div className="space-y-1">
                <label className="font-semibold text-slate-650 dark:text-slate-400 block">Debit Amount (₹) *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="0.00"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-150 dark:border-slate-850 rounded-xl focus:outline-none focus:ring-1 focus:ring-violet-500 font-medium dark:text-slate-200"
                />
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="font-semibold text-slate-650 dark:text-slate-400 block">Expense Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="e.g. Paid office electric utility charges"
                  rows="3"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-150 dark:border-slate-850 rounded-xl focus:outline-none focus:ring-1 focus:ring-violet-500 font-medium dark:text-slate-200 resize-none"
                />
              </div>

              {/* Buttons */}
              <div className="flex space-x-3 pt-3 border-t border-slate-100 dark:border-slate-700/60 mt-4 bg-white dark:bg-slate-800">
                <button
                  type="button"
                  onClick={() => { setIsAddModalOpen(false); setEditingExpense(null); }}
                  className="flex-1 border border-slate-150 dark:border-slate-700 py-2.5 rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-slate-900/60 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-violet-600 hover:bg-violet-750 text-white font-bold py-2.5 rounded-xl cursor-pointer"
                >
                  {isAddModalOpen ? 'Log Expense' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

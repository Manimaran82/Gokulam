import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { 
  Search, 
  Eye, 
  RotateCcw, 
  Calendar, 
  X, 
  AlertTriangle,
  Receipt,
  Edit2,
  Save,
  Trash2
} from 'lucide-react';

export default function OrdersHistoryView() {
  const { sales, refundSale, editSale, shopDetails, clearAllSales } = useShop();

  // Search & Filter
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All'); // 'All' | 'Completed' | 'Refunded'
  const [sortBy, setSortBy] = useState('date-desc'); // 'date-desc' | 'date-asc' | 'total-desc' | 'total-asc' | 'client-name'

  // Modal active invoice
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  // Edit mode active inside modal
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState(null);

  // Filters and Sorting
  const filteredSales = sales
    .filter(sale => {
      const matchesSearch = sale.id.toLowerCase().includes(search.toLowerCase()) ||
                            sale.customerName.toLowerCase().includes(search.toLowerCase()) ||
                            (sale.customerPhone && sale.customerPhone.includes(search));
      const matchesStatus = statusFilter === 'All' || sale.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'date-desc') return new Date(b.date) - new Date(a.date);
      if (sortBy === 'date-asc') return new Date(a.date) - new Date(b.date);
      if (sortBy === 'total-desc') return b.total - a.total;
      if (sortBy === 'total-asc') return a.total - b.total;
      if (sortBy === 'client-name') return a.customerName.localeCompare(b.customerName);
      return 0;
    });

  const handleRefund = (saleId) => {
    if (window.confirm(`Are you sure you want to void/refund invoice ${saleId}? This will restock all items in the inventory.`)) {
      refundSale(saleId);
      // Close invoice modal if open
      setSelectedInvoice(null);
    }
  };

  const startEditing = () => {
    const pad = (num) => String(num).padStart(2, '0');
    const date = new Date(selectedInvoice.date);
    const dateLocal = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
    
    setEditForm({
      ...selectedInvoice,
      shopName: selectedInvoice.shopName || 'Gokulam Agency',
      dateLocal: dateLocal
    });
    setIsEditing(true);
  };

  const handleItemChange = (idx, field, value) => {
    const updatedItems = [...editForm.items];
    updatedItems[idx] = {
      ...updatedItems[idx],
      [field]: field === 'quantity' ? (parseInt(value) || 0) : field === 'price' ? (parseFloat(value) || 0) : value
    };
    
    // Recalculate totals
    const subtotal = updatedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const discountAmount = subtotal * (editForm.discount / 100);
    const total = subtotal - discountAmount;
    
    setEditForm({
      ...editForm,
      items: updatedItems,
      total: total,
      totalCost: updatedItems.reduce((sum, item) => sum + (item.cost || 0) * item.quantity, 0)
    });
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!editForm.shopName.trim() || !editForm.customerName.trim() || !editForm.dateLocal) {
      alert('Please fill out Shop Name, Customer Name, and Date.');
      return;
    }
    
    const updatedSale = {
      ...editForm,
      date: new Date(editForm.dateLocal).toISOString()
    };
    
    delete updatedSale.dateLocal;
    
    editSale(updatedSale);
    setSelectedInvoice(updatedSale);
    setIsEditing(false);
    setEditForm(null);
  };

  const handleClearHistory = () => {
    if (window.confirm('WARNING: Are you sure you want to delete ALL items in the sales order history? This action cannot be undone.')) {
      clearAllSales();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Orders & Invoices</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Review transaction history, inspect client receipt invoices, and process refunds.</p>
        </div>
        {sales.length > 0 && (
          <button
            onClick={handleClearHistory}
            className="flex items-center space-x-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-rose-600/10 cursor-pointer transition-all duration-200"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete All History</span>
          </button>
        )}
      </div>

      {/* Filters and Search Bar */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between text-xs">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Invoice #, customer name or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-150 dark:border-slate-850 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all dark:text-slate-200"
          />
        </div>

        <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
          <div className="flex items-center space-x-1.5">
            <span className="text-slate-400 font-semibold">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-50 dark:bg-slate-900 border border-slate-150 dark:border-slate-850 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-violet-500 font-medium dark:text-slate-200"
            >
              <option value="All">All Invoices</option>
              <option value="Completed">Completed</option>
              <option value="Refunded">Refunded (Voided)</option>
            </select>
          </div>

          <div className="flex items-center space-x-1.5">
            <span className="text-slate-400 font-semibold">Sort By:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-slate-50 dark:bg-slate-900 border border-slate-150 dark:border-slate-850 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-violet-500 font-medium dark:text-slate-200"
            >
              <option value="date-desc">Date (Newest First)</option>
              <option value="date-asc">Date (Oldest First)</option>
              <option value="total-desc">Total (High to Low)</option>
              <option value="total-asc">Total (Low to High)</option>
              <option value="client-name">Client Name</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/60 text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                <th className="p-4 pl-6">Invoice ID</th>
                <th className="p-4">Date & Time</th>
                <th className="p-4">Client Name</th>
                <th className="p-4 text-center">Items Bought</th>
                <th className="p-4 text-right">Payment</th>
                <th className="p-4 text-right">Invoice Total</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4 text-center pr-6">Action</th>
              </tr>
            </thead>
            <tbody className="text-xs text-slate-650 dark:text-slate-350 divide-y divide-slate-100 dark:divide-slate-800">
              {filteredSales.map((sale) => {
                const totalQty = sale.items.reduce((sum, item) => sum + item.quantity, 0);
                const orderDate = new Date(sale.date);

                return (
                  <tr key={sale.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors">
                    <td className="p-4 pl-6 font-mono font-bold text-slate-800 dark:text-slate-200">{sale.id}</td>
                    <td className="p-4 text-slate-400 dark:text-slate-500">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>{orderDate.toLocaleDateString()} {orderDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </td>
                    <td className="p-4 font-semibold text-slate-750 dark:text-slate-300">
                      {sale.customerName}
                      {sale.customerPhone && <div className="text-[10px] text-slate-400 font-mono mt-0.5">{sale.customerPhone}</div>}
                    </td>
                    <td className="p-4 text-center font-semibold font-mono">{totalQty}</td>
                    <td className="p-4 text-right font-medium">
                      <span className="inline-flex items-center text-[10px] bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded-full font-bold">
                        {sale.paymentMethod}
                      </span>
                    </td>
                    <td className="p-4 text-right font-bold font-mono text-slate-800 dark:text-slate-100">₹{sale.total.toFixed(2)}</td>
                    <td className="p-4 text-center">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        sale.status === 'Completed'
                          ? 'bg-emerald-500/10 text-emerald-650 dark:text-emerald-400'
                          : 'bg-rose-500/10 text-rose-650 dark:text-rose-450'
                      }`}>
                        {sale.status}
                      </span>
                    </td>
                    <td className="p-4 text-center pr-6">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => { setSelectedInvoice(sale); setIsEditing(false); }}
                          className="flex items-center space-x-1.5 px-2 py-1 rounded bg-slate-100 dark:bg-slate-900 text-slate-655 hover:text-slate-800 dark:text-slate-300 dark:hover:text-white transition-colors"
                          title="View Invoice Detail"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View</span>
                        </button>
                        {sale.status === 'Completed' && (
                          <button
                            onClick={() => handleRefund(sale.id)}
                            className="p-1 rounded text-rose-500 hover:bg-rose-500/10 transition-colors"
                            title="Refund Sale"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredSales.length === 0 && (
                <tr>
                  <td colSpan="8" className="p-12 text-center text-slate-400 text-sm">
                    No matching sales history found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>      {/* Invoice Details Modal */}
      {selectedInvoice && (() => {
        const subtotal = selectedInvoice.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
        const discountAmount = subtotal * (selectedInvoice.discount / 100);

        return (
          <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-[2px] flex items-center justify-center z-50 animate-fade-in">
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-2xl max-w-xl w-full overflow-hidden transform scale-100 transition-all text-sm">
              
              {/* Modal Title bar */}
              <div className="p-4.5 border-b border-slate-100 dark:border-slate-700/60 flex justify-between items-center bg-slate-50 dark:bg-slate-900/60">
                <span className="flex items-center space-x-1.5 font-bold text-slate-750 dark:text-slate-200 text-sm">
                  <Receipt className="w-5 h-5 text-violet-500" />
                  <span>{isEditing ? 'Manual Bill Editor' : 'Invoice Details'}</span>
                </span>
                <div className="flex items-center space-x-2">
                  {!isEditing && selectedInvoice.status === 'Completed' && (
                    <button
                      onClick={startEditing}
                      className="flex items-center space-x-1 bg-violet-600 hover:bg-violet-750 text-white font-bold text-[10px] px-2.5 py-1.5 rounded-lg cursor-pointer transition-colors"
                      title="Edit Bill Details"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>Edit Bill</span>
                    </button>
                  )}
                  <button 
                    onClick={() => { setSelectedInvoice(null); setIsEditing(false); }}
                    className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4 text-slate-450" />
                  </button>
                </div>
              </div>

              {isEditing && editForm ? (
                /* EDIT MODE FORM */
                <form onSubmit={handleSaveEdit} className="p-6 space-y-5">
                  {/* Shop Details */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="font-semibold text-slate-650 dark:text-slate-400 block text-xs">Shop / Agency Name</label>
                      <input
                        type="text"
                        required
                        value={editForm.shopName}
                        onChange={(e) => setEditForm({ ...editForm, shopName: e.target.value })}
                        className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-150 dark:border-slate-850 rounded-xl focus:outline-none focus:ring-1 focus:ring-violet-500 font-medium text-xs dark:text-slate-200"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-semibold text-slate-650 dark:text-slate-400 block text-xs">Date & Time</label>
                      <input
                        type="datetime-local"
                        required
                        value={editForm.dateLocal}
                        onChange={(e) => setEditForm({ ...editForm, dateLocal: e.target.value })}
                        className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-150 dark:border-slate-855 rounded-xl focus:outline-none focus:ring-1 focus:ring-violet-500 font-medium text-xs dark:text-slate-200"
                      />
                    </div>
                  </div>

                  {/* Customer Billing Details */}
                  <div className="grid grid-cols-3 gap-4 text-xs">
                    <div className="space-y-1">
                      <label className="font-semibold text-slate-650 dark:text-slate-400 block text-xs">Billed To (Client)</label>
                      <input
                        type="text"
                        required
                        value={editForm.customerName}
                        onChange={(e) => setEditForm({ ...editForm, customerName: e.target.value })}
                        className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-150 dark:border-slate-850 rounded-xl focus:outline-none focus:ring-1 focus:ring-violet-500 font-medium text-xs dark:text-slate-200"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-semibold text-slate-650 dark:text-slate-400 block text-xs">Phone Number</label>
                      <input
                        type="text"
                        value={editForm.customerPhone || ''}
                        onChange={(e) => setEditForm({ ...editForm, customerPhone: e.target.value })}
                        className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-150 dark:border-slate-850 rounded-xl focus:outline-none focus:ring-1 focus:ring-violet-500 font-medium text-xs dark:text-slate-200"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-semibold text-slate-650 dark:text-slate-400 block text-xs">Payment Method</label>
                      <select
                        value={editForm.paymentMethod}
                        onChange={(e) => setEditForm({ ...editForm, paymentMethod: e.target.value })}
                        className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-150 dark:border-slate-850 rounded-xl focus:outline-none focus:ring-1 focus:ring-violet-500 font-medium text-xs dark:text-slate-200"
                      >
                        <option value="UPI">UPI</option>
                        <option value="Cash">Cash</option>
                        <option value="Card">Card</option>
                      </select>
                    </div>
                  </div>

                  {/* Items Ledger Table inputs */}
                  <div className="space-y-2">
                    <div className="font-semibold text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider">Edit Bill Items</div>
                    <div className="border border-slate-100 dark:border-slate-750 rounded-xl overflow-hidden text-xs max-h-40 overflow-y-auto">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="bg-slate-50 dark:bg-slate-900/60 text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase border-b border-slate-100 dark:border-slate-800 sticky top-0">
                            <th className="p-2 pl-3">Description / Name</th>
                            <th className="p-2 text-center w-16">Qty</th>
                            <th className="p-2 text-right w-24">Price (₹)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                          {editForm.items.map((item, idx) => (
                            <tr key={idx}>
                              <td className="p-2 pl-3 font-sans font-medium text-slate-800 dark:text-slate-200">
                                <input
                                  type="text"
                                  required
                                  value={item.name}
                                  onChange={(e) => handleItemChange(idx, 'name', e.target.value)}
                                  className="w-full p-1.5 bg-white dark:bg-slate-950 border border-slate-150 dark:border-slate-800 rounded focus:outline-none focus:ring-1 focus:ring-violet-500 font-sans text-xs dark:text-slate-200"
                                />
                              </td>
                              <td className="p-2 text-center">
                                <input
                                  type="number"
                                  min="1"
                                  required
                                  value={item.quantity}
                                  onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                                  className="w-12 p-1.5 text-center bg-white dark:bg-slate-955 border border-slate-150 dark:border-slate-800 rounded focus:outline-none focus:ring-1 focus:ring-violet-500 font-mono text-xs font-bold dark:text-slate-200"
                                />
                              </td>
                              <td className="p-2 text-right">
                                <input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  required
                                  value={item.price}
                                  onChange={(e) => handleItemChange(idx, 'price', e.target.value)}
                                  className="w-20 p-1.5 text-right bg-white dark:bg-slate-955 border border-slate-150 dark:border-slate-800 rounded focus:outline-none focus:ring-1 focus:ring-violet-500 font-mono text-xs dark:text-slate-200"
                                />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Calculations and totals preview */}
                  <div className="border-t border-dashed border-slate-200 dark:border-slate-750 pt-3.5 flex flex-col items-end space-y-1.5 text-xs">
                    <div className="w-64 flex justify-between text-slate-500 font-medium">
                      <span>Recalculated Subtotal:</span>
                      <span className="font-mono">₹{editForm.items.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)}</span>
                    </div>
                    {editForm.discount > 0 && (
                      <div className="w-64 flex justify-between text-rose-500 font-medium">
                        <span>Discount ({editForm.discount}%):</span>
                        <span className="font-mono">-₹{(editForm.items.reduce((sum, item) => sum + item.price * item.quantity, 0) * (editForm.discount / 100)).toFixed(2)}</span>
                      </div>
                    )}
                    <div className="w-64 flex justify-between font-bold text-slate-850 dark:text-white text-sm border-t border-slate-100 dark:border-slate-800 pt-2">
                      <span>Updated Net Total:</span>
                      <span className="font-mono text-violet-650 dark:text-violet-400">₹{editForm.total.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-3 pt-3 border-t border-slate-100 dark:border-slate-700 mt-3.5 bg-white dark:bg-slate-800">
                    <button
                      type="button"
                      onClick={() => { setIsEditing(false); setEditForm(null); }}
                      className="flex-1 border border-slate-250 dark:border-slate-700 py-2.5 rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-slate-900/60 dark:text-slate-300 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 flex items-center justify-center space-x-1.5 bg-violet-650 hover:bg-violet-750 text-white font-bold py-2.5 rounded-xl cursor-pointer transition-colors"
                    >
                      <Save className="w-4 h-4" />
                      <span>Save Changes</span>
                    </button>
                  </div>
                </form>
              ) : (
                /* READ-ONLY RECEIPT VIEW */
                <div className="p-6 space-y-6">
                  {/* Receipt Header */}
                  <div className="flex justify-between items-start border-b border-dashed border-slate-200 dark:border-slate-700 pb-4">
                    <div className="space-y-1">
                      <h4 className="font-bold text-slate-855 dark:text-slate-100 text-sm">
                        {selectedInvoice.shopName || shopDetails.name || 'Gokulam Agency'}
                      </h4>
                      <p className="text-xs text-slate-405 dark:text-slate-500">
                        {selectedInvoice.shopAddress || shopDetails.address || '123 Market Square, Metro Plaza'}
                      </p>
                      <p className="text-xs text-slate-400 dark:text-slate-500 font-mono">
                        Phone: {selectedInvoice.shopPhone || shopDetails.phone || '+91 98765 43210'}
                        {(selectedInvoice.shopEmail || shopDetails.email) ? ` | ${selectedInvoice.shopEmail || shopDetails.email}` : ''}
                      </p>
                    </div>
                    <div className="text-right space-y-1.5">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        selectedInvoice.status === 'Completed'
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          : 'bg-rose-500/10 text-rose-600'
                      }`}>
                        {selectedInvoice.status}
                      </span>
                      <p className="font-mono font-bold text-slate-800 dark:text-white text-sm">{selectedInvoice.id}</p>
                      <p className="text-[11px] text-slate-450 dark:text-slate-500">{new Date(selectedInvoice.date).toLocaleString()}</p>
                    </div>
                  </div>

                  {/* Customer billing details */}
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div className="space-y-0.5">
                      <p className="text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-wider">Billed To</p>
                      <p className="font-bold text-slate-750 dark:text-slate-350">{selectedInvoice.customerName}</p>
                      {selectedInvoice.customerPhone && (
                        <p className="text-[11px] text-slate-455 dark:text-slate-500 font-mono">{selectedInvoice.customerPhone}</p>
                      )}
                    </div>
                    <div className="text-right space-y-0.5">
                      <p className="text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-wider">Payment Info</p>
                      <p className="font-bold text-slate-750 dark:text-slate-300">{selectedInvoice.paymentMethod}</p>
                      <p className="text-[11px] text-slate-450 dark:text-slate-500">Transaction Mode</p>
                    </div>
                  </div>

                  {/* Cart Table */}
                  <div className="space-y-2">
                    <div className="font-semibold text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider">Items Ledger</div>
                    <div className="border border-slate-100 dark:border-slate-750 rounded-xl overflow-hidden text-xs">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="bg-slate-50 dark:bg-slate-900/60 text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase border-b border-slate-100 dark:border-slate-800">
                            <th className="p-3">Item Description</th>
                            <th className="p-3 text-center">Qty</th>
                            <th className="p-3 text-right">Price</th>
                            <th className="p-3 text-right">Total</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono text-xs text-slate-655 dark:text-slate-350">
                          {selectedInvoice.items.map((item, idx) => (
                            <tr key={idx}>
                              <td className="p-3 font-sans font-medium text-slate-800 dark:text-slate-200">
                                <div>{item.name}</div>
                                <div className="text-[10px] text-slate-400 dark:text-slate-500 font-mono mt-0.5">{item.sku}</div>
                              </td>
                              <td className="p-3 text-center font-bold">{item.quantity}</td>
                              <td className="p-3 text-right">₹{item.price.toFixed(2)}</td>
                              <td className="p-3 text-right font-bold text-slate-750 dark:text-slate-200">₹{(item.price * item.quantity).toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Billing totals footer */}
                  <div className="border-t border-dashed border-slate-200 dark:border-slate-750 pt-4 flex flex-col items-end space-y-2 text-xs">
                    <div className="w-64 flex justify-between text-slate-500 dark:text-slate-400 font-medium">
                      <span>Gross Subtotal:</span>
                      <span className="font-mono">₹{subtotal.toFixed(2)}</span>
                    </div>
                    {selectedInvoice.discount > 0 && (
                      <div className="w-64 flex justify-between text-rose-500 font-medium">
                        <span>Discount Value ({selectedInvoice.discount}%):</span>
                        <span className="font-mono">-₹{discountAmount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="w-64 flex justify-between font-bold text-slate-850 dark:text-white text-sm border-t border-slate-100 dark:border-slate-800 pt-2.5">
                      <span>Invoice Net Paid:</span>
                      <span className="font-mono text-violet-650 dark:text-violet-400">₹{selectedInvoice.total.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-3 pt-3 border-t border-slate-100 dark:border-slate-755 mt-4 bg-white dark:bg-slate-800">
                    {selectedInvoice.status === 'Completed' ? (
                      <button
                        onClick={() => handleRefund(selectedInvoice.id)}
                        className="flex-1 flex items-center justify-center space-x-1.5 bg-rose-500 hover:bg-rose-600 text-white font-bold py-2.5 rounded-xl cursor-pointer"
                      >
                        <RotateCcw className="w-4 h-4" />
                        <span>Void & Refund Invoice</span>
                      </button>
                    ) : (
                      <div className="flex-1 flex items-center justify-center space-x-1.5 p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-400 font-medium rounded-xl">
                        <AlertTriangle className="w-4 h-4 text-slate-450" />
                        <span>Invoice Refund Completed</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })()}
    </div>
  );
}

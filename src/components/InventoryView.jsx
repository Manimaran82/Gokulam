import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  AlertTriangle,
  Filter,
  X
} from 'lucide-react';

export default function InventoryView() {
  const { products, addProduct, editProduct, deleteProduct, adjustStock, distributors } = useShop();

  // State
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [stockStatusFilter, setStockStatusFilter] = useState('All'); // 'All' | 'Low Stock' | 'Out of Stock'
  
  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Form states
  const emptyForm = { sku: '', name: '', category: '', cost: '', price: '', stock: '', minStock: '', supplier: '' };
  const [formData, setFormData] = useState(emptyForm);

  // Extract categories
  const categories = ['All', ...new Set(products.map(p => p.category))];

  // Filtering
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || 
                          p.sku.toLowerCase().includes(search.toLowerCase()) ||
                          (p.supplier && p.supplier.toLowerCase().includes(search.toLowerCase()));
    
    const matchesCategory = categoryFilter === 'All' || p.category === categoryFilter;
    
    let matchesStatus = true;
    if (stockStatusFilter === 'Low Stock') {
      matchesStatus = p.stock <= p.minStock && p.stock > 0;
    } else if (stockStatusFilter === 'Out of Stock') {
      matchesStatus = p.stock <= 0;
    }

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Handle Add Product Submit
  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.sku || !formData.price || !formData.cost) {
      alert('Please fill out all required fields (Name, SKU, Cost, Price).');
      return;
    }
    addProduct(formData);
    setFormData(emptyForm);
    setIsAddModalOpen(false);
  };

  // Handle Edit Product Submit
  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.sku || !formData.price || !formData.cost) {
      alert('Please fill out all required fields.');
      return;
    }
    editProduct(formData);
    setEditingProduct(null);
    setFormData(emptyForm);
  };

  // Open Edit Modal
  const startEdit = (product) => {
    setEditingProduct(product);
    setFormData(product);
  };

  // Quick restock / adjust handler
  const handleQuickAdjust = (productId, amount) => {
    adjustStock(productId, amount);
  };

  // Delete handler
  const handleDelete = (id, name) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      deleteProduct(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Stock & Inventory</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Monitor stock levels, manage reorder parameters, and update details.</p>
        </div>
        <button
          onClick={() => { setFormData(emptyForm); setIsAddModalOpen(true); }}
          className="flex items-center space-x-2 bg-violet-650 hover:bg-violet-750 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-violet-650/15 cursor-pointer transition-all duration-200"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Filters and Search Bar */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between text-xs">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, SKU or supplier..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-150 dark:border-slate-850 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-505 transition-all dark:text-slate-200"
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
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Stock Status Filter */}
          <div className="flex items-center space-x-1.5 w-full sm:w-auto">
            <span className="text-slate-400 font-semibold">Status:</span>
            <select
              value={stockStatusFilter}
              onChange={(e) => setStockStatusFilter(e.target.value)}
              className="bg-slate-50 dark:bg-slate-900 border border-slate-150 dark:border-slate-850 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-violet-500 font-medium dark:text-slate-200"
            >
              <option value="All">All Stock Levels</option>
              <option value="Low Stock">Low Stock Alerts</option>
              <option value="Out of Stock">Out of Stock</option>
            </select>
          </div>
        </div>
      </div>

      {/* Inventory Table Container */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/60 text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                <th className="p-4 pl-6">SKU / Code</th>
                <th className="p-4">Product Name</th>
                <th className="p-4">Category</th>
                <th className="p-4 text-center">Stock Level</th>
                <th className="p-4 text-right">Cost Price</th>
                <th className="p-4 text-right">Retail Price</th>
                <th className="p-4 text-right">Markup %</th>
                <th className="p-4 pl-8">Supplier</th>
                <th className="p-4 text-center pr-6">Actions</th>
              </tr>
            </thead>
            <tbody className="text-xs text-slate-650 dark:text-slate-350 divide-y divide-slate-100 dark:divide-slate-800">
              {filteredProducts.map((prod) => {
                const isOutOfStock = prod.stock <= 0;
                const isLowStock = prod.stock > 0 && prod.stock <= prod.minStock;
                const markup = prod.cost > 0 ? ((prod.price - prod.cost) / prod.cost) * 100 : 0;

                return (
                  <tr 
                    key={prod.id} 
                    className={`hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors ${
                      isOutOfStock 
                        ? 'bg-rose-50/10 dark:bg-rose-950/[0.03]' 
                        : isLowStock 
                          ? 'bg-amber-50/15 dark:bg-amber-950/[0.03]' 
                          : ''
                    }`}
                  >
                    <td className="p-4 pl-6 font-mono font-bold text-slate-750 dark:text-slate-200">{prod.sku}</td>
                    <td className="p-4">
                      <div className="font-bold text-slate-800 dark:text-slate-100">{prod.name}</div>
                      {isLowStock && (
                        <span className="inline-flex items-center text-[9px] font-bold text-amber-600 dark:text-amber-500 mt-0.5">
                          <AlertTriangle className="w-2.5 h-2.5 mr-0.5" /> Reorder limit: {prod.minStock} units
                        </span>
                      )}
                      {isOutOfStock && (
                        <span className="inline-flex items-center text-[9px] font-bold text-rose-600 dark:text-rose-400 mt-0.5">
                          <AlertTriangle className="w-2.5 h-2.5 mr-0.5" /> Replenish immediately
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      <span className="bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded-full font-bold text-[9px] uppercase tracking-wider">
                        {prod.category}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center space-x-2">
                        {/* Minus 10 */}
                        <button 
                          onClick={() => handleQuickAdjust(prod.id, -5)}
                          className="px-1.5 py-0.5 rounded text-[10px] font-bold text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900"
                          title="Reduce by 5"
                        >
                          -5
                        </button>
                        
                        <span className={`px-2.5 py-1 rounded-lg font-bold font-mono text-center min-w-[3.5rem] text-xs ${
                          isOutOfStock 
                            ? 'bg-rose-500/10 text-rose-650 dark:text-rose-400' 
                            : isLowStock 
                              ? 'bg-amber-500/10 text-amber-650 dark:text-amber-400 animate-pulse' 
                              : 'bg-emerald-500/10 text-emerald-650 dark:text-emerald-400'
                        }`}>
                          {prod.stock}
                        </span>

                        {/* Plus 10 */}
                        <button 
                          onClick={() => handleQuickAdjust(prod.id, 5)}
                          className="px-1.5 py-0.5 rounded text-[10px] font-bold text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900"
                          title="Restock by 5"
                        >
                          +5
                        </button>
                      </div>
                    </td>
                    <td className="p-4 text-right font-semibold font-mono">₹{prod.cost.toFixed(2)}</td>
                    <td className="p-4 text-right font-semibold font-mono text-slate-800 dark:text-slate-100">₹{prod.price.toFixed(2)}</td>
                    <td className="p-4 text-right font-mono text-emerald-500">+{markup.toFixed(0)}%</td>
                    <td className="p-4 pl-8 text-slate-400 dark:text-slate-500">{prod.supplier || '—'}</td>
                    <td className="p-4 text-center pr-6">
                      <div className="flex items-center justify-center space-x-1.5">
                        <button 
                          onClick={() => startEdit(prod)}
                          className="p-1.5 text-slate-400 hover:text-slate-850 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-lg transition-colors"
                          title="Edit product"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => handleDelete(prod.id, prod.name)}
                          className="p-1.5 text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors"
                          title="Delete product"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan="9" className="p-12 text-center text-slate-400 text-sm">
                    No items found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add & Edit Modal */}
      {(isAddModalOpen || editingProduct) && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-[2px] flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-2xl max-w-md w-full overflow-hidden transform scale-100 transition-all">
            <div className="p-5 border-b border-slate-100 dark:border-slate-700/60 flex justify-between items-center bg-slate-50 dark:bg-slate-900/60">
              <h3 className="font-bold text-slate-800 dark:text-white">
                {isAddModalOpen ? 'Add New Product' : `Edit Product: ${editingProduct?.name}`}
              </h3>
              <button 
                onClick={() => { setIsAddModalOpen(false); setEditingProduct(null); }}
                className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg"
              >
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            <form onSubmit={isAddModalOpen ? handleAddSubmit : handleEditSubmit} className="p-5 space-y-4 text-xs">
              {/* Product SKU and Name */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-650 dark:text-slate-400 block">SKU Code *</label>
                  <input
                    type="text"
                    required
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value.toUpperCase() })}
                    placeholder="e.g. ELE-WCH-011"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-150 dark:border-slate-850 rounded-xl focus:outline-none focus:ring-1 focus:ring-violet-500 font-medium dark:text-slate-200"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-650 dark:text-slate-400 block">Product Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Wired Headphones USB"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-150 dark:border-slate-850 rounded-xl focus:outline-none focus:ring-1 focus:ring-violet-500 font-medium dark:text-slate-200"
                  />
                </div>
              </div>

              {/* Category and Supplier */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-650 dark:text-slate-400 block">Category *</label>
                  <input
                    type="text"
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="e.g. Electronics"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-150 dark:border-slate-850 rounded-xl focus:outline-none focus:ring-1 focus:ring-violet-500 font-medium dark:text-slate-200"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-650 dark:text-slate-400 block">Supplier Name</label>
                  <select
                    value={formData.supplier}
                    onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-150 dark:border-slate-850 rounded-xl focus:outline-none focus:ring-1 focus:ring-violet-500 font-medium dark:text-slate-200"
                  >
                    <option value="">No Distributor Assigned</option>
                    {distributors
                      .filter(d => d.status === 'Active' || d.name === formData.supplier)
                      .map(d => (
                        <option key={d.id} value={d.name}>{d.name}</option>
                      ))}
                  </select>
                </div>
              </div>

              {/* Cost, Price, Stock, minStock */}
              <div className="grid grid-cols-4 gap-2.5">
                <div className="space-y-1 col-span-2">
                  <label className="font-semibold text-slate-650 dark:text-slate-400 block">Cost Price (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={formData.cost}
                    onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                    placeholder="0.00"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-150 dark:border-slate-850 rounded-xl focus:outline-none focus:ring-1 focus:ring-violet-500 font-medium dark:text-slate-200"
                  />
                </div>
                <div className="space-y-1 col-span-2">
                  <label className="font-semibold text-slate-650 dark:text-slate-400 block">Retail Price (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="0.00"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-150 dark:border-slate-850 rounded-xl focus:outline-none focus:ring-1 focus:ring-violet-500 font-medium dark:text-slate-200"
                  />
                </div>

                <div className="space-y-1 col-span-2">
                  <label className="font-semibold text-slate-650 dark:text-slate-400 block">Initial Stock</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    placeholder="0"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-150 dark:border-slate-850 rounded-xl focus:outline-none focus:ring-1 focus:ring-violet-500 font-medium dark:text-slate-200"
                  />
                </div>
                <div className="space-y-1 col-span-2">
                  <label className="font-semibold text-slate-650 dark:text-slate-400 block">Reorder Level</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.minStock}
                    onChange={(e) => setFormData({ ...formData, minStock: e.target.value })}
                    placeholder="e.g. 5"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-150 dark:border-slate-850 rounded-xl focus:outline-none focus:ring-1 focus:ring-violet-500 font-medium dark:text-slate-200"
                  />
                </div>
              </div>

              {/* Form Buttons */}
              <div className="flex space-x-3 pt-3 border-t border-slate-100 dark:border-slate-700/60 mt-4 bg-white dark:bg-slate-800">
                <button
                  type="button"
                  onClick={() => { setIsAddModalOpen(false); setEditingProduct(null); }}
                  className="flex-1 border border-slate-150 dark:border-slate-700 py-2.5 rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-slate-900/60 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-violet-600 hover:bg-violet-750 text-white font-bold py-2.5 rounded-xl cursor-pointer"
                >
                  {isAddModalOpen ? 'Create Product' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

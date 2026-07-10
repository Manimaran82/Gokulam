import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Phone, 
  Mail, 
  MapPin, 
  User, 
  X, 
  Building
} from 'lucide-react';

export default function DistributorsView() {
  const { distributors, addDistributor, editDistributor, deleteDistributor, products } = useShop();

  // Search & Filter
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All'); // 'All' | 'Active' | 'Inactive'

  // Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingDistributor, setEditingDistributor] = useState(null);

  // Form states
  const emptyForm = { name: '', contactName: '', phone: '', email: '', address: '', category: 'Electronics', status: 'Active' };
  const [formData, setFormData] = useState(emptyForm);

  // Dynamic categories list (default categories + any manually entered ones)
  const defaultCategories = ['Electronics', 'Accessories', 'Office', 'Kitchenware', 'Other'];
  const categories = Array.from(
    new Set([...defaultCategories, ...distributors.map(d => d.category)])
  );

  // Filters logic
  const filteredDistributors = distributors.filter(dist => {
    const matchesSearch = dist.name.toLowerCase().includes(search.toLowerCase()) || 
                          dist.contactName.toLowerCase().includes(search.toLowerCase()) ||
                          dist.category.toLowerCase().includes(search.toLowerCase()) ||
                          (dist.email && dist.email.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus = statusFilter === 'All' || dist.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.contactName || !formData.phone) {
      alert('Please fill out Name, Contact Person, and Phone.');
      return;
    }
    addDistributor(formData);
    setFormData(emptyForm);
    setIsAddModalOpen(false);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.contactName || !formData.phone) {
      alert('Please fill out Name, Contact Person, and Phone.');
      return;
    }
    editDistributor(formData);
    setEditingDistributor(null);
    setFormData(emptyForm);
  };

  const startEdit = (dist) => {
    setEditingDistributor(dist);
    setFormData(dist);
  };

  const handleDelete = (id, name) => {
    // Count how many products are linked to this distributor
    const linkedProducts = products.filter(p => p.supplier === name);
    let confirmMsg = `Are you sure you want to delete distributor "${name}"?`;
    if (linkedProducts.length > 0) {
      confirmMsg = `Distributor "${name}" is supplying ${linkedProducts.length} product(s) in your inventory. Deleting this distributor will leave those products supplier-less. Are you sure you want to proceed?`;
    }

    if (window.confirm(confirmMsg)) {
      deleteDistributor(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Distributors Management</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Add and view wholesale distributor info, contact details, and link them to shop inventories.</p>
        </div>
        <button
          onClick={() => { setFormData(emptyForm); setIsAddModalOpen(true); }}
          className="flex items-center space-x-2 bg-violet-650 hover:bg-violet-750 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-violet-650/15 cursor-pointer transition-all duration-200"
        >
          <Plus className="w-4 h-4" />
          <span>Add Distributor</span>
        </button>
      </div>

      {/* Filters ledger */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between text-xs">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by distributor name, contact or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-150 dark:border-slate-850 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-550 transition-all dark:text-slate-200"
          />
        </div>

        <div className="flex items-center space-x-1.5 w-full md:w-auto">
          <span className="text-slate-400 font-semibold">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 dark:bg-slate-900 border border-slate-150 dark:border-slate-850 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-violet-500 font-medium dark:text-slate-200"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active Suppliers</option>
            <option value="Inactive">Inactive Suppliers</option>
          </select>
        </div>
      </div>

      {/* Distributors Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredDistributors.map((dist) => {
          const suppliedCount = products.filter(p => p.supplier === dist.name).length;
          
          return (
            <div 
              key={dist.id} 
              className={`bg-white dark:bg-slate-800 rounded-2xl border p-5 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between ${
                dist.status === 'Inactive' 
                  ? 'border-slate-200/60 dark:border-slate-800 opacity-70' 
                  : 'border-slate-100 dark:border-slate-700/80'
              }`}
            >
              <div>
                {/* Card Title & Status Tag */}
                <div className="flex justify-between items-start mb-4">
                  <div className="space-y-1">
                    <span className="bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded-full font-bold text-[9px] uppercase tracking-wider">
                      {dist.category}
                    </span>
                    <h4 className="font-bold text-slate-800 dark:text-white text-base leading-tight mt-1">{dist.name}</h4>
                  </div>
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold ${
                    dist.status === 'Active'
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                      : 'bg-slate-100 dark:bg-slate-900 text-slate-400 dark:text-slate-500'
                  }`}>
                    {dist.status}
                  </span>
                </div>

                {/* Details Section */}
                <div className="space-y-2.5 text-xs text-slate-600 dark:text-slate-400">
                  {/* Contact Person */}
                  <div className="flex items-center space-x-2">
                    <User className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span className="font-semibold text-slate-750 dark:text-slate-300">{dist.contactName}</span>
                    <span className="text-[10px] text-slate-400 font-medium">(Rep)</span>
                  </div>

                  {/* Phone */}
                  <div className="flex items-center space-x-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span className="font-mono">{dist.phone}</span>
                  </div>

                  {/* Email */}
                  {dist.email && (
                    <div className="flex items-center space-x-2 truncate">
                      <Mail className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <a href={`mailto:${dist.email}`} className="hover:text-violet-600 dark:hover:text-violet-400 font-mono transition-colors">{dist.email}</a>
                    </div>
                  )}

                  {/* Address */}
                  {dist.address && (
                    <div className="flex items-start space-x-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
                      <span className="leading-relaxed line-clamp-2">{dist.address}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Card Footer actions */}
              <div className="border-t border-slate-100 dark:border-slate-700/60 pt-3.5 mt-4 flex items-center justify-between text-xs">
                <span className="text-[10px] text-slate-400 font-semibold bg-slate-50 dark:bg-slate-900 px-2.5 py-1 rounded-lg">
                  {suppliedCount} Active Products
                </span>
                
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => startEdit(dist)}
                    className="p-1.5 text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-lg transition-colors"
                    title="Edit Distributor"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(dist.id, dist.name)}
                    className="p-1.5 text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors"
                    title="Delete Distributor"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
        {filteredDistributors.length === 0 && (
          <div className="col-span-full py-16 text-center text-slate-400 text-sm bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-750 flex flex-col items-center justify-center">
            <Building className="w-10 h-10 text-slate-300 dark:text-slate-650 mb-2" />
            <span>No distributors found matching filters.</span>
          </div>
        )}
      </div>

      {/* Add / Edit Form Modal */}
      {(isAddModalOpen || editingDistributor) && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-[2px] flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-2xl max-w-sm w-full overflow-hidden transform scale-100 transition-all">
            <div className="p-4 border-b border-slate-100 dark:border-slate-700/60 flex justify-between items-center bg-slate-50 dark:bg-slate-900/60">
              <h3 className="font-bold text-slate-800 dark:text-white text-xs">
                {isAddModalOpen ? 'Add New Distributor' : 'Edit Distributor Details'}
              </h3>
              <button 
                onClick={() => { setIsAddModalOpen(false); setEditingDistributor(null); }}
                className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg"
              >
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            <form onSubmit={isAddModalOpen ? handleAddSubmit : handleEditSubmit} className="p-5 space-y-4 text-xs">
              {/* Name */}
              <div className="space-y-1">
                <label className="font-semibold text-slate-650 dark:text-slate-400 block">Distributor Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Acoustic Labs Inc"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-150 dark:border-slate-850 rounded-xl focus:outline-none focus:ring-1 focus:ring-violet-500 font-medium dark:text-slate-200"
                />
              </div>

              {/* Contact Person */}
              <div className="space-y-1">
                <label className="font-semibold text-slate-650 dark:text-slate-400 block">Contact Representative *</label>
                <input
                  type="text"
                  required
                  value={formData.contactName}
                  onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                  placeholder="e.g. Robert Vance"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-150 dark:border-slate-850 rounded-xl focus:outline-none focus:ring-1 focus:ring-violet-500 font-medium dark:text-slate-200"
                />
              </div>

              {/* Phone and Email */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-650 dark:text-slate-400 block">Phone *</label>
                  <input
                    type="text"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="e.g. 555-0101"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-150 dark:border-slate-850 rounded-xl focus:outline-none focus:ring-1 focus:ring-violet-500 font-medium dark:text-slate-200"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-650 dark:text-slate-400 block">Email Address</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="e.g. rep@dist.com"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-150 dark:border-slate-850 rounded-xl focus:outline-none focus:ring-1 focus:ring-violet-500 font-medium dark:text-slate-200"
                  />
                </div>
              </div>

              {/* Address */}
              <div className="space-y-1">
                <label className="font-semibold text-slate-650 dark:text-slate-400 block">Physical Address</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="e.g. 100 Soundwave Blvd, Austin, TX"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-150 dark:border-slate-850 rounded-xl focus:outline-none focus:ring-1 focus:ring-violet-500 font-medium dark:text-slate-200"
                />
              </div>

              {/* Category and Status */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-650 dark:text-slate-400 block">Main Category *</label>
                  <input
                    type="text"
                    list="distributor-categories"
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="e.g. Electronics, Groceries..."
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-150 dark:border-slate-850 rounded-xl focus:outline-none focus:ring-1 focus:ring-violet-500 font-medium dark:text-slate-200"
                  />
                  <datalist id="distributor-categories">
                    {categories.map(cat => (
                      <option key={cat} value={cat} />
                    ))}
                  </datalist>
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-650 dark:text-slate-400 block">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-150 dark:border-slate-850 rounded-xl focus:outline-none focus:ring-1 focus:ring-violet-500 font-medium dark:text-slate-200"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex space-x-3 pt-3 border-t border-slate-100 dark:border-slate-700/60 mt-4 bg-white dark:bg-slate-800">
                <button
                  type="button"
                  onClick={() => { setIsAddModalOpen(false); setEditingDistributor(null); }}
                  className="flex-1 border border-slate-150 dark:border-slate-700 py-2.5 rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-slate-900/60 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-violet-600 hover:bg-violet-750 text-white font-bold py-2.5 rounded-xl cursor-pointer"
                >
                  {isAddModalOpen ? 'Create Distributor' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

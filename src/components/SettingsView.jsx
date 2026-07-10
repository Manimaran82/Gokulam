import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { 
  Save, 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  CheckCircle,
  ShieldCheck
} from 'lucide-react';

export default function SettingsView() {
  const { shopDetails, updateShopDetails } = useShop();

  const [formData, setFormData] = useState({
    name: shopDetails.name || 'Gokulam Agency',
    address: shopDetails.address || '',
    phone: shopDetails.phone || '',
    email: shopDetails.email || ''
  });

  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim() || !formData.address.trim()) {
      alert('Please fill out Shop Name, Address, and Phone Number.');
      return;
    }
    updateShopDetails(formData);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto animate-fade-in">
      {/* Top Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Agency Administration</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm">Configure store names, contact records, and locations printed on sales transaction receipts.</p>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
        {/* Banner header inside card */}
        <div className="p-6 bg-slate-50 dark:bg-slate-900/60 border-b border-slate-100 dark:border-slate-750 flex items-center space-x-3.5">
          <div className="p-3 bg-violet-500/10 rounded-xl text-violet-650 dark:text-violet-400">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm">Receipt Header Configurations</h4>
            <p className="text-slate-400 dark:text-slate-500 text-xs">These details dynamically populate the header of invoices and checkout slips.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 text-xs">
          {/* Shop Name */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-655 dark:text-slate-400 block text-xs">Agency / Shop Name *</label>
            <div className="relative">
              <Building2 className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Gokulam Agency"
                className="w-full pl-9 pr-3 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-150 dark:border-slate-850 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-550 transition-all dark:text-slate-200 font-medium text-xs"
              />
            </div>
          </div>

          {/* Shop Address */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-655 dark:text-slate-400 block text-xs">Physical Shop Address *</label>
            <div className="relative">
              <MapPin className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
              <input
                type="text"
                required
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="e.g. 123 Market Square, Metro Plaza"
                className="w-full pl-9 pr-3 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-150 dark:border-slate-850 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-550 transition-all dark:text-slate-200 font-medium text-xs"
              />
            </div>
          </div>

          {/* Phone and Email */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-655 dark:text-slate-400 block text-xs">Contact Phone Number *</label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
                <input
                  type="text"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="e.g. +91 98765 43210"
                  className="w-full pl-9 pr-3 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-150 dark:border-slate-850 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-550 transition-all dark:text-slate-200 font-medium text-xs"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-655 dark:text-slate-400 block text-xs">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="e.g. contact@agency.com"
                  className="w-full pl-9 pr-3 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-150 dark:border-slate-850 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-550 transition-all dark:text-slate-200 font-medium text-xs"
                />
              </div>
            </div>
          </div>

          {/* Security Indicator */}
          <div className="bg-slate-50 dark:bg-slate-900/40 p-4 rounded-xl border border-slate-150 dark:border-slate-800/80 flex items-start space-x-2.5 text-slate-500">
            <ShieldCheck className="w-5 h-5 text-violet-600 dark:text-violet-400 flex-shrink-0" />
            <p className="leading-relaxed">All information is saved locally inside your browser's private sandbox storage database and remains inaccessible to third-party servers.</p>
          </div>

          {/* Save button and status */}
          <div className="border-t border-slate-100 dark:border-slate-750 pt-5 flex items-center justify-between gap-4">
            {showSuccess ? (
              <div className="flex items-center space-x-1.5 text-emerald-600 font-semibold text-xs animate-fade-in">
                <CheckCircle className="w-4 h-4" />
                <span>Configuration changes saved successfully!</span>
              </div>
            ) : (
              <div />
            )}

            <button
              type="submit"
              className="flex items-center space-x-1.5 bg-violet-600 hover:bg-violet-750 text-white font-bold text-xs px-5 py-3 rounded-xl shadow-lg shadow-violet-600/10 cursor-pointer transition-all duration-200"
            >
              <Save className="w-4 h-4" />
              <span>Save Admin Configurations</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

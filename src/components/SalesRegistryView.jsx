import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { 
  Search, 
  ShoppingCart, 
  Trash2, 
  Plus, 
  Minus, 
  CheckCircle,
  Percent,
  User,
  Phone,
  CreditCard,
  Banknote,
  Smartphone,
  Printer,
  X,
  Receipt
} from 'lucide-react';

export default function SalesRegistryView() {
  const { products, addSale, shopDetails } = useShop();

  // Search & Filter state
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Cart state
  const [cart, setCart] = useState([]);
  const [discount, setDiscount] = useState(0);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');

  // Success Receipt Modal state
  const [successSale, setSuccessSale] = useState(null);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  // Extract all categories
  const categories = ['All', ...new Set(products.map(p => p.category))];

  // Filtered products list
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || 
                          p.sku.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Cart Actions
  const addToCart = (product) => {
    const existing = cart.find(item => item.productId === product.id);
    
    if (existing) {
      setCart(cart.map(item => 
        item.productId === product.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, {
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        maxStock: product.stock
      }]);
    }
  };

  const updateCartQty = (productId, amount) => {
    const item = cart.find(i => i.productId === productId);
    if (!item) return;

    const newQty = item.quantity + amount;
    if (newQty <= 0) {
      removeFromCart(productId);
      return;
    }

    setCart(cart.map(i => i.productId === productId ? { ...i, quantity: newQty } : i));
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.productId !== productId));
  };

  // Pricing details
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discountAmount = subtotal * (discount / 100);
  const total = subtotal - discountAmount;

  // Checkout handling
  const handleCheckout = (e) => {
    e.preventDefault();
    if (cart.length === 0) return;

    const saleRecord = {
      items: cart,
      discount,
      paymentMethod,
      customerName: customerName.trim() || 'Walk-in Customer',
      customerPhone: customerPhone.trim(),
      shopName: shopDetails.name,
      shopAddress: shopDetails.address,
      shopPhone: shopDetails.phone,
      shopEmail: shopDetails.email
    };

    const result = addSale(saleRecord);
    setSuccessSale(result);

    // Reset registry inputs
    setCart([]);
    setDiscount(0);
    setCustomerName('');
    setCustomerPhone('');
    setPaymentMethod('Cash');

    // Auto dismiss success modal after 4 seconds
    setTimeout(() => {
      setSuccessSale(null);
    }, 4500);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 lg:h-[calc(100vh-8.5rem)] h-auto relative">
      {/* Product Selection Panel */}
      <div className="flex-1 flex flex-col bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm lg:h-full h-auto overflow-hidden">
        {/* Search and Category Filter Headers */}
        <div className="space-y-4 mb-5">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3.5 top-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search products by title or SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all dark:text-slate-200"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex space-x-1.5 overflow-x-auto pb-1 scrollbar-thin">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                  selectedCategory === cat
                    ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Product Catalogue Grid */}
        <div className="flex-1 overflow-y-auto pr-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-h-[400px] lg:max-h-none">
          {filteredProducts.map((product) => {
            const isOutOfStock = product.stock <= 0;
            const isLowStock = product.stock > 0 && product.stock <= product.minStock;
            const inCartItem = cart.find(item => item.productId === product.id);
            const inCartQty = inCartItem ? inCartItem.quantity : 0;
            const remainingStock = product.stock - inCartQty;

            return (
              <div 
                key={product.id}
                onClick={() => addToCart(product)}
                className={`p-4 rounded-2xl border flex flex-col justify-between transition-all duration-200 group cursor-pointer ${
                  inCartQty > 0
                    ? 'border-violet-500/80 bg-violet-500/[0.02] dark:bg-violet-500/[0.01]'
                    : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700/80 hover:shadow-md hover:border-slate-200 dark:hover:border-slate-600'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{product.category}</span>
                    {isOutOfStock ? (
                      <span className="bg-rose-500/10 text-rose-650 dark:text-rose-455 text-[9px] px-1.5 py-0.5 rounded-full font-bold">Out of Stock</span>
                    ) : isLowStock ? (
                      <span className="bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[9px] px-1.5 py-0.5 rounded-full font-bold">Low Stock</span>
                    ) : null}
                  </div>
                  <h5 className="font-bold text-slate-800 dark:text-slate-100 text-sm group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors line-clamp-1">{product.name}</h5>
                  <p className="text-[10px] text-slate-400 font-mono">{product.sku}</p>
                </div>

                <div className="flex justify-between items-end mt-4">
                  <div>
                    <p className="text-[10px] text-slate-400">Retail Price</p>
                    <p className="font-bold text-slate-800 dark:text-slate-100 text-base">₹{product.price.toFixed(2)}</p>
                  </div>
                  <div className="text-right">
                    <span className={`text-[10px] font-bold ${isOutOfStock ? 'text-rose-500 font-bold' : 'text-slate-500 dark:text-slate-400'}`}>
                      {remainingStock} Units Left
                    </span>
                    {inCartQty > 0 && (
                      <p className="text-[10px] text-violet-650 dark:text-violet-400 font-bold mt-0.5">{inCartQty} in cart</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          {filteredProducts.length === 0 && (
            <div className="col-span-full py-16 text-center text-slate-400 text-sm flex flex-col items-center justify-center">
              <ShoppingCart className="w-10 h-10 text-slate-300 dark:text-slate-600 mb-2" />
              <span>No items found matching the search.</span>
            </div>
          )}
        </div>
      </div>

      {/* Cart & Checkout Panel */}
      <div className="w-full lg:w-96 bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col lg:h-full h-auto overflow-hidden">
        <div className="flex items-center space-x-2 pb-4 border-b border-slate-100 dark:border-slate-700/60">
          <ShoppingCart className="w-5 h-5 text-violet-500" />
          <h4 className="font-bold text-slate-800 dark:text-slate-100">Checkout Cart</h4>
          <span className="ml-auto bg-slate-100 dark:bg-slate-900 text-slate-650 dark:text-slate-300 text-xs px-2.5 py-0.5 rounded-full font-bold">
            {cart.reduce((sum, item) => sum + item.quantity, 0)} Items
          </span>
        </div>

        {/* Scrollable Cart List */}
        <div className="flex-1 overflow-y-auto py-4 space-y-3.5 pr-1 max-h-[300px] lg:max-h-none">
          {cart.map((item) => (
            <div key={item.productId} className="flex justify-between items-center bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
              <div className="flex-1 min-w-0 pr-2">
                <p className="font-bold text-slate-800 dark:text-slate-200 text-xs truncate">{item.name}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">₹{item.price.toFixed(2)} each</p>
              </div>
              <div className="flex items-center space-x-2">
                {/* Quantity adjustments */}
                <div className="flex items-center bg-white dark:bg-slate-800 rounded-lg border border-slate-150 dark:border-slate-700 p-0.5">
                  <button 
                    onClick={() => updateCartQty(item.productId, -1)}
                    className="p-1 text-slate-500 hover:text-slate-800 dark:hover:text-white"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="px-2 text-xs font-bold text-slate-700 dark:text-slate-300 font-mono">{item.quantity}</span>
                  <button 
                    onClick={() => updateCartQty(item.productId, 1)}
                    className="p-1 text-slate-500 hover:text-slate-800 dark:hover:text-white"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
                {/* Remove button */}
                <button 
                  onClick={() => removeFromCart(item.productId)}
                  className="p-1.5 text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
          {cart.length === 0 && (
            <div className="text-center py-20 text-slate-400 text-xs flex flex-col items-center">
              <ShoppingCart className="w-8 h-8 text-slate-300 dark:text-slate-600 mb-2" />
              <span>Cart is empty. Click items on the left to add.</span>
            </div>
          )}
        </div>

        {/* Form and Pricing summary */}
        {cart.length > 0 && (
          <form onSubmit={handleCheckout} className="border-t border-slate-100 dark:border-slate-700/60 pt-4 space-y-4 bg-white dark:bg-slate-800">
            {/* Customer Inputs */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="relative">
                <User className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Client Name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full pl-8 pr-2 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-850 rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-500/20 focus:border-violet-500 transition-all dark:text-slate-200"
                />
              </div>
              <div className="relative">
                <Phone className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Client Phone"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full pl-8 pr-2 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-850 rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-500/20 focus:border-violet-500 transition-all dark:text-slate-200"
                />
              </div>
            </div>

            {/* Discount Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-400">
                <span className="flex items-center"><Percent className="w-3 h-3 mr-1" /> Discount</span>
                <span>{discount}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="30"
                value={discount}
                onChange={(e) => setDiscount(parseInt(e.target.value))}
                className="w-full accent-violet-600 h-1.5 bg-slate-100 dark:bg-slate-900 rounded-lg cursor-pointer"
              />
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block">Payment Method</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'Cash', label: 'Cash', icon: Banknote },
                  { id: 'Card', label: 'Card', icon: CreditCard },
                  { id: 'UPI', label: 'UPI / Scan', icon: Smartphone }
                ].map((pay) => {
                  const PayIcon = pay.icon;
                  const isSelected = paymentMethod === pay.id;
                  return (
                    <button
                      key={pay.id}
                      type="button"
                      onClick={() => setPaymentMethod(pay.id)}
                      className={`flex flex-col items-center justify-center py-2.5 rounded-xl border text-[10px] font-bold transition-all duration-200 ${
                        isSelected 
                          ? 'border-violet-650 bg-violet-650/10 text-violet-600 dark:text-violet-400' 
                          : 'border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                      }`}
                    >
                      <PayIcon className="w-4 h-4 mb-1" />
                      {pay.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Price Calculations */}
            <div className="bg-slate-50 dark:bg-slate-900/80 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-500">
                <span>Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-rose-500 font-medium">
                <span>Discount ({discount}%)</span>
                <span>-₹{discountAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-slate-800 dark:text-slate-100 text-sm pt-2 border-t border-slate-200 dark:border-slate-800">
                <span>Payable Total</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-violet-600 hover:bg-violet-750 text-white font-bold text-sm py-3 rounded-xl shadow-lg shadow-violet-600/10 transition-all duration-200 flex items-center justify-center space-x-1.5 cursor-pointer"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Checkout (₹{total.toFixed(2)})</span>
            </button>
          </form>
        )}
      </div>

      {/* Transaction Success Overlay Modal */}
      {successSale && (
        <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px] flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-2xl max-w-sm w-full text-center space-y-4 transform scale-100 transition-all">
            <div className="w-12 h-12 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">Transaction Success!</h3>
              <p className="text-xs text-slate-400 font-medium">Invoice: <span className="font-bold font-mono text-slate-600 dark:text-slate-300">{successSale.id}</span></p>
              <p className="text-xs text-slate-400">Total charge of <span className="font-bold text-slate-700 dark:text-slate-300">₹{successSale.total.toFixed(2)}</span> completed via {successSale.paymentMethod}.</p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-xl border border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 text-left leading-relaxed">
              <p className="font-bold text-slate-600 dark:text-slate-300 border-b border-slate-100 dark:border-slate-800 pb-1 mb-1">Receipt details:</p>
              {successSale.items.map((item, idx) => (
                <div key={idx} className="flex justify-between">
                  <span>{item.name} x{item.quantity}</span>
                  <span className="font-semibold text-slate-500 dark:text-slate-400">₹{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              <div className="flex justify-between border-t border-slate-100 dark:border-slate-800 pt-1 mt-1 font-bold text-slate-600 dark:text-slate-300">
                <span>Net Total</span>
                <span>₹{successSale.total.toFixed(2)}</span>
              </div>
            </div>
            <div className="flex space-x-2 pt-2">
              <button
                onClick={() => { setSelectedInvoice(successSale); setSuccessSale(null); }}
                className="flex-1 bg-violet-650 hover:bg-violet-750 text-white font-bold text-xs py-2.5 rounded-xl flex items-center justify-center space-x-1 cursor-pointer transition-colors"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>View & Print</span>
              </button>
              <button
                onClick={() => setSuccessSale(null)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-bold text-xs py-2.5 rounded-xl cursor-pointer transition-colors"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full Printable Receipt Modal */}
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
                  <span>Invoice Receipt</span>
                </span>
                <button 
                  onClick={() => setSelectedInvoice(null)}
                  className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4 text-slate-450" />
                </button>
              </div>

              {/* Printable Receipt Layout */}
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
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                      {selectedInvoice.status}
                    </span>
                    <p className="font-mono font-bold text-slate-800 dark:text-white text-sm">{selectedInvoice.id}</p>
                    <p className="text-[11px] text-slate-455 dark:text-slate-500">{new Date(selectedInvoice.date).toLocaleString()}</p>
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
                    <p className="font-bold text-slate-750 dark:text-slate-350">{selectedInvoice.paymentMethod}</p>
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
                  <div className="w-64 flex justify-between font-bold text-slate-855 dark:text-white text-sm border-t border-slate-100 dark:border-slate-800 pt-2.5">
                    <span>Invoice Net Paid:</span>
                    <span className="font-mono text-violet-650 dark:text-violet-400">₹{selectedInvoice.total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3 pt-3 border-t border-slate-100 dark:border-slate-755 mt-4 bg-white dark:bg-slate-800">
                  <button
                    onClick={() => window.print()}
                    className="flex-1 flex items-center justify-center space-x-1.5 bg-violet-600 hover:bg-violet-755 text-white font-bold py-2.5 rounded-xl cursor-pointer transition-colors"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Print Receipt</span>
                  </button>
                  <button
                    onClick={() => setSelectedInvoice(null)}
                    className="flex-1 border border-slate-250 dark:border-slate-700 py-2.5 rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-slate-900/60 dark:text-slate-350 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect } from 'react';

const ShopContext = createContext();

// Setup realistic initial mock data
const INITIAL_PRODUCTS = [
  { id: 'prod-1', sku: 'ELE-EAR-001', name: 'Wireless Earbuds Pro', category: 'Electronics', cost: 25.00, price: 59.99, stock: 18, minStock: 5, supplier: 'Acoustic Labs Inc' },
  { id: 'prod-2', sku: 'ELE-KEY-002', name: 'Mechanical Keyboard RGB', category: 'Electronics', cost: 40.00, price: 89.99, stock: 12, minStock: 4, supplier: 'Keytronics Corp' },
  { id: 'prod-3', sku: 'ACC-WAL-003', name: 'Leather Slim Wallet', category: 'Accessories', cost: 12.00, price: 29.99, stock: 22, minStock: 5, supplier: 'Hide & Stitch' },
  { id: 'prod-4', sku: 'ELE-SPK-004', name: 'Bluetooth Speaker Mini', category: 'Electronics', cost: 18.00, price: 39.99, stock: 2, minStock: 5, supplier: 'Acoustic Labs Inc' }, // Low stock!
  { id: 'prod-5', sku: 'OFF-MAT-005', name: 'Anti-Slip Desk Mat', category: 'Office', cost: 8.50, price: 19.99, stock: 30, minStock: 8, supplier: 'Neoprene Goods' },
  { id: 'prod-6', sku: 'KIT-MUG-006', name: 'Ceramic Travel Mug', category: 'Kitchenware', cost: 4.20, price: 12.50, stock: 4, minStock: 5, supplier: 'Clay & Kiln Co' }, // Low stock!
  { id: 'prod-7', sku: 'ELE-CAB-007', name: 'USB-C Fast Cable (2m)', category: 'Electronics', cost: 2.10, price: 9.99, stock: 85, minStock: 15, supplier: 'Apex Cables' },
  { id: 'prod-8', sku: 'ACC-CAS-008', name: 'Impact Phone Case', category: 'Accessories', cost: 5.00, price: 14.99, stock: 45, minStock: 10, supplier: 'Apex Cables' },
  { id: 'prod-9', sku: 'KIT-VSE-009', name: 'Handcrafted Flower Vase', category: 'Kitchenware', cost: 15.00, price: 34.99, stock: 7, minStock: 3, supplier: 'Clay & Kiln Co' },
  { id: 'prod-10', sku: 'ELE-WCH-010', name: 'FitTrack Smart Watch', category: 'Electronics', cost: 65.00, price: 139.99, stock: 6, minStock: 3, supplier: 'WearTech Ltd' }
];

const INITIAL_SALES = [
  // May 2026 Sales
  {
    id: 'INV-1001',
    date: '2026-05-04T10:15:30.000Z',
    items: [
      { productId: 'prod-1', sku: 'ELE-EAR-001', name: 'Wireless Earbuds Pro', quantity: 2, price: 59.99, cost: 25.00 },
      { productId: 'prod-7', sku: 'ELE-CAB-007', name: 'USB-C Fast Cable (2m)', quantity: 1, price: 9.99, cost: 2.10 }
    ],
    discount: 5, // 5% discount
    total: 123.47, // (59.99 * 2 + 9.99) * 0.95 = 123.47
    totalCost: 52.10, // 25 * 2 + 2.1 = 52.10
    paymentMethod: 'Card',
    customerName: 'Sarah Jenkins',
    customerPhone: '555-0199',
    status: 'Completed'
  },
  {
    id: 'INV-1002',
    date: '2026-05-12T14:30:00.000Z',
    items: [
      { productId: 'prod-2', sku: 'ELE-KEY-002', name: 'Mechanical Keyboard RGB', quantity: 1, price: 89.99, cost: 40.00 },
      { productId: 'prod-5', sku: 'OFF-MAT-005', name: 'Anti-Slip Desk Mat', quantity: 1, price: 19.99, cost: 8.50 }
    ],
    discount: 0,
    total: 109.98,
    totalCost: 48.50,
    paymentMethod: 'UPI',
    customerName: 'David Lee',
    customerPhone: '555-0144',
    status: 'Completed'
  },
  {
    id: 'INV-1003',
    date: '2026-05-20T11:45:00.000Z',
    items: [
      { productId: 'prod-3', sku: 'ACC-WAL-003', name: 'Leather Slim Wallet', quantity: 3, price: 29.99, cost: 12.00 }
    ],
    discount: 10,
    total: 80.97, // 29.99 * 3 * 0.90 = 80.97
    totalCost: 36.00,
    paymentMethod: 'Cash',
    customerName: 'Emma Watson',
    customerPhone: '555-0122',
    status: 'Completed'
  },
  {
    id: 'INV-1004',
    date: '2026-05-28T16:20:00.000Z',
    items: [
      { productId: 'prod-10', sku: 'ELE-WCH-010', name: 'FitTrack Smart Watch', quantity: 1, price: 139.99, cost: 65.00 },
      { productId: 'prod-8', sku: 'ACC-CAS-008', name: 'Impact Phone Case', quantity: 2, price: 14.99, cost: 5.00 }
    ],
    discount: 0,
    total: 169.97,
    totalCost: 75.00,
    paymentMethod: 'Card',
    customerName: 'John Doe',
    customerPhone: '555-0101',
    status: 'Completed'
  },

  // June 2026 Sales
  {
    id: 'INV-1005',
    date: '2026-06-02T09:05:00.000Z',
    items: [
      { productId: 'prod-1', sku: 'ELE-EAR-001', name: 'Wireless Earbuds Pro', quantity: 1, price: 59.99, cost: 25.00 },
      { productId: 'prod-2', sku: 'ELE-KEY-002', name: 'Mechanical Keyboard RGB', quantity: 1, price: 89.99, cost: 40.00 },
      { productId: 'prod-8', sku: 'ACC-CAS-008', name: 'Impact Phone Case', quantity: 1, price: 14.99, cost: 5.00 }
    ],
    discount: 15,
    total: 140.22, // (59.99 + 89.99 + 14.99) * 0.85 = 140.22
    totalCost: 70.00,
    paymentMethod: 'UPI',
    customerName: 'Robert Dow',
    customerPhone: '555-0155',
    status: 'Completed'
  },
  {
    id: 'INV-1006',
    date: '2026-06-10T12:00:00.000Z',
    items: [
      { productId: 'prod-4', sku: 'ELE-SPK-004', name: 'Bluetooth Speaker Mini', quantity: 2, price: 39.99, cost: 18.00 },
      { productId: 'prod-7', sku: 'ELE-CAB-007', name: 'USB-C Fast Cable (2m)', quantity: 3, price: 9.99, cost: 2.10 }
    ],
    discount: 0,
    total: 109.95,
    totalCost: 42.30,
    paymentMethod: 'Cash',
    customerName: 'Alice Green',
    customerPhone: '555-0178',
    status: 'Completed'
  },
  {
    id: 'INV-1007',
    date: '2026-06-15T15:40:00.000Z',
    items: [
      { productId: 'prod-9', sku: 'KIT-VSE-009', name: 'Handcrafted Flower Vase', quantity: 2, price: 34.99, cost: 15.00 }
    ],
    discount: 5,
    total: 66.48, // 34.99 * 2 * 0.95 = 66.48
    totalCost: 30.00,
    paymentMethod: 'Card',
    customerName: 'Olivia Wilde',
    customerPhone: '555-0133',
    status: 'Completed'
  },
  {
    id: 'INV-1008',
    date: '2026-06-22T17:10:00.000Z',
    items: [
      { productId: 'prod-10', sku: 'ELE-WCH-010', name: 'FitTrack Smart Watch', quantity: 2, price: 139.99, cost: 65.00 }
    ],
    discount: 10,
    total: 251.98,
    totalCost: 130.00,
    paymentMethod: 'Card',
    customerName: 'Marcus Aurelius',
    customerPhone: '555-0112',
    status: 'Completed'
  },
  {
    id: 'INV-1009',
    date: '2026-06-29T11:20:00.000Z',
    items: [
      { productId: 'prod-6', sku: 'KIT-MUG-006', name: 'Ceramic Travel Mug', quantity: 2, price: 12.50, cost: 4.20 },
      { productId: 'prod-5', sku: 'OFF-MAT-005', name: 'Anti-Slip Desk Mat', quantity: 2, price: 19.99, cost: 8.50 }
    ],
    discount: 0,
    total: 64.98,
    totalCost: 25.40,
    paymentMethod: 'UPI',
    customerName: 'Sophia Loren',
    customerPhone: '555-0187',
    status: 'Refunded' // Refunded order
  },

  // July 2026 Sales (Current Month)
  {
    id: 'INV-1010',
    date: '2026-07-01T10:30:00.000Z',
    items: [
      { productId: 'prod-1', sku: 'ELE-EAR-001', name: 'Wireless Earbuds Pro', quantity: 1, price: 59.99, cost: 25.00 },
      { productId: 'prod-8', sku: 'ACC-CAS-008', name: 'Impact Phone Case', quantity: 1, price: 14.99, cost: 5.00 }
    ],
    discount: 0,
    total: 74.98,
    totalCost: 30.00,
    paymentMethod: 'UPI',
    customerName: 'Tim Cook',
    customerPhone: '555-1999',
    status: 'Completed'
  },
  {
    id: 'INV-1011',
    date: '2026-07-03T13:15:00.000Z',
    items: [
      { productId: 'prod-2', sku: 'ELE-KEY-002', name: 'Mechanical Keyboard RGB', quantity: 2, price: 89.99, cost: 40.00 }
    ],
    discount: 5,
    total: 170.98,
    totalCost: 80.00,
    paymentMethod: 'Card',
    customerName: 'Grace Hopper',
    customerPhone: '555-1947',
    status: 'Completed'
  },
  {
    id: 'INV-1012',
    date: '2026-07-06T15:50:00.000Z',
    items: [
      { productId: 'prod-3', sku: 'ACC-WAL-003', name: 'Leather Slim Wallet', quantity: 1, price: 29.99, cost: 12.00 },
      { productId: 'prod-5', sku: 'OFF-MAT-005', name: 'Anti-Slip Desk Mat', quantity: 1, price: 19.99, cost: 8.50 },
      { productId: 'prod-7', sku: 'ELE-CAB-007', name: 'USB-C Fast Cable (2m)', quantity: 2, price: 9.99, cost: 2.10 }
    ],
    discount: 0,
    total: 69.96,
    totalCost: 24.70,
    paymentMethod: 'Cash',
    customerName: 'Alan Turing',
    customerPhone: '555-1912',
    status: 'Completed'
  },
  {
    id: 'INV-1013',
    date: '2026-07-08T11:00:00.000Z',
    items: [
      { productId: 'prod-10', sku: 'ELE-WCH-010', name: 'FitTrack Smart Watch', quantity: 1, price: 139.99, cost: 65.00 }
    ],
    discount: 12, // 12% discount
    total: 123.19, // 139.99 * 0.88 = 123.19
    totalCost: 65.00,
    paymentMethod: 'UPI',
    customerName: 'Sheryl Sandberg',
    customerPhone: '555-0219',
    status: 'Completed'
  },
  {
    id: 'INV-1014',
    date: '2026-07-09T16:30:00.000Z',
    items: [
      { productId: 'prod-5', sku: 'OFF-MAT-005', name: 'Anti-Slip Desk Mat', quantity: 3, price: 19.99, cost: 8.50 },
      { productId: 'prod-8', sku: 'ACC-CAS-008', name: 'Impact Phone Case', quantity: 2, price: 14.99, cost: 5.00 }
    ],
    discount: 0,
    total: 89.95,
    totalCost: 35.50,
    paymentMethod: 'Card',
    customerName: 'Ada Lovelace',
    customerPhone: '555-1815',
    status: 'Completed'
  },
  {
    id: 'INV-1015',
    date: '2026-07-10T14:20:00.000Z',
    items: [
      { productId: 'prod-10', sku: 'ELE-WCH-010', name: 'FitTrack Smart Watch', quantity: 1, price: 139.99, cost: 65.00 },
      { productId: 'prod-7', sku: 'ELE-CAB-007', name: 'USB-C Fast Cable (2m)', quantity: 3, price: 9.99, cost: 2.10 }
    ],
    discount: 10,
    total: 152.96,
    totalCost: 71.30,
    paymentMethod: 'UPI',
    customerName: 'Sundar Pichai',
    customerPhone: '555-0820',
    status: 'Completed'
  }
];

const INITIAL_EXPENSES = [
  // May 2026 Expenses
  { id: 'exp-1', date: '2026-05-01', category: 'Rent', amount: 800.00, description: 'Monthly store rental' },
  { id: 'exp-2', date: '2026-05-05', category: 'Utilities', amount: 150.00, description: 'Electricity & water bill' },
  { id: 'exp-3', date: '2026-05-25', category: 'Salaries', amount: 1200.00, description: 'Store assistant wages' },
  { id: 'exp-4', date: '2026-05-28', category: 'Marketing', amount: 80.00, description: 'Local flyers & social media ads' },

  // June 2026 Expenses
  { id: 'exp-5', date: '2026-06-01', category: 'Rent', amount: 800.00, description: 'Monthly store rental' },
  { id: 'exp-6', date: '2026-06-05', category: 'Utilities', amount: 175.50, description: 'Electricity & water bill' },
  { id: 'exp-7', date: '2026-06-25', category: 'Salaries', amount: 1200.00, description: 'Store assistant wages' },
  { id: 'exp-8', date: '2026-06-27', category: 'Other', amount: 45.00, description: 'Cleaning supplies' },

  // July 2026 Expenses (Current Month)
  { id: 'exp-9', date: '2026-07-01', category: 'Rent', amount: 800.00, description: 'Monthly store rental' },
  { id: 'exp-10', date: '2026-07-05', category: 'Utilities', amount: 162.00, description: 'Electricity & water bill' }
];

const INITIAL_DISTRIBUTORS = [
  { id: 'dist-1', name: 'Acoustic Labs Inc', contactName: 'Robert Vance', phone: '555-0101', email: 'robert@acousticlabs.com', address: '100 Soundwave Blvd, Austin, TX', category: 'Electronics', status: 'Active' },
  { id: 'dist-2', name: 'Keytronics Corp', contactName: 'Angela Martin', phone: '555-0102', email: 'orders@keytronics.com', address: '202 Keyboard Ave, San Jose, CA', category: 'Electronics', status: 'Active' },
  { id: 'dist-3', name: 'Hide & Stitch', contactName: 'Pam Beesly', phone: '555-0103', email: 'pam@hidestitch.net', address: '45 Leather Way, Boston, MA', category: 'Accessories', status: 'Active' },
  { id: 'dist-4', name: 'Clay & Kiln Co', contactName: 'Phyllis Lapin', phone: '555-0104', email: 'sales@clayandkiln.com', address: '12 Pottery Rd, Portland, OR', category: 'Kitchenware', status: 'Active' },
  { id: 'dist-5', name: 'WearTech Ltd', contactName: 'Oscar Martinez', phone: '555-0105', email: 'oscar@weartech.co.uk', address: '78 Silicon Alley, London, UK', category: 'Electronics', status: 'Active' }
];

export const ShopProvider = ({ children }) => {
  // Read states from localStorage or use defaults
  const [products, setProducts] = useState(() => {
    const saved = localStorage.getItem('apex_products');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  const [sales, setSales] = useState(() => {
    const saved = localStorage.getItem('apex_sales');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (!parsed.some(s => s.id === 'INV-1015')) {
        const newBilling = {
          id: 'INV-1015',
          date: '2026-07-10T14:20:00.000Z',
          items: [
            { productId: 'prod-10', sku: 'ELE-WCH-010', name: 'FitTrack Smart Watch', quantity: 1, price: 139.99, cost: 65.00 },
            { productId: 'prod-7', sku: 'ELE-CAB-007', name: 'USB-C Fast Cable (2m)', quantity: 3, price: 9.99, cost: 2.10 }
          ],
          discount: 10,
          total: 152.96,
          totalCost: 71.30,
          paymentMethod: 'UPI',
          customerName: 'Sundar Pichai',
          customerPhone: '555-0820',
          status: 'Completed'
        };
        return [newBilling, ...parsed];
      }
      return parsed;
    }
    return INITIAL_SALES;
  });

  const [expenses, setExpenses] = useState(() => {
    const saved = localStorage.getItem('apex_expenses');
    return saved ? JSON.parse(saved) : INITIAL_EXPENSES;
  });

  const [distributors, setDistributors] = useState(() => {
    const saved = localStorage.getItem('apex_distributors');
    return saved ? JSON.parse(saved) : INITIAL_DISTRIBUTORS;
  });

  const [shopDetails, setShopDetails] = useState(() => {
    const saved = localStorage.getItem('apex_shop_details');
    return saved ? JSON.parse(saved) : {
      name: 'Gokulam Agency',
      address: '123 Market Square, Metro Plaza',
      phone: '+91 98765 43210',
      email: 'gokulamagency@outlook.com'
    };
  });

  // Keep localStorage in sync
  useEffect(() => {
    localStorage.setItem('apex_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('apex_sales', JSON.stringify(sales));
  }, [sales]);

  useEffect(() => {
    localStorage.setItem('apex_expenses', JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem('apex_distributors', JSON.stringify(distributors));
  }, [distributors]);

  useEffect(() => {
    localStorage.setItem('apex_shop_details', JSON.stringify(shopDetails));
  }, [shopDetails]);

  // --- ACTIONS ---

  // Inventory Actions
  const addProduct = (newProd) => {
    setProducts((prev) => [
      ...prev,
      {
        ...newProd,
        id: `prod-${Date.now()}`,
        cost: parseFloat(newProd.cost) || 0,
        price: parseFloat(newProd.price) || 0,
        stock: parseInt(newProd.stock) || 0,
        minStock: parseInt(newProd.minStock) || 0,
      }
    ]);
  };

  const editProduct = (updatedProd) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === updatedProd.id ? {
        ...updatedProd,
        cost: parseFloat(updatedProd.cost) || 0,
        price: parseFloat(updatedProd.price) || 0,
        stock: parseInt(updatedProd.stock) || 0,
        minStock: parseInt(updatedProd.minStock) || 0,
      } : p))
    );
  };

  const deleteProduct = (id) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const adjustStock = (productId, amount) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === productId ? { ...p, stock: Math.max(0, p.stock + amount) } : p
      )
    );
  };

  // Sales Actions
  const addSale = (saleData) => {
    const newInvoiceId = `INV-${1000 + sales.length + 1}`;
    const dateStr = new Date().toISOString();

    const formattedItems = saleData.items.map((item) => {
      const prod = products.find((p) => p.id === item.productId);
      return {
        productId: item.productId,
        sku: prod ? prod.sku : '',
        name: item.name,
        quantity: item.quantity,
        price: parseFloat(item.price),
        cost: prod ? prod.cost : parseFloat(item.price) * 0.5 // fallback
      };
    });

    const totalCost = formattedItems.reduce((sum, item) => sum + item.cost * item.quantity, 0);
    const grossTotal = formattedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const discountVal = parseFloat(saleData.discount) || 0;
    const finalTotal = parseFloat((grossTotal * (1 - discountVal / 100)).toFixed(2));

    const newSale = {
      id: newInvoiceId,
      date: dateStr,
      items: formattedItems,
      discount: discountVal,
      total: finalTotal,
      totalCost: parseFloat(totalCost.toFixed(2)),
      paymentMethod: saleData.paymentMethod || 'Cash',
      customerName: saleData.customerName || 'Walk-in Customer',
      customerPhone: saleData.customerPhone || '',
      status: 'Completed'
    };

    // Deduct stock for all items
    setProducts((prev) =>
      prev.map((p) => {
        const cartItem = saleData.items.find((item) => item.productId === p.id);
        if (cartItem) {
          return { ...p, stock: Math.max(0, p.stock - cartItem.quantity) };
        }
        return p;
      })
    );

    setSales((prev) => [newSale, ...prev]);
    return newSale;
  };

  const refundSale = (saleId) => {
    const saleToRefund = sales.find((s) => s.id === saleId);
    if (!saleToRefund || saleToRefund.status === 'Refunded') return;

    // Refund: Restock items
    setProducts((prev) =>
      prev.map((p) => {
        const refundedItem = saleToRefund.items.find((item) => item.productId === p.id);
        if (refundedItem) {
          return { ...p, stock: p.stock + refundedItem.quantity };
        }
        return p;
      })
    );

    // Update sale status
    setSales((prev) =>
      prev.map((s) => (s.id === saleId ? { ...s, status: 'Refunded' } : s))
    );
  };

  const editSale = (updatedSale) => {
    setSales((prev) =>
      prev.map((s) => (s.id === updatedSale.id ? updatedSale : s))
    );
  };

  const clearAllSales = () => {
    setSales([]);
  };

  // Expense Actions
  const addExpense = (newExp) => {
    setExpenses((prev) => [
      {
        ...newExp,
        id: `exp-${Date.now()}`,
        amount: parseFloat(newExp.amount) || 0,
        date: newExp.date || new Date().toISOString().split('T')[0]
      },
      ...prev
    ]);
  };

  const editExpense = (updatedExp) => {
    setExpenses((prev) =>
      prev.map((e) => (e.id === updatedExp.id ? {
        ...updatedExp,
        amount: parseFloat(updatedExp.amount) || 0
      } : e))
    );
  };

  const deleteExpense = (id) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  };

  // Distributor Actions
  const addDistributor = (newDist) => {
    setDistributors((prev) => [
      ...prev,
      {
        ...newDist,
        id: `dist-${Date.now()}`,
        status: newDist.status || 'Active'
      }
    ]);
  };

  const editDistributor = (updatedDist) => {
    setDistributors((prev) =>
      prev.map((d) => (d.id === updatedDist.id ? updatedDist : d))
    );
  };

  const deleteDistributor = (id) => {
    setDistributors((prev) => prev.filter((d) => d.id !== id));
  };

  const updateShopDetails = (newDetails) => {
    setShopDetails(newDetails);
  };

  return (
    <ShopContext.Provider
      value={{
        products,
        sales,
        expenses,
        distributors,
        shopDetails,
        addProduct,
        editProduct,
        deleteProduct,
        adjustStock,
        addSale,
        refundSale,
        editSale,
        clearAllSales,
        addExpense,
        editExpense,
        deleteExpense,
        addDistributor,
        editDistributor,
        deleteDistributor,
        updateShopDetails
      }}
    >
      {children}
    </ShopContext.Provider>
  );
};

export const useShop = () => {
  const context = useContext(ShopContext);
  if (!context) {
    throw new Error('useShop must be used within a ShopProvider');
  }
  return context;
};

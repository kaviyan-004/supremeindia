'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'products' | 'custom' | 'bulk' | 'customers'
  const [orderFilter, setOrderFilter] = useState('active'); // 'active' | 'completed' | 'all'
  const [orders, setOrders] = useState([]);
  const [customOrders, setCustomOrders] = useState([]);
  const [bulkOrders, setBulkOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusUpdating, setStatusUpdating] = useState(null);

  // New Drop Launch States
  const [showAddForm, setShowAddForm] = useState(false);
  const [launching, setLaunching] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [launchSuccess, setLaunchSuccess] = useState('');
  const [launchError, setLaunchError] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState('all');
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [editingPriceId, setEditingPriceId] = useState(null);
  const [priceDraft, setPriceDraft] = useState('');
  const [priceError, setPriceError] = useState('');

  const [newProduct, setNewProduct] = useState({
    name: '',
    category: 'tees',
    subCategory: 'Oversized Graphic Tee',
    price: '',
    mrp: '',
    memberPrice: '',
    fabric: '240 GSM Combed Cotton',
    fit: 'Oversized',
    badgeText: 'NEW DROP',
    description: '',
    images: [],
    sizes: [
      { size: 'S', stock: 10 },
      { size: 'M', stock: 20 },
      { size: 'L', stock: 20 },
      { size: 'XL', stock: 10 },
    ],
  });

  useEffect(() => {
    // Check if current user is verified admin by server
    async function checkAdminAuth() {
      try {
        const res = await fetch('/api/auth/me');
        const data = await res.json();
        if (data.user?.role === 'admin') {
          return true;
        }
      } catch (e) {}

      window.location.href = '/admin/login';
      return false;
    }

    checkAdminAuth();

    // Fetch all admin data
    Promise.all([
      fetch('/api/admin/orders').then((r) => r.json()),
      fetch('/api/admin/custom-orders').then((r) => r.json()),
      fetch('/api/admin/bulk-orders').then((r) => r.json()),
      fetch('/api/admin/customers').then((r) => r.json()),
      fetch('/api/admin/products').then((r) => r.json()),
    ])
      .then(([ordData, custData, bulkData, userData, prodData]) => {
        setOrders(ordData.orders || []);
        setCustomOrders(custData.customOrders || []);
        setBulkOrders(bulkData.bulkOrders || []);
        setCustomers(userData.customers || []);
        setProducts(prodData.products || []);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [router]);

  async function handleStatusChange(orderId, newStatus) {
    setStatusUpdating(orderId);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderStatus: newStatus }),
      });
      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) => (o._id === orderId ? { ...o, orderStatus: newStatus } : o))
        );
      }
    } catch (e) {
      console.error(e);
    } finally {
      setStatusUpdating(null);
    }
  }

  async function handleDeleteOrder(orderId, orderNumber) {
    if (
      !window.confirm(
        `Are you sure you want to permanently delete Order #${orderNumber} from the backend? This cannot be undone.`
      )
    ) {
      return;
    }
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setOrders((prev) => prev.filter((o) => o._id !== orderId));
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to delete order from backend.');
      }
    } catch (e) {
      console.error('Failed to delete order:', e);
      alert('Error deleting order: ' + e.message);
    }
  }

  async function handleLogout() {
    try {
      localStorage.removeItem('si_auth_user');
    } catch (e) {}
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/admin/login';
  }

  // --- Product Handlers ---
  function handleCategoryChange(category) {
    let subCategory = 'Oversized Graphic Tee';
    let fabric = '240 GSM Combed Cotton';
    let price = newProduct.price;
    let mrp = newProduct.mrp;

    if (category === 'hoodies') {
      subCategory = 'Heavyweight Printed Hoodie';
      fabric = '320 GSM Brushed Fleece';
      if (!price) price = '1399';
      if (!mrp) mrp = '2199';
    } else if (category === 'tees') {
      subCategory = 'Oversized Graphic Tee';
      fabric = '240 GSM Combed Cotton';
      if (!price) price = '799';
      if (!mrp) mrp = '1299';
    }

    setNewProduct((prev) => ({
      ...prev,
      category,
      subCategory,
      fabric,
      price: price || prev.price,
      mrp: mrp || prev.mrp,
    }));
  }

  async function handleImageUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    setLaunchError('');
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.url) {
        setNewProduct((prev) => ({
          ...prev,
          images: [...prev.images, data.url],
        }));
      } else {
        setLaunchError(data.error || 'Failed to upload photo.');
      }
    } catch (err) {
      setLaunchError('Upload failed: ' + err.message);
    } finally {
      setUploadingImage(false);
      e.target.value = '';
    }
  }

  function handleAddImageUrl() {
    if (!imageUrlInput.trim()) return;
    setNewProduct((prev) => ({
      ...prev,
      images: [...prev.images, imageUrlInput.trim()],
    }));
    setImageUrlInput('');
  }

  function handleRemoveImage(index) {
    setNewProduct((prev) => ({
      ...prev,
      images: prev.images.filter((_, idx) => idx !== index),
    }));
  }

  function handleSizeStockChange(sizeName, value) {
    const stockVal = Math.max(0, parseInt(value, 10) || 0);
    setNewProduct((prev) => ({
      ...prev,
      sizes: prev.sizes.map((s) => (s.size === sizeName ? { ...s, stock: stockVal } : s)),
    }));
  }

  async function handlePublishProduct(e) {
    e.preventDefault();
    setLaunchError('');
    setLaunchSuccess('');

    if (!newProduct.name.trim()) {
      setLaunchError('Please enter a product title.');
      return;
    }

    if (!newProduct.price) {
      setLaunchError('Please enter the selling price.');
      return;
    }

    if (!newProduct.images.length) {
      setLaunchError('Please upload at least one image of the product.');
      return;
    }

    setLaunching(true);
    try {
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProduct),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setLaunchSuccess(`Drop "${data.product.name}" is now LIVE on the store!`);
        setProducts((prev) => [data.product, ...prev]);
        // Reset form
        setNewProduct({
          name: '',
          category: 'tees',
          subCategory: 'Oversized Graphic Tee',
          price: '',
          mrp: '',
          memberPrice: '',
          fabric: '240 GSM Combed Cotton',
          fit: 'Oversized',
          badgeText: 'NEW DROP',
          description: '',
          images: [],
          sizes: [
            { size: 'S', stock: 10 },
            { size: 'M', stock: 20 },
            { size: 'L', stock: 20 },
            { size: 'XL', stock: 10 },
          ],
        });
        setShowAddForm(false);
      } else {
        setLaunchError(data.error || 'Failed to publish product drop.');
      }
    } catch (err) {
      setLaunchError('Server error: ' + err.message);
    } finally {
      setLaunching(false);
    }
  }

  async function handleToggleProductActive(productId, currentActive) {
    try {
      const res = await fetch(`/api/admin/products/${productId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentActive }),
      });
      if (res.ok) {
        setProducts((prev) =>
          prev.map((p) => (p._id === productId ? { ...p, isActive: !currentActive } : p))
        );
      }
    } catch (e) {
      console.error(e);
    }
  }

  async function handleSavePrice(productId) {
    const value = Number(priceDraft);
    if (!Number.isFinite(value) || value <= 0) {
      setPriceError('Enter a valid price');
      return;
    }
    try {
      const res = await fetch(`/api/admin/products/${productId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ price: value }),
      });
      if (res.ok) {
        setProducts((prev) =>
          prev.map((p) => ((p._id || p.slug) === productId ? { ...p, price: value } : p))
        );
        setEditingPriceId(null);
        setPriceError('');
      } else {
        const data = await res.json().catch(() => ({}));
        setPriceError(data.error || 'Could not update price');
      }
    } catch (e) {
      setPriceError('Could not update price');
    }
  }

  async function handleDeleteProduct(productId, productName) {
    if (!window.confirm(`Are you sure you want to remove "${productName}" from the store catalog?`)) {
      return;
    }
    try {
      const res = await fetch(`/api/admin/products/${productId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setProducts((prev) => prev.filter((p) => p._id !== productId));
      }
    } catch (e) {
      console.error(e);
    }
  }

  const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
  const activeOrdersCount = orders.filter((o) => !['delivered', 'cancelled'].includes(o.orderStatus)).length;
  const completedOrdersCount = orders.filter((o) => ['delivered', 'cancelled'].includes(o.orderStatus)).length;
  const filteredOrders = orders.filter((order) => {
    if (orderFilter === 'active') return !['delivered', 'cancelled'].includes(order.orderStatus);
    if (orderFilter === 'completed') return ['delivered', 'cancelled'].includes(order.orderStatus);
    return true;
  });

  if (loading) {
    return (
      <div className="px-4 py-24 text-center text-xs text-text-muted">
        Loading store owner dashboard…
      </div>
    );
  }

  return (
    <div className="px-4 py-5 pb-24 space-y-5">
      {/* Top Header */}
      <div className="bg-neutral-950 text-white rounded-2xl p-4 shadow-md flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-brand flex items-center justify-center">
            <span className="material-symbols-outlined text-[24px]">storefront</span>
          </div>
          <div>
            <h1 className="font-heading font-black text-sm tracking-tight leading-tight">
              SUPREME INDIA <span className="text-brand">ADMIN</span>
            </h1>
            <p className="text-[10px] text-neutral-400">Owner Management Portal</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="text-xs bg-neutral-800 hover:bg-neutral-700 px-3 py-1.5 rounded-lg font-bold"
        >
          Logout
        </button>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        <div className="bg-white border border-borderDark rounded-2xl p-3.5 shadow-soft">
          <span className="text-[10px] font-extrabold uppercase text-text-muted tracking-wider">Total Sales</span>
          <p className="font-heading font-black text-xl text-text-primary mt-0.5">₹{totalRevenue.toLocaleString()}</p>
          <span className="text-[10px] font-bold text-emerald-600">✓ {orders.length} orders placed</span>
        </div>

        <div className="bg-white border border-borderDark rounded-2xl p-3.5 shadow-soft">
          <span className="text-[10px] font-extrabold uppercase text-text-muted tracking-wider">Live Catalog</span>
          <p className="font-heading font-black text-xl text-text-primary mt-0.5">{products.length}</p>
          <span className="text-[10px] font-bold text-brand">🔥 Drops online</span>
        </div>

        <div className="bg-white border border-borderDark rounded-2xl p-3.5 shadow-soft">
          <span className="text-[10px] font-extrabold uppercase text-text-muted tracking-wider">Custom Prints</span>
          <p className="font-heading font-black text-xl text-text-primary mt-0.5">{customOrders.length}</p>
          <span className="text-[10px] font-bold text-pink-600">🎨 Custom artworks</span>
        </div>

        <div className="bg-white border border-borderDark rounded-2xl p-3.5 shadow-soft">
          <span className="text-[10px] font-extrabold uppercase text-text-muted tracking-wider">Bulk Inquiries</span>
          <p className="font-heading font-black text-xl text-text-primary mt-0.5">{bulkOrders.length}</p>
          <span className="text-[10px] font-bold text-indigo-600">📦 College fest batches</span>
        </div>

        <div className="bg-white border border-borderDark rounded-2xl p-3.5 shadow-soft col-span-2 sm:col-span-1">
          <span className="text-[10px] font-extrabold uppercase text-text-muted tracking-wider">Customers</span>
          <p className="font-heading font-black text-xl text-text-primary mt-0.5">{customers.length}</p>
          <span className="text-[10px] font-bold text-neutral-600">👥 Accounts registered</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-borderDark overflow-x-auto no-scrollbar text-xs font-bold gap-1">
        <button
          type="button"
          onClick={() => setActiveTab('orders')}
          className={`pb-2.5 px-3 border-b-2 whitespace-nowrap transition-all ${
            activeTab === 'orders'
              ? 'border-brand text-brand font-black'
              : 'border-transparent text-text-muted'
          }`}
        >
          Orders ({activeOrdersCount} Active)
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('products')}
          className={`pb-2.5 px-3 border-b-2 whitespace-nowrap transition-all flex items-center gap-1.5 ${
            activeTab === 'products'
              ? 'border-brand text-brand font-black'
              : 'border-transparent text-text-muted'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">apparel</span>
          <span>Drops & Products ({products.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('custom')}
          className={`pb-2.5 px-3 border-b-2 whitespace-nowrap transition-all ${
            activeTab === 'custom'
              ? 'border-brand text-brand font-black'
              : 'border-transparent text-text-muted'
          }`}
        >
          Custom Prints ({customOrders.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('bulk')}
          className={`pb-2.5 px-3 border-b-2 whitespace-nowrap transition-all ${
            activeTab === 'bulk'
              ? 'border-brand text-brand font-black'
              : 'border-transparent text-text-muted'
          }`}
        >
          Bulk College ({bulkOrders.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('customers')}
          className={`pb-2.5 px-3 border-b-2 whitespace-nowrap transition-all ${
            activeTab === 'customers'
              ? 'border-brand text-brand font-black'
              : 'border-transparent text-text-muted'
          }`}
        >
          Customers ({customers.length})
        </button>
      </div>

      {/* 1. Orders Tab Content */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {/* Small-Batch Apparel Workflow Header */}
          <div className="bg-gradient-to-r from-neutral-900 to-neutral-800 text-white p-3.5 rounded-2xl shadow-sm border border-neutral-700/60">
            <div className="flex items-center gap-2 mb-1">
              <span className="material-symbols-outlined text-brand text-[18px]">verified</span>
              <p className="font-heading font-black text-xs uppercase tracking-wider text-white">
                Supreme India Fulfillment Pipeline
              </p>
            </div>
            <p className="text-[11px] text-neutral-300 leading-relaxed">
              1. Customer Pays → 2. 📞 Call/WhatsApp to Confirm Size & Fit → 3. 🖨️ Print & Pack → 4. 🚚 Ship → 5. ✅ Complete or Delete from Backend.
            </p>
          </div>

          {/* Filter Bar */}
          <div className="flex items-center justify-between gap-2 overflow-x-auto no-scrollbar pb-1">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setOrderFilter('active')}
                className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition-all ${
                  orderFilter === 'active'
                    ? 'bg-brand text-white border-brand shadow-xs'
                    : 'bg-white text-text-secondary border-slate-200 hover:border-slate-300'
                }`}
              >
                🔥 Active Work ({activeOrdersCount})
              </button>

              <button
                type="button"
                onClick={() => setOrderFilter('completed')}
                className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition-all ${
                  orderFilter === 'completed'
                    ? 'bg-neutral-900 text-white border-neutral-900 shadow-xs'
                    : 'bg-white text-text-secondary border-slate-200 hover:border-slate-300'
                }`}
              >
                ✅ Completed ({completedOrdersCount})
              </button>

              <button
                type="button"
                onClick={() => setOrderFilter('all')}
                className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition-all ${
                  orderFilter === 'all'
                    ? 'bg-neutral-900 text-white border-neutral-900 shadow-xs'
                    : 'bg-white text-text-secondary border-slate-200 hover:border-slate-300'
                }`}
              >
                All Orders ({orders.length})
              </button>
            </div>
          </div>

          {filteredOrders.length === 0 ? (
            <div className="bg-white border border-borderDark rounded-2xl p-8 text-center text-xs text-text-muted">
              {orderFilter === 'active'
                ? 'No active orders in progress! All orders are fulfilled or completed.'
                : 'No orders found for this filter.'}
            </div>
          ) : (
            filteredOrders.map((order) => {
              const customerPhone = order.shippingAddress?.phone || order.guestContact?.phone || '';
              const customerName = order.guestContact?.name || order.shippingAddress?.name || 'Customer';
              const cleanPhone = customerPhone.replace(/\D/g, '').slice(-10);
              const waMessage = encodeURIComponent(
                `Hi ${customerName}! Supreme India here regarding your order #${order.orderNumber}. We are preparing to print your tees/hoodies. Could you please confirm your sizing and address?`
              );
              const waUrl = cleanPhone ? `https://wa.me/91${cleanPhone}?text=${waMessage}` : null;

              const statusColor = {
                placed: 'bg-amber-100 text-amber-800 border-amber-300',
                confirmed: 'bg-blue-100 text-blue-800 border-blue-300',
                in_printing: 'bg-purple-100 text-purple-800 border-purple-300',
                shipped: 'bg-cyan-100 text-cyan-800 border-cyan-300',
                delivered: 'bg-emerald-100 text-emerald-800 border-emerald-300',
                cancelled: 'bg-rose-100 text-rose-800 border-rose-300',
              }[order.orderStatus || 'placed'] || 'bg-slate-100 text-slate-800 border-slate-300';

              return (
                <div
                  key={order._id || order.orderNumber}
                  className="bg-white border border-borderDark rounded-2xl p-4 shadow-soft space-y-3"
                >
                  {/* Header info */}
                  <div className="flex items-start justify-between border-b border-neutral-100 pb-2.5">
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-mono font-black text-xs text-brand bg-brand-light px-2 py-0.5 rounded">
                          #{order.orderNumber}
                        </span>
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded border ${statusColor}`}>
                          {(order.orderStatus || 'placed').replace('_', ' ')}
                        </span>
                        <span className="text-[10px] text-text-muted">
                          • {new Date(order.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="font-black text-sm text-text-primary">₹{order.total}</span>
                      {order.shippingPending && (
                        <p className="text-[9px] font-bold uppercase text-amber-600">+ Delivery: confirm by phone</p>
                      )}
                      <p className="text-[9px] font-bold uppercase text-emerald-600">
                        {order.paymentMethod === 'cod' ? 'Cash on Delivery (COD)' : order.paymentStatus || 'paid'}
                      </p>
                    </div>
                  </div>

                  {/* Customer Information & Quick Contact Box */}
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] font-extrabold uppercase tracking-wider text-text-muted flex items-center gap-1">
                        <span className="material-symbols-outlined text-[15px] text-brand">person</span>
                        Customer & Enquiry Call
                      </p>
                      {/* One-click Call and WhatsApp buttons */}
                      <div className="flex items-center gap-1.5">
                        {customerPhone && (
                          <a
                            href={`tel:${customerPhone}`}
                            className="inline-flex items-center gap-1 font-bold text-[11px] text-brand bg-white border border-brand/30 hover:bg-brand hover:text-white px-2.5 py-1 rounded-lg transition-colors shadow-2xs"
                          >
                            <span className="material-symbols-outlined text-[14px]">call</span>
                            <span>Call</span>
                          </a>
                        )}
                        {waUrl && (
                          <a
                            href={waUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 font-bold text-[11px] text-emerald-700 bg-emerald-50 hover:bg-emerald-600 hover:text-white border border-emerald-300 px-2.5 py-1 rounded-lg transition-colors shadow-2xs"
                          >
                            <span className="material-symbols-outlined text-[14px]">chat</span>
                            <span>WhatsApp</span>
                          </a>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-[10px] text-text-muted font-bold uppercase block">Customer Name:</span>
                        <strong className="text-text-primary text-sm font-black">
                          {customerName}
                        </strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-text-muted font-bold uppercase block">Phone Number:</span>
                        <strong className="text-text-primary text-xs font-mono font-bold">
                          {customerPhone || <span className="text-text-muted italic">Not provided</span>}
                        </strong>
                      </div>
                      {order.guestContact?.email && (
                        <div className="sm:col-span-2">
                          <span className="text-[10px] text-text-muted font-bold uppercase block">Email Address:</span>
                          <a
                            href={`mailto:${order.guestContact.email}`}
                            className="text-text-secondary hover:text-brand font-medium text-xs inline-flex items-center gap-1"
                          >
                            <span className="material-symbols-outlined text-[14px]">mail</span>
                            <span>{order.guestContact.email}</span>
                          </a>
                        </div>
                      )}
                    </div>

                    {/* Delivery Address */}
                    {order.shippingAddress?.line1 && (
                      <div className="pt-2 border-t border-slate-200/80 text-[11px] text-text-secondary">
                        <span className="text-[10px] text-text-muted font-bold uppercase block">Delivery Address:</span>
                        <p className="font-semibold text-text-primary mt-0.5">
                          {order.shippingAddress.line1} {order.shippingAddress.line2 || ''}
                        </p>
                        <p>{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}</p>
                      </div>
                    )}
                  </div>

                  {/* Ordered Items Breakdown */}
                  <div className="space-y-1 text-xs">
                    <p className="font-bold text-text-primary text-[10px] uppercase">Items to Print & Pack:</p>
                    {order.items?.map((it, idx) => (
                      <div key={idx} className="flex justify-between items-center py-1 border-b border-neutral-50 last:border-0">
                        <span>
                          <strong className="text-text-primary">{it.name}</strong> ({it.size} {it.color ? `• ${it.color}` : ''}) × {it.quantity}
                        </span>
                        <span className="font-semibold text-text-primary">₹{it.price * it.quantity}</span>
                      </div>
                    ))}
                  </div>

                  {/* 1-Click Workflow Progression Step */}
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="text-[11px] font-bold text-text-secondary">
                      {order.orderStatus === 'placed' && (
                        <span className="text-amber-700 flex items-center gap-1">
                          <span className="material-symbols-outlined text-[16px]">phone_in_talk</span>
                          Step 1: Call customer to enquire & confirm sizes.
                        </span>
                      )}
                      {order.orderStatus === 'confirmed' && (
                        <span className="text-indigo-700 flex items-center gap-1">
                          <span className="material-symbols-outlined text-[16px]">print</span>
                          Step 2: Customer confirmed! Ready for printing machine.
                        </span>
                      )}
                      {order.orderStatus === 'in_printing' && (
                        <span className="text-purple-700 flex items-center gap-1">
                          <span className="material-symbols-outlined text-[16px]">inventory_2</span>
                          Step 3: In printing & packaging. Ready to dispatch.
                        </span>
                      )}
                      {order.orderStatus === 'shipped' && (
                        <span className="text-cyan-700 flex items-center gap-1">
                          <span className="material-symbols-outlined text-[16px]">local_shipping</span>
                          Step 4: Shipped via courier. Awaiting delivery.
                        </span>
                      )}
                      {order.orderStatus === 'delivered' && (
                        <span className="text-emerald-700 flex items-center gap-1">
                          <span className="material-symbols-outlined text-[16px]">check_circle</span>
                          Work Finished: Order delivered to customer.
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 self-end sm:self-auto">
                      {order.orderStatus === 'placed' && (
                        <button
                          type="button"
                          disabled={statusUpdating === order._id}
                          onClick={() => handleStatusChange(order._id, 'confirmed')}
                          className="text-[11px] font-bold bg-amber-500 hover:bg-amber-600 text-white px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-2xs"
                        >
                          <span className="material-symbols-outlined text-[14px]">check</span>
                          <span>Mark Confirmed</span>
                        </button>
                      )}
                      {order.orderStatus === 'confirmed' && (
                        <button
                          type="button"
                          disabled={statusUpdating === order._id}
                          onClick={() => handleStatusChange(order._id, 'in_printing')}
                          className="text-[11px] font-bold bg-indigo-600 hover:bg-indigo-700 text-white px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-2xs"
                        >
                          <span className="material-symbols-outlined text-[14px]">print</span>
                          <span>Start Printing</span>
                        </button>
                      )}
                      {order.orderStatus === 'in_printing' && (
                        <button
                          type="button"
                          disabled={statusUpdating === order._id}
                          onClick={() => handleStatusChange(order._id, 'shipped')}
                          className="text-[11px] font-bold bg-blue-600 hover:bg-blue-700 text-white px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-2xs"
                        >
                          <span className="material-symbols-outlined text-[14px]">local_shipping</span>
                          <span>Mark Shipped</span>
                        </button>
                      )}
                      {order.orderStatus === 'shipped' && (
                        <button
                          type="button"
                          disabled={statusUpdating === order._id}
                          onClick={() => handleStatusChange(order._id, 'delivered')}
                          className="text-[11px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-2xs"
                        >
                          <span className="material-symbols-outlined text-[14px]">task_alt</span>
                          <span>Mark Delivered</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Action row: Manual Status & Delete Order */}
                  <div className="pt-2 border-t border-neutral-100 flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold text-text-muted">Status:</span>
                      <select
                        value={order.orderStatus || 'placed'}
                        disabled={statusUpdating === order._id}
                        onChange={(e) => handleStatusChange(order._id, e.target.value)}
                        className="bg-white border border-borderDark rounded-lg px-2 py-1 text-xs font-bold text-text-primary focus:outline-none focus:border-brand"
                      >
                        <option value="placed">Placed</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="in_printing">In Printing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>

                    {/* Delete Order Button */}
                    <button
                      type="button"
                      onClick={() => handleDeleteOrder(order._id, order.orderNumber)}
                      className="text-[11px] font-bold text-red-600 hover:text-white hover:bg-red-600 border border-red-200 hover:border-red-600 px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all"
                      title="Permanently remove order from backend database"
                    >
                      <span className="material-symbols-outlined text-[14px]">delete</span>
                      <span>Delete from Backend</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* 2. Drops & Products Tab Content */}
      {activeTab === 'products' && (
        <div className="space-y-4">
          {/* Action Header */}
          <div className="bg-white border border-borderDark rounded-2xl p-4 shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="font-heading font-black text-sm text-text-primary uppercase tracking-tight flex items-center gap-1.5">
                <span className="material-symbols-outlined text-brand text-[20px]">apparel</span>
                Streetwear Drops & Product Catalog
              </h2>
              <p className="text-[11px] text-text-muted">
                Add new t-shirts & hoodies or toggle live availability in real-time.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setShowAddForm(!showAddForm);
                setLaunchError('');
                setLaunchSuccess('');
              }}
              className="btn-primary text-xs py-2 px-3.5 rounded-xl flex items-center justify-center gap-1.5 shadow-md self-start sm:self-auto"
            >
              <span className="material-symbols-outlined text-[16px]">
                {showAddForm ? 'close' : 'add_circle'}
              </span>
              <span>{showAddForm ? 'Close Form' : '+ Launch New Drop'}</span>
            </button>
          </div>

          {/* Success / Error Feedback Alert */}
          {launchSuccess && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3.5 rounded-xl text-xs flex items-center justify-between animate-in fade-in">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-600 text-[20px]">check_circle</span>
                <span className="font-bold">{launchSuccess}</span>
              </div>
              <button
                type="button"
                onClick={() => setLaunchSuccess('')}
                className="text-emerald-700 hover:text-emerald-900"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            </div>
          )}

          {launchError && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3.5 rounded-xl text-xs flex items-center justify-between animate-in fade-in">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-red-600 text-[20px]">error</span>
                <span className="font-bold">{launchError}</span>
              </div>
              <button
                type="button"
                onClick={() => setLaunchError('')}
                className="text-red-600 hover:text-red-900"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            </div>
          )}

          {/* Launch New Drop Form */}
          {showAddForm && (
            <form
              onSubmit={handlePublishProduct}
              className="bg-white border-2 border-brand/40 rounded-2xl p-5 shadow-card space-y-4 animate-in fade-in duration-200"
            >
              <div className="border-b border-neutral-100 pb-3 flex items-center justify-between">
                <div>
                  <span className="bg-brand text-white text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded">
                    Store Owner Drop Creator
                  </span>
                  <h3 className="font-heading font-black text-base text-text-primary mt-1">
                    Launch New Product Drop
                  </h3>
                </div>
                <span className="text-[11px] text-text-muted">Appears immediately on live store</span>
              </div>

              {/* 1. Photos Upload Section */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-primary block">
                  Product Photos <span className="text-brand">*</span>
                </label>
                <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center hover:border-brand transition-colors bg-slate-50/50">
                  <input
                    type="file"
                    id="dropImageUpload"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={uploadingImage}
                  />
                  <label
                    htmlFor="dropImageUpload"
                    className="cursor-pointer flex flex-col items-center justify-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-brand text-[36px]">
                      {uploadingImage ? 'hourglass_top' : 'add_photo_alternate'}
                    </span>
                    <span className="text-xs font-bold text-text-primary">
                      {uploadingImage ? 'Uploading Image to Server...' : 'Click to Upload Product Photo'}
                    </span>
                    <span className="text-[10px] text-text-muted">
                      Select PNG, JPG, or WEBP from your computer
                    </span>
                  </label>
                </div>

                {/* Or paste image URL directly */}
                <div className="flex gap-2 pt-1">
                  <input
                    type="text"
                    placeholder="Or enter image path (e.g. /images/hoodie-tokyo.jpg)"
                    value={imageUrlInput}
                    onChange={(e) => setImageUrlInput(e.target.value)}
                    className="input-field text-xs py-2 flex-1"
                  />
                  <button
                    type="button"
                    onClick={handleAddImageUrl}
                    className="btn-outline text-xs py-2 px-3 whitespace-nowrap"
                  >
                    Add Image Path
                  </button>
                </div>

                {/* Uploaded Images Preview Thumbnails */}
                {newProduct.images.length > 0 && (
                  <div className="flex gap-2 overflow-x-auto py-2">
                    {newProduct.images.map((imgUrl, idx) => (
                      <div
                        key={idx}
                        className="relative w-20 h-24 rounded-lg overflow-hidden border border-slate-200 flex-shrink-0 group"
                      >
                        <Image
                          src={imgUrl}
                          alt="Product preview"
                          fill
                          sizes="80px"
                          className="object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          className="absolute top-1 right-1 bg-neutral-900/80 hover:bg-red-600 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs transition-colors"
                        >
                          ✕
                        </button>
                        {idx === 0 && (
                          <span className="absolute bottom-1 left-1 bg-brand text-white text-[8px] font-extrabold px-1 rounded">
                            Cover
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 2. Title & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-text-primary block mb-1">
                    Product Title <span className="text-brand">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Tokyo Midnight Drift Hoodie"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                    className="input-field text-xs py-2.5"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-text-primary block mb-1">
                    Category <span className="text-brand">*</span>
                  </label>
                  <select
                    value={newProduct.category}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    className="input-field text-xs py-2.5 font-bold"
                  >
                    <option value="hoodies">🧥 Heavyweight Hoodies</option>
                    <option value="tees">👕 Printed Graphic Tees</option>
                    <option value="caps">🧢 Caps & Beanies</option>
                    <option value="joggers">👖 Cargo Joggers</option>
                    <option value="jackets">🧥 Bomber Jackets</option>
                  </select>
                </div>
              </div>

              {/* 3. Pricing & Member Club */}
              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="text-[11px] font-bold text-text-primary block mb-1">
                    Selling Price (₹) <span className="text-brand">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    placeholder={newProduct.category === 'hoodies' ? '1399' : '799'}
                    value={newProduct.price}
                    onChange={(e) => {
                      const p = e.target.value;
                      setNewProduct({
                        ...newProduct,
                        price: p,
                        mrp: newProduct.mrp || (p ? Math.round(Number(p) * 1.6) : ''),
                        memberPrice: newProduct.memberPrice || (p ? Math.max(Number(p) - 100, 100) : ''),
                      });
                    }}
                    className="input-field text-xs py-2 font-black text-brand"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-text-primary block mb-1">
                    MRP Cut Price (₹)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 2199"
                    value={newProduct.mrp}
                    onChange={(e) => setNewProduct({ ...newProduct, mrp: e.target.value })}
                    className="input-field text-xs py-2"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-text-primary block mb-1">
                    Member Price (₹)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 1249"
                    value={newProduct.memberPrice}
                    onChange={(e) => setNewProduct({ ...newProduct, memberPrice: e.target.value })}
                    className="input-field text-xs py-2"
                  />
                </div>
              </div>

              {/* 4. Specs: Fabric, Fit & Badge */}
              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="text-[11px] font-bold text-text-primary block mb-1">
                    Fabric / GSM
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 320 GSM Brushed Fleece"
                    value={newProduct.fabric}
                    onChange={(e) => setNewProduct({ ...newProduct, fabric: e.target.value })}
                    className="input-field text-xs py-2"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-text-primary block mb-1">
                    Fit Type
                  </label>
                  <select
                    value={newProduct.fit}
                    onChange={(e) => setNewProduct({ ...newProduct, fit: e.target.value })}
                    className="input-field text-xs py-2"
                  >
                    <option value="Oversized">Oversized</option>
                    <option value="Regular">Regular</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-text-primary block mb-1">
                    Card Badge Tag
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. NEW DROP"
                    value={newProduct.badgeText}
                    onChange={(e) => setNewProduct({ ...newProduct, badgeText: e.target.value })}
                    className="input-field text-xs py-2 font-extrabold uppercase text-brand"
                  />
                </div>
              </div>

              {/* 5. Inventory Stock per Size */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-primary block">
                  Initial Stock Per Size:
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {newProduct.sizes.map((s) => (
                    <div key={s.size} className="bg-slate-50 border border-slate-200 rounded-xl p-2 text-center">
                      <span className="font-heading font-black text-xs text-text-primary block">
                        Size {s.size}
                      </span>
                      <input
                        type="number"
                        min="0"
                        value={s.stock}
                        onChange={(e) => handleSizeStockChange(s.size, e.target.value)}
                        className="w-full text-center font-bold text-xs bg-white border border-slate-200 rounded-md py-1 mt-1"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* 6. Description */}
              <div>
                <label className="text-xs font-bold text-text-primary block mb-1">
                  Product Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Describe the artwork, style, inspiration, and washing care..."
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  className="input-field text-xs py-2"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-2 border-t border-neutral-100">
                <button
                  type="submit"
                  disabled={launching}
                  className="btn-primary w-full py-3 text-xs font-black shadow-md flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {launching ? 'sync' : 'rocket_launch'}
                  </span>
                  <span>{launching ? 'Publishing to Store...' : 'PUBLISH DROP (GO LIVE NOW)'}</span>
                </button>
              </div>
            </form>
          )}

          {/* Category Filter Chips */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            <button
              type="button"
              onClick={() => setProductCategoryFilter('all')}
              className={`chip ${productCategoryFilter === 'all' ? 'chip-active' : ''}`}
            >
              All Drops ({products.length})
            </button>
            <button
              type="button"
              onClick={() => setProductCategoryFilter('tees')}
              className={`chip ${productCategoryFilter === 'tees' ? 'chip-active' : ''}`}
            >
              👕 Tees ({products.filter((p) => p.category === 'tees').length})
            </button>
            <button
              type="button"
              onClick={() => setProductCategoryFilter('hoodies')}
              className={`chip ${productCategoryFilter === 'hoodies' ? 'chip-active' : ''}`}
            >
              🧥 Hoodies ({products.filter((p) => p.category === 'hoodies').length})
            </button>
          </div>

          {/* Current Products List */}
          <div className="space-y-3">
            {products
              .filter((p) => productCategoryFilter === 'all' || p.category === productCategoryFilter)
              .map((product) => {
                const totalStock = product.sizes?.reduce((sum, s) => sum + (s.stock || 0), 0) ?? 0;
                const isItemActive = product.isActive !== false;

                return (
                  <div
                    key={product._id || product.slug}
                    className={`bg-white border rounded-2xl p-3.5 shadow-soft transition-all duration-200 ${
                      isItemActive ? 'border-borderDark' : 'border-slate-300 opacity-60 bg-slate-50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Product Thumbnail */}
                      <div className="relative w-16 h-20 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0 border border-slate-200">
                        {product.images?.[0] ? (
                          <Image
                            src={product.images[0]}
                            alt={product.name}
                            fill
                            sizes="64px"
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[10px] text-text-muted">
                            No photo
                          </div>
                        )}
                        {product.badgeText && (
                          <span className="absolute top-1 left-1 bg-text-primary text-white text-[7px] font-black px-1 rounded">
                            {product.badgeText}
                          </span>
                        )}
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="bg-slate-100 text-text-secondary text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase">
                              {product.category === 'hoodies' ? 'Heavyweight Hoodie' : 'Printed Tee'}
                            </span>
                            <h3 className="font-heading font-black text-xs text-text-primary truncate mt-0.5">
                              {product.name}
                            </h3>
                          </div>

                          <div className="text-right flex-shrink-0">
                            {editingPriceId === (product._id || product.slug) ? (
                              <div className="flex flex-col items-end gap-1">
                                <div className="flex items-center gap-1">
                                  <span className="text-sm font-black">₹</span>
                                  <input
                                    type="number"
                                    min="1"
                                    value={priceDraft}
                                    onChange={(e) => setPriceDraft(e.target.value)}
                                    className="w-20 border border-borderDark rounded-lg px-1.5 py-1 text-xs font-bold"
                                    aria-label="New price"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => handleSavePrice(product._id || product.slug)}
                                    className="text-[10px] font-bold px-2 py-1 rounded-lg bg-brand text-white"
                                  >
                                    Save
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditingPriceId(null);
                                      setPriceError('');
                                    }}
                                    className="text-[10px] font-bold px-1.5 py-1 text-text-muted"
                                  >
                                    Cancel
                                  </button>
                                </div>
                                {priceError && <span className="text-[10px] text-red-600 font-bold">{priceError}</span>}
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingPriceId(product._id || product.slug);
                                  setPriceDraft(String(product.price ?? ''));
                                  setPriceError('');
                                }}
                                className="font-black text-sm text-text-primary hover:text-brand"
                                title="Edit price"
                              >
                                ₹{product.price}
                                <span className="material-symbols-outlined text-[13px] align-middle ml-0.5 text-text-muted">edit</span>
                              </button>
                            )}
                            {product.mrp && (
                              <span className="block text-[10px] text-text-muted line-through">
                                ₹{product.mrp}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="mt-2 flex flex-wrap items-center gap-2 text-[10px]">
                          <span className="text-text-muted">
                            Sizes: {product.sizes?.map((s) => `${s.size}:${s.stock}`).join(' ') || 'Standard'}
                          </span>
                          <span>•</span>
                          <span className={totalStock > 0 ? 'text-emerald-600 font-bold' : 'text-red-500 font-bold'}>
                            {totalStock > 0 ? `${totalStock} in stock` : 'Out of stock'}
                          </span>
                          <span>•</span>
                          <span className={isItemActive ? 'text-emerald-700 font-black' : 'text-neutral-500 font-bold'}>
                            {isItemActive ? '● Active Live' : '○ Paused'}
                          </span>
                        </div>

                        {/* Action Buttons Row */}
                        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                          <Link
                            href={`/product/${product.slug}`}
                            target="_blank"
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-brand hover:underline"
                          >
                            <span>View on Store</span>
                            <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                          </Link>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleToggleProductActive(product._id || product.slug, isItemActive)}
                              className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition-colors ${
                                isItemActive
                                  ? 'bg-neutral-100 text-neutral-700 border-neutral-300 hover:bg-neutral-200'
                                  : 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                              }`}
                            >
                              {isItemActive ? 'Pause Drop' : 'Make Live'}
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeleteProduct(product._id || product.slug, product.name)}
                              className="text-[10px] font-bold px-2 py-1 rounded-lg text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 transition-colors"
                              title="Delete Drop"
                            >
                              <span className="material-symbols-outlined text-[15px] align-middle">delete</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* 3. Custom Prints Tab Content */}
      {activeTab === 'custom' && (
        <div className="space-y-3">
          {customOrders.length === 0 ? (
            <div className="bg-white border border-borderDark rounded-2xl p-8 text-center text-xs text-text-muted">
              No custom print submissions yet.
            </div>
          ) : (
            customOrders.map((cust) => {
              const cleanPhone = cust.contact?.phone?.replace(/\D/g, '').slice(-10);
              return (
                <div key={cust._id || cust.referenceId} className="bg-white border border-borderDark rounded-2xl p-4 shadow-soft space-y-3">
                  {/* Top Bar: Reference ID & Garment Badge */}
                  <div className="flex items-start justify-between border-b border-neutral-100 pb-2.5">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-xs text-brand bg-brand-light px-2 py-0.5 rounded">
                          #{cust.referenceId}
                        </span>
                        {cust.createdAt && (
                          <span className="text-[10px] text-text-muted">
                            • {new Date(cust.createdAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="bg-neutral-900 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded">
                      {cust.garment?.type || 'Custom Garment'}
                    </span>
                  </div>

                  {/* Customer Contact Details Box */}
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
                    <p className="text-[10px] font-extrabold uppercase tracking-wider text-text-muted flex items-center gap-1">
                      <span className="material-symbols-outlined text-[15px] text-brand">contact_phone</span>
                      Customer Contact Details
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-[10px] text-text-muted font-bold uppercase block">Customer Name:</span>
                        <strong className="text-text-primary text-sm font-black">
                          {cust.contact?.name || 'Name not provided'}
                        </strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-text-muted font-bold uppercase block">Phone Number:</span>
                        {cust.contact?.phone ? (
                          <a
                            href={`tel:${cust.contact.phone}`}
                            className="inline-flex items-center gap-1 font-black text-xs text-brand hover:underline bg-white border border-brand/20 px-2 py-1 rounded-md mt-0.5"
                          >
                            <span className="material-symbols-outlined text-[14px]">call</span>
                            <span>{cust.contact.phone}</span>
                          </a>
                        ) : (
                          <span className="text-text-muted italic">Not provided</span>
                        )}
                      </div>
                      {cust.contact?.email && (
                        <div className="sm:col-span-2">
                          <span className="text-[10px] text-text-muted font-bold uppercase block">Email Address:</span>
                          <a
                            href={`mailto:${cust.contact.email}`}
                            className="text-text-secondary hover:text-brand font-medium text-xs inline-flex items-center gap-1"
                          >
                            <span className="material-symbols-outlined text-[14px]">mail</span>
                            <span>{cust.contact.email}</span>
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Garment Details */}
                  <div className="text-xs space-y-1 bg-neutral-50 p-2.5 rounded-xl border border-neutral-100">
                    <p className="text-[10px] font-bold uppercase text-text-muted">Garment Specifications:</p>
                    <p><strong>Color & Size:</strong> {cust.garment?.color || 'Standard'}, Size {cust.garment?.size || 'M'}</p>
                    <p><strong>Print Placement:</strong> <span className="uppercase font-semibold">{cust.printPlacement?.replace(/_/g, ' ')}</span></p>
                    {cust.designDescription && (
                      <p className="text-text-secondary text-[11px] pt-1 border-t border-neutral-200 mt-1">
                        <strong>Design Idea:</strong> "{cust.designDescription}"
                      </p>
                    )}
                    {cust.notes && (
                      <p className="text-text-muted text-[11px] italic">
                        <strong>Notes:</strong> "{cust.notes}"
                      </p>
                    )}
                  </div>

                  {/* Artwork Preview if uploaded */}
                  {cust.designFileUrl && (
                    <div className="pt-1">
                      <p className="text-[10px] font-bold text-text-muted uppercase mb-1">Uploaded Artwork:</p>
                      <a href={cust.designFileUrl} target="_blank" rel="noreferrer" className="block relative w-24 h-24 rounded-xl border border-borderDark overflow-hidden bg-slate-50">
                        <Image src={cust.designFileUrl} alt="Artwork" fill sizes="96px" unoptimized className="object-cover" />
                      </a>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* 3. Bulk Orders Tab Content */}
      {activeTab === 'bulk' && (
        <div className="space-y-3">
          {bulkOrders.length === 0 ? (
            <div className="bg-white border border-borderDark rounded-2xl p-8 text-center text-xs text-text-muted">
              No college bulk inquiries yet.
            </div>
          ) : (
            bulkOrders.map((bulk) => {
              const cleanPhone = bulk.contact?.phone?.replace(/\D/g, '').slice(-10);
              return (
                <div key={bulk._id} className="bg-white border border-borderDark rounded-2xl p-4 shadow-soft space-y-3">
                  <div className="flex items-start justify-between border-b border-neutral-100 pb-2">
                    <div>
                      <h2 className="font-heading font-black text-xs text-text-primary">{bulk.organizationName}</h2>
                      <p className="text-[11px] text-text-secondary mt-0.5">Contact: {bulk.contact?.name} • {bulk.contact?.phone}</p>
                    </div>
                    {bulk.budget && (
                      <span className="font-black text-xs text-brand">₹{bulk.budget.toLocaleString()}</span>
                    )}
                  </div>

                  <div className="text-xs space-y-1.5">
                    <p className="text-[10px] font-bold text-text-muted uppercase">Quantities & Sizes:</p>
                    {bulk.items?.map((it, idx) => (
                      <div key={idx} className="bg-neutral-50 p-2 rounded-lg text-[11px]">
                        <p className="font-bold text-text-primary">{it.productType}</p>
                        <p className="text-text-secondary">
                          {it.sizeBreakdown?.map((s) => `${s.size}: ${s.quantity}`).join(' | ')}
                        </p>
                      </div>
                    ))}
                    {bulk.expectedDate && (
                      <p className="text-[11px] text-text-muted">
                        <strong>Expected Delivery:</strong> {bulk.expectedDate}
                      </p>
                    )}
                    {bulk.notes && (
                      <p className="text-[11px] text-text-secondary italic">"{bulk.notes}"</p>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* 4. Registered Customers Tab Content */}
      {activeTab === 'customers' && (
        <div className="space-y-3">
          {customers.length === 0 ? (
            <div className="bg-white border border-borderDark rounded-2xl p-8 text-center text-xs text-text-muted">
              No registered customer accounts yet.
            </div>
          ) : (
            customers.map((cust) => (
              <div key={cust._id} className="bg-white border border-borderDark rounded-2xl p-3.5 shadow-soft flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-brand-light text-brand font-black text-xs flex items-center justify-center">
                    {cust.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="font-bold text-xs text-text-primary">{cust.name}</h2>
                    <p className="text-[11px] text-text-muted">{cust.email} • {cust.phone}</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-neutral-400">
                  {cust.createdAt ? new Date(cust.createdAt).toLocaleDateString() : 'Customer'}
                </span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

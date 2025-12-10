import React, { useState, useEffect } from 'react';
import { Package, Clock, CheckCircle, Truck, LogOut, Coffee, Search, Plus } from 'lucide-react';
import { supabase } from '../lib/supabaseclient';
import Swal from 'sweetalert2';
import WalkInOrderModal from '../components/WalkInOrderModal';

const StaffDashboard = ({ onLogout }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' or 'menu'

  // Menu state
  const [menuItems, setMenuItems] = useState([]);
  const [menuLoading, setMenuLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null); // For order modal

  const fetchOrders = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('orders')
        .select('id, total_price, status, created_at, user_id, order_items (id, product_name, product_image, quantity, size, price)')
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching staff orders:', error);
        setOrders([]);
        return;
      }

      const mapped = (data || []).map((order) => {
        const createdAt = order.created_at ? new Date(order.created_at) : null;
        const items = (order.order_items || []).map((item) => ({
          id: item.id,
          name: item.product_name,
          image: item.product_image,
          quantity: item.quantity ?? 1,
          size: item.size || '',
          price: item.price || 0,
        }));

        const itemsTotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        return {
          id: order.id,
          status: order.status || 'pending',
          customerName: `Customer ${order.user_id ? order.user_id.slice(-4) : ''}`.trim(),
          date: createdAt
            ? createdAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
            : '',
          time: createdAt
            ? createdAt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
            : '',
          address: 'Pickup - In Store',
          items,
          total: typeof order.total_price === 'number' ? order.total_price : itemsTotal,
          createdAtMs: createdAt ? createdAt.getTime() : 0,
          updating: false,
        };
      });

      const statusPriority = {
        paid: 0, // Paid orders should be treated as pending for staff
        pending: 0,
        preparing: 1,
        ready: 2,
        completed: 3,
      };

      mapped.sort((a, b) => {
        const sa = statusPriority[a.status] ?? 99;
        const sb = statusPriority[b.status] ?? 99;
        if (sa !== sb) return sa - sb;
        // Within the same status, latest order first
        return (b.createdAtMs || 0) - (a.createdAtMs || 0);
      });

      setOrders(mapped);
    } catch (err) {
      console.error('Unexpected error fetching staff orders:', err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    if (activeTab === 'menu') {
      fetchMenuProducts();
    }
  }, [activeTab]);

  const fetchMenuProducts = async () => {
    setMenuLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('category', { ascending: true });

      if (error) throw error;
      setMenuItems(data || []);
    } catch (error) {
      console.error('Error fetching menu products:', error);
    } finally {
      setMenuLoading(false);
    }
  };

  const addToWalkInCart = (item) => {
    setSelectedProduct(item);
  };

  const handleAddToWalkInCart = async (orderItem) => {
    try {
      const result = await Swal.fire({
        title: 'Walk-in Order',
        html: `
          <div style="text-align: left; padding: 10px;">
            <p style="margin-bottom: 10px;"><strong>Item:</strong> ${orderItem.name}</p>
            <p style="margin-bottom: 10px;"><strong>Quantity:</strong> ${orderItem.quantity}</p>
            <p style="margin-bottom: 10px;"><strong>Total:</strong> ₱${orderItem.totalPrice.toLocaleString('en-US')}</p>
            <p style="margin-top: 20px; margin-bottom: 10px; color: #666;">Customer Name (Optional):</p>
            <input type="text" id="customerName" class="swal2-input" placeholder="Walk-in Customer" style="margin: 0;">
          </div>
        `,
        showCancelButton: true,
        confirmButtonText: 'Confirm Order',
        confirmButtonColor: '#f97316',
        cancelButtonColor: '#6b7280',
      });

      if (!result.isConfirmed) return;

      const customerName = document.getElementById('customerName').value || 'Walk-in Customer';

      // Get current staff user ID
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        Swal.fire({
          icon: 'error',
          title: 'Authentication Error',
          text: 'Please log in again to create orders.',
          confirmButtonColor: '#f97316',
        });
        return;
      }

      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert([{
          user_id: user.id, // Use staff member's ID
          total_price: orderItem.totalPrice,
          status: 'pending',
        }])
        .select()
        .single();

      if (orderError) throw orderError;

      const { error: itemError } = await supabase
        .from('order_items')
        .insert([{
          order_id: orderData.id,
          product_id: orderItem.id || null,
          product_name: `${orderItem.name} (Walk-in: ${customerName})`, // Add customer name to product name
          product_description: orderItem.description || '',
          product_image: orderItem.image || '',
          quantity: orderItem.quantity,
          price: orderItem.pricePerItem || orderItem.price,
          size: orderItem.size || 'Regular',
          ice_level: orderItem.ice_level || null,
          sugar_level: orderItem.sugar_level || null,
          category: orderItem.category || null,
          special_request: orderItem.special_request || null,
        }]);

      if (itemError) throw itemError;

      setActiveTab('orders');
      fetchOrders();

      Swal.fire({
        icon: 'success',
        title: 'Order Created!',
        text: `Walk-in order for ${customerName} has been placed successfully`,
        confirmButtonColor: '#f97316',
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error('Error creating walk-in order:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to create order. Please try again.',
        confirmButtonColor: '#f97316',
      });
    }
  };


  const getStatusInfo = (status) => {
    switch (status) {
      case 'paid':
        return { icon: Clock, color: 'from-yellow-500 to-orange-500', bg: 'bg-yellow-50', text: 'text-yellow-700', label: 'Pending' };
      case 'pending':
        return { icon: Clock, color: 'from-yellow-500 to-orange-500', bg: 'bg-yellow-50', text: 'text-yellow-700', label: 'Pending' };
      case 'preparing':
        return { icon: Package, color: 'from-blue-500 to-cyan-500', bg: 'bg-blue-50', text: 'text-blue-700', label: 'Preparing' };
      case 'ready':
        return { icon: CheckCircle, color: 'from-green-500 to-emerald-500', bg: 'bg-green-50', text: 'text-green-700', label: 'Ready' };
      case 'completed':
        return { icon: CheckCircle, color: 'from-green-600 to-emerald-600', bg: 'bg-green-50', text: 'text-green-700', label: 'Completed' };
      default:
        return { icon: Clock, color: 'from-gray-500 to-gray-600', bg: 'bg-gray-50', text: 'text-gray-700', label: status };
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      setOrders(prev => prev.map(order =>
        order.id === orderId ? { ...order, updating: true } : order
      ));

      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) {
        throw error;
      }

      setOrders(prev => prev.map(order =>
        order.id === orderId ? { ...order, status: newStatus, updating: false } : order
      ));
    } catch (err) {
      console.error('Error updating order status:', err);
      alert('Failed to update order status. Please try again.');
      setOrders(prev => prev.map(order =>
        order.id === orderId ? { ...order, updating: false } : order
      ));
    }
  };

  const getNextStatus = (currentStatus) => {
    const statusFlow = {
      'paid': 'preparing', // Paid orders go directly to preparing
      'pending': 'preparing',
      'preparing': 'ready',
      'ready': 'completed'
    };
    return statusFlow[currentStatus] || currentStatus;
  };

  // Filter orders based on active filter
  const filteredOrders = activeFilter === 'all'
    ? orders
    : activeFilter === 'pending'
      ? orders.filter(order => order.status === 'pending' || order.status === 'paid')
      : orders.filter(order => order.status === activeFilter);

  // Filter configurations with color coding
  const filters = [
    {
      id: 'all',
      label: 'All Orders',
      icon: Package,
      gradient: 'from-gray-500 to-gray-600',
      bg: 'bg-gray-100',
      activeBg: 'bg-gradient-to-r from-gray-500 to-gray-600',
      text: 'text-gray-700',
      activeText: 'text-white'
    },
    {
      id: 'pending',
      label: 'Pending',
      icon: Clock,
      gradient: 'from-yellow-500 to-orange-500',
      bg: 'bg-yellow-50',
      activeBg: 'bg-gradient-to-r from-yellow-500 to-orange-500',
      text: 'text-yellow-700',
      activeText: 'text-white'
    },
    {
      id: 'preparing',
      label: 'Preparing',
      icon: Package,
      gradient: 'from-blue-500 to-cyan-500',
      bg: 'bg-blue-50',
      activeBg: 'bg-gradient-to-r from-blue-500 to-cyan-500',
      text: 'text-blue-700',
      activeText: 'text-white'
    },
    {
      id: 'ready',
      label: 'Ready',
      icon: CheckCircle,
      gradient: 'from-green-500 to-emerald-500',
      bg: 'bg-green-50',
      activeBg: 'bg-gradient-to-r from-green-500 to-emerald-500',
      text: 'text-green-700',
      activeText: 'text-white'
    },
    {
      id: 'completed',
      label: 'Completed',
      icon: Truck,
      gradient: 'from-emerald-600 to-green-600',
      bg: 'bg-emerald-50',
      activeBg: 'bg-gradient-to-r from-emerald-600 to-green-600',
      text: 'text-emerald-700',
      activeText: 'text-white'
    }
  ];

  // Menu categories and filtering
  const categories = ['All', 'Hot Drinks', 'Cold Drinks', 'Pastries', 'Meals'];

  const getFilteredMenuItems = () => {
    if (!menuItems) return [];

    let items =
      activeCategory === 'All'
        ? [...menuItems]
        : menuItems.filter(item => item.category === activeCategory);

    if (searchQuery) {
      items = items.filter(item =>
        (item.name && item.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    return items;
  };

  const filteredMenuItems = getFilteredMenuItems();

  return (
    <>
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50/50 to-orange-50">
        {/* Header */}
        <div className="bg-gradient-to-br from-yellow-400 via-orange-400 to-orange-500 px-4 pt-4 pb-3 shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 backdrop-blur-sm p-1.5 rounded-xl">
                  <Package size={22} className="text-white" />
                </div>
                <h1 className="text-xl font-bold text-white drop-shadow-lg">Staff Dashboard</h1>
              </div>
              <button
                onClick={onLogout}
                className="text-white hover:bg-white/20 p-2 rounded-xl transition-all duration-200 hover:scale-110"
              >
                <LogOut size={24} />
              </button>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-4 mt-4 mb-4">
          <div className="flex gap-2 bg-white rounded-2xl p-2 shadow-lg">
            <button
              onClick={() => setActiveTab('orders')}
              className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${activeTab === 'orders'
                ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg'
                : 'text-gray-600 hover:bg-gray-50'
                }`}
            >
              <Package size={20} />
              <span>Orders</span>
            </button>
            <button
              onClick={() => setActiveTab('menu')}
              className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 relative ${activeTab === 'menu'
                ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg'
                : 'text-gray-600 hover:bg-gray-50'
                }`}
            >
              <Coffee size={20} />
              <span>Menu</span>
            </button>
          </div>
        </div>

        {/* Orders Tab Content */}
        {activeTab === 'orders' && (
          <>
            {/* Stats Cards */}
            <div className="px-6 mt-6 mb-4">
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setActiveFilter('pending')}
                  className={`bg-white rounded-2xl p-4 shadow-lg border transition-all duration-300 hover:shadow-xl hover:scale-105 text-left w-full ${activeFilter === 'pending' ? 'border-yellow-400 ring-2 ring-yellow-400' : 'border-gray-100'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-yellow-100 p-3 rounded-xl">
                      <Clock size={24} className="text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Pending</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {orders.filter(o => o.status === 'pending' || o.status === 'paid').length}
                      </p>
                    </div>
                  </div>
                </button>
                <button
                  onClick={() => setActiveFilter('preparing')}
                  className={`bg-white rounded-2xl p-4 shadow-lg border transition-all duration-300 hover:shadow-xl hover:scale-105 text-left w-full ${activeFilter === 'preparing' ? 'border-blue-400 ring-2 ring-blue-400' : 'border-gray-100'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 p-3 rounded-xl">
                      <Package size={24} className="text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Preparing</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {orders.filter(o => o.status === 'preparing').length}
                      </p>
                    </div>
                  </div>
                </button>
                <button
                  onClick={() => setActiveFilter('ready')}
                  className={`bg-white rounded-2xl p-4 shadow-lg border transition-all duration-300 hover:shadow-xl hover:scale-105 text-left w-full ${activeFilter === 'ready' ? 'border-green-400 ring-2 ring-green-400' : 'border-gray-100'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-green-100 p-3 rounded-xl">
                      <CheckCircle size={24} className="text-green-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Ready</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {orders.filter(o => o.status === 'ready').length}
                      </p>
                    </div>
                  </div>
                </button>
                <button
                  onClick={() => setActiveFilter('completed')}
                  className={`bg-white rounded-2xl p-4 shadow-lg border transition-all duration-300 hover:shadow-xl hover:scale-105 text-left w-full ${activeFilter === 'completed' ? 'border-emerald-400 ring-2 ring-emerald-400' : 'border-gray-100'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-emerald-100 p-3 rounded-xl">
                      <Truck size={24} className="text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Completed</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {orders.filter(o => o.status === 'completed').length}
                      </p>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Filter Buttons */}
            <div className="px-6 mt-4 mb-4">
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                {filters.map((filter) => {
                  const FilterIcon = filter.icon;
                  const isActive = activeFilter === filter.id;
                  const count = filter.id === 'all'
                    ? orders.length
                    : filter.id === 'pending'
                      ? orders.filter(o => o.status === 'pending' || o.status === 'paid').length
                      : orders.filter(o => o.status === filter.id).length;

                  return (
                    <button
                      key={filter.id}
                      onClick={() => setActiveFilter(filter.id)}
                      className={`
                  flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm whitespace-nowrap
                  transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg
                  ${isActive
                          ? `${filter.activeBg} ${filter.activeText} shadow-lg scale-105`
                          : `${filter.bg} ${filter.text} hover:${filter.bg}`
                        }
                `}
                    >
                      <FilterIcon size={18} />
                      <span>{filter.label}</span>
                      <span className={`
                  px-2 py-0.5 rounded-full text-xs font-bold
                  ${isActive ? 'bg-white/30' : 'bg-white/60'}
                `}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Orders List */}
            <div className="px-6 py-4 space-y-4 pb-24">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-bold text-gray-800">
                  {activeFilter === 'all'
                    ? 'All Orders'
                    : `${filters.find(f => f.id === activeFilter)?.label} Orders`
                  }
                </h2>
                <span className="text-sm text-gray-500 font-medium">
                  {filteredOrders.length} {filteredOrders.length === 1 ? 'order' : 'orders'}
                </span>
              </div>
              {loading ? (
                <div className="bg-white rounded-3xl p-8 text-center shadow-2xl border border-white/60">
                  <p className="text-gray-700 font-semibold mb-1">Loading orders...</p>
                  <p className="text-gray-500 text-sm">Please wait while we fetch current orders.</p>
                </div>
              ) : filteredOrders.length === 0 ? (
                <div className="bg-white rounded-3xl p-8 text-center shadow-2xl border border-white/60">
                  <p className="text-gray-700 font-semibold mb-1">
                    {activeFilter === 'all' ? 'No orders yet' : `No ${activeFilter} orders`}
                  </p>
                  <p className="text-gray-500 text-sm">
                    {activeFilter === 'all'
                      ? 'New customer orders will appear here in real time.'
                      : `Orders with ${activeFilter} status will appear here.`
                    }
                  </p>
                </div>
              ) : filteredOrders.map((order) => {
                const statusInfo = getStatusInfo(order.status);
                const StatusIcon = statusInfo.icon;
                const nextStatus = getNextStatus(order.status);
                const canUpdate = order.status !== 'completed';

                return (
                  <div
                    key={order.id}
                    className="bg-white/95 rounded-3xl p-5 shadow-xl hover:shadow-2xl transition-all duration-200 border border-orange-100"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-bold text-gray-900 text-lg">Order #{order.id}</h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusInfo.bg} ${statusInfo.text} flex items-center gap-1`}>
                            <StatusIcon size={14} />
                            {statusInfo.label}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">
                          <span className="font-semibold">{order.customerName}</span>
                        </p>
                        <p className="text-xs text-gray-500 mb-2">{order.date} • {order.time}</p>
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                          <span>📍</span>
                          {order.address}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4 max-h-56 overflow-y-auto pr-1">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between bg-gray-50 rounded-xl p-3">
                          <div className="flex-1">
                            <p className="font-semibold text-gray-900 text-sm">{item.name}</p>
                            <p className="text-xs text-gray-500">Qty: {item.quantity} • {item.size || 'Regular'}</p>
                          </div>
                          <p className="font-bold text-orange-600">₱ {(item.price * item.quantity).toLocaleString('en-US')}</p>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-100 mb-4">
                      <span className="text-sm text-gray-600">Total Amount:</span>
                      <span className="font-bold text-xl text-orange-600">₱ {order.total.toLocaleString('en-US')}</span>
                    </div>

                    {canUpdate && (
                      <button
                        onClick={() => updateOrderStatus(order.id, nextStatus)}
                        disabled={order.updating}
                        className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 rounded-xl font-semibold hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02] text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {order.updating ? 'Updating...' : `Update to ${getStatusInfo(nextStatus).label}`}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Menu Tab Content */}
        {activeTab === 'menu' && (
          <div className="px-4 pb-24">
            {/* Search Bar */}
            <div className="mb-4 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search menu items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white shadow-sm"
              />
            </div>

            {/* Category Filters */}
            <div className="mb-4 overflow-x-auto scrollbar-hide">
              <div className="flex gap-2 pb-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setActiveCategory(category)}
                    className={`px-4 py-2 rounded-xl font-semibold text-sm whitespace-nowrap transition-all duration-200 ${activeCategory === category
                      ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg'
                      : 'bg-white text-gray-600 hover:bg-gray-50 shadow-sm'
                      }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Menu Items Grid */}
            {menuLoading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent"></div>
                <p className="mt-4 text-gray-600">Loading menu...</p>
              </div>
            ) : filteredMenuItems.length === 0 ? (
              <div className="text-center py-12">
                <Coffee className="mx-auto text-gray-300 mb-4" size={64} />
                <p className="text-gray-600 font-semibold">No items found</p>
                <p className="text-gray-400 text-sm">Try a different search or category</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {filteredMenuItems.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-2xl p-3 shadow-lg hover:shadow-xl transition-all duration-200 border border-gray-100"
                  >
                    <div className="w-full h-32 bg-gray-100 rounded-xl mb-3 overflow-hidden flex items-center justify-center">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.parentElement.innerHTML = '<span style="font-size: 48px;">☕</span>';
                          }}
                        />
                      ) : (
                        <span style={{ fontSize: '48px' }}>☕</span>
                      )}
                    </div>
                    <h3 className="font-bold text-gray-900 text-sm mb-1 line-clamp-1">{item.name}</h3>
                    <p className="text-xs text-gray-500 mb-2 line-clamp-2">{item.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-orange-600 text-lg">
                        ₱{parseFloat(item.price).toLocaleString('en-US')}
                      </span>
                      <button
                        onClick={() => addToWalkInCart(item)}
                        className="bg-orange-500 text-white p-2 rounded-lg hover:bg-orange-600 transition-all shadow-md hover:shadow-lg transform hover:scale-110"
                      >
                        <Plus size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Walk-in Order Modal */}
      {selectedProduct && (
        <WalkInOrderModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={handleAddToWalkInCart}
        />
      )}
    </>
  );
};

export default StaffDashboard;
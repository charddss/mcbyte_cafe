import React, { useState, useEffect } from 'react';
import { Package, Clock, CheckCircle, Truck, LogOut } from 'lucide-react';
import { supabase } from '../lib/supabaseclient';

const StaffDashboard = ({ onLogout }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
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

    fetchOrders();
  }, []);

  const getStatusInfo = (status) => {
    switch (status) {
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
      'pending': 'preparing',
      'preparing': 'ready',
      'ready': 'completed'
    };
    return statusFlow[currentStatus] || currentStatus;
  };

  return (
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

      {/* Stats Cards */}
      <div className="px-6 mt-6 mb-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="bg-yellow-100 p-3 rounded-xl">
                <Clock size={24} className="text-yellow-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Pending</p>
                <p className="text-2xl font-bold text-gray-900">
                  {orders.filter(o => o.status === 'pending').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100">
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
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100">
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
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100">
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
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="px-6 py-4 space-y-4 pb-24">
        <h2 className="text-lg font-bold text-gray-800 mb-3">All Orders</h2>
        {loading ? (
          <div className="bg-white rounded-3xl p-8 text-center shadow-2xl border border-white/60">
            <p className="text-gray-700 font-semibold mb-1">Loading orders...</p>
            <p className="text-gray-500 text-sm">Please wait while we fetch current orders.</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 text-center shadow-2xl border border-white/60">
            <p className="text-gray-700 font-semibold mb-1">No orders yet</p>
            <p className="text-gray-500 text-sm">New customer orders will appear here in real time.</p>
          </div>
        ) : orders.map((order) => {
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
    </div>
  );
};

export default StaffDashboard;
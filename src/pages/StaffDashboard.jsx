import React, { useState } from 'react';
import { ChevronLeft, Package, Clock, CheckCircle, Truck, LogOut } from 'lucide-react';

const StaffDashboard = ({ onBack, onLogout }) => {
  const [orders, setOrders] = useState([
    {
      id: 'ORD-001234',
      customerName: 'John Doe',
      date: 'Nov 10, 2025',
      time: '10:30 AM',
      items: [
        { name: 'Hot Cappuccino', quantity: 2, size: 'Grande', price: 280 },
        { name: 'Iced Latte', quantity: 1, size: 'Regular', price: 285 }
      ],
      total: 845,
      status: 'pending',
      address: '3rd Door North, Bunawan, Caraga'
    },
    {
      id: 'ORD-001233',
      customerName: 'Jane Smith',
      date: 'Nov 10, 2025',
      time: '10:15 AM',
      items: [
        { name: 'Hot Americano', quantity: 1, size: 'Regular', price: 250 }
      ],
      total: 275,
      status: 'preparing',
      address: '123 Main Street, Bunawan'
    },
    {
      id: 'ORD-001232',
      customerName: 'Mike Johnson',
      date: 'Nov 10, 2025',
      time: '09:45 AM',
      items: [
        { name: 'Iced Matcha', quantity: 2, size: 'Venti', price: 330 },
        { name: 'Hot Choco', quantity: 1, size: 'Regular', price: 300 }
      ],
      total: 960,
      status: 'ready',
      address: '456 Oak Avenue, Bunawan'
    },
    {
      id: 'ORD-001231',
      customerName: 'Sarah Williams',
      date: 'Nov 10, 2025',
      time: '09:20 AM',
      items: [
        { name: 'Hot Salted Caramel', quantity: 1, size: 'Grande', price: 310 }
      ],
      total: 341,
      status: 'completed',
      address: '789 Pine Road, Bunawan'
    }
  ]);

  const getStatusInfo = (status) => {
    switch(status) {
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

  const updateOrderStatus = (orderId, newStatus) => {
    setOrders(prevOrders => 
      prevOrders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    );
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
      <div className="bg-gradient-to-br from-yellow-400 via-orange-400 to-orange-500 px-6 pt-8 pb-6 shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative">
          <div className="flex items-center justify-between mb-6">
            <button 
              onClick={onBack} 
              className="text-white hover:bg-white/20 p-2 rounded-xl transition-all duration-200 hover:scale-110"
            >
              <ChevronLeft size={24} />
            </button>
            <div className="flex items-center gap-3">
              <div className="bg-white/20 backdrop-blur-sm p-2 rounded-xl">
                <Package size={28} className="text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white drop-shadow-lg">Staff Dashboard</h1>
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
        {orders.map((order) => {
          const statusInfo = getStatusInfo(order.status);
          const StatusIcon = statusInfo.icon;
          const nextStatus = getNextStatus(order.status);
          const canUpdate = order.status !== 'completed';

          return (
            <div 
              key={order.id} 
              className="bg-white rounded-3xl p-5 shadow-xl hover:shadow-2xl transition-all duration-200 border-2 border-white/50"
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
              
              <div className="space-y-2 mb-4">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-gray-50 rounded-xl p-3">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 text-sm">{item.name}</p>
                      <p className="text-xs text-gray-500">Qty: {item.quantity} • {item.size}</p>
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
                  className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 rounded-xl font-semibold hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02] text-sm"
                >
                  Update to {getStatusInfo(nextStatus).label}
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
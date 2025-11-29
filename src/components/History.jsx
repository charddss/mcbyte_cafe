import React, { useState } from 'react';
import { ChevronLeft, Coffee, Trash2, Clock, CheckCircle, Package, Truck } from 'lucide-react';

const History = ({ onBack, onReorder, onViewReceipt }) => {
  const [orders, setOrders] = useState([
    {
      id: 'ORD-001234',
      date: 'Nov 10, 2025',
      time: '10:30 AM',
      items: [
        { name: 'Cappuccino', quantity: 1, price: 250, size: 'Regular', ice: 'Normal', sugar: 'Normal', image: '' },
        { name: 'Caramel Cappuccino', quantity: 2, price: 280, size: 'Grande', ice: 'Normal', sugar: 'Normal', image: '' }
      ],
      total: 891,
      status: 'completed'
    },
    {
      id: 'ORD-001233',
      date: 'Nov 09, 2025',
      time: '02:15 PM',
      items: [
        { name: 'Vanilla Cappuccino', quantity: 1, price: 280, size: 'Regular', ice: 'Normal', sugar: 'Normal', image: '/hot cappucino.jpg' }
      ],
      total: 308,
      status: 'completed'
    },
    {
      id: 'ORD-001232',
      date: 'Nov 08, 2025',
      time: '09:45 AM',
      items: [
        { name: 'Mocha Cappuccino', quantity: 1, price: 270, size: 'Grande', ice: 'Normal', sugar: 'Normal', image: '/hot cappucino.jpg' },
        { name: 'Classic Cappuccino', quantity: 1, price: 260, size: 'Regular', ice: 'Normal', sugar: 'Normal', image: '/hot cappucino.jpg' }
      ],
      total: 583,
      status: 'preparing'
    },
    {
      id: 'ORD-001231',
      date: 'Nov 07, 2025',
      time: '03:20 PM',
      items: [
        { name: 'Espresso', quantity: 2, price: 200, size: 'Regular', ice: 'Normal', sugar: 'Normal', image: '/hot americano.jpg' }
      ],
      total: 440,
      status: 'ready'
    }
  ]);

  const handleDeleteOrder = (orderId) => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      setOrders(prevOrders => prevOrders.filter(order => order.id !== orderId));
    }
  };

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
            <div className="flex items-center gap-2">
              <Coffee size={28} className="text-white" />
              <h1 className="text-2xl font-bold text-white drop-shadow-lg">Order History</h1>
            </div>
            <div className="w-10"></div>
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="px-6 py-6 space-y-4">
        {orders.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center shadow-2xl border-2 border-white/50">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-orange-400 to-orange-500 rounded-full mb-6 shadow-lg">
              <Coffee size={48} className="text-white" />
            </div>
            <p className="text-gray-700 text-xl font-semibold mb-2">No orders found</p>
            <p className="text-gray-500 text-sm">Your order history will appear here</p>
          </div>
        ) : (
          orders.map((order) => {
            const statusInfo = getStatusInfo(order.status);
            const StatusIcon = statusInfo.icon;
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
                    <p className="text-sm text-gray-500 mb-3">{order.date} • {order.time}</p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteOrder(order.id);
                    }}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-all hover:scale-110"
                    title="Delete order"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
                
                <div className="space-y-3 mb-4">
                  {order.items.slice(0, 2).map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 bg-gray-50 rounded-xl p-3 hover:bg-gray-100 transition-colors">
                      <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-yellow-100 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0 shadow-sm">
                        {item.image ? (
                          <img 
                            src={item.image} 
                            alt={item.name} 
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.parentElement.innerHTML = '<span style="font-size: 20px; display: flex; align-items: center; justify-content: center; height: 100%;">☕</span>';
                            }}
                          />
                        ) : (
                          <span className="text-xl">☕</span>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 text-sm">{item.name}</p>
                        <p className="text-xs text-gray-500">Qty: {item.quantity} • {item.size}</p>
                      </div>
                      <p className="font-bold text-orange-600">₱ {(item.price * item.quantity).toLocaleString('en-US')}</p>
                    </div>
                  ))}
                  {order.items.length > 2 && (
                    <p className="text-xs text-gray-500 text-center">+{order.items.length - 2} more items</p>
                  )}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <span className="text-sm text-gray-600">Total Amount:</span>
                  <span className="font-bold text-xl text-orange-600">₱ {order.total.toLocaleString('en-US')}</span>
                </div>

                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => onViewReceipt(order.items)}
                    className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 text-white py-2.5 rounded-xl font-semibold hover:from-orange-600 hover:to-orange-700 transition-all text-sm shadow-lg"
                  >
                    View Receipt
                  </button>
                  {order.status === 'completed' && (
                    <button
                      onClick={() => onReorder && onReorder(order.items[0])}
                      className="flex-1 bg-white border-2 border-orange-500 text-orange-600 py-2.5 rounded-xl font-semibold hover:bg-orange-500 hover:text-white transition-all text-sm"
                    >
                      Reorder
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default History;
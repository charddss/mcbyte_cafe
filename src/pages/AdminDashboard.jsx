import React, { useState } from 'react';
import { ChevronLeft, Settings, Users, BarChart3, Coffee, Plus, Edit, Trash2, LogOut, TrendingUp, DollarSign, ShoppingCart } from 'lucide-react';

const AdminDashboard = ({ onBack, onLogout }) => {
  const [activeTab, setActiveTab] = useState('analytics');
  const [menuItems, setMenuItems] = useState([
    { id: 1, name: 'Hot Americano', category: 'Hot Drinks', price: 250, image: '', description: 'Rich espresso with steamed milk' },
    { id: 2, name: 'Hot Cappucino', category: 'Hot Drinks', price: 280, image: '', description: 'Sweet vanilla flavor blend' },
    { id: 3, name: 'Iced Americano', category: 'Cold Drinks', price: 240, image: '', description: 'Bold and smooth' },
    { id: 4, name: 'Iced Latte', category: 'Cold Drinks', price: 285, image: '', description: 'Creamy milk coffee' },
  ]);

  const [users, setUsers] = useState([
    { id: 1, name: 'John Doe', email: 'john@email.com', role: 'Customer', status: 'Active' },
    { id: 2, name: 'Jane Smith', email: 'jane@email.com', role: 'Staff', status: 'Active' },
    { id: 3, name: 'Admin User', email: 'admin@email.com', role: 'Admin', status: 'Active' },
  ]);

  const analytics = {
    totalSales: 125000,
    totalOrders: 342,
    totalCustomers: 156,
    todayRevenue: 8500,
    todayOrders: 23
  };

  const handleDeleteMenuItem = (id) => {
    if (window.confirm('Are you sure you want to delete this menu item?')) {
      setMenuItems(prevItems => prevItems.filter(item => item.id !== id));
    }
  };

  const handleDeleteUser = (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      setUsers(prevUsers => prevUsers.filter(user => user.id !== id));
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
            <div className="flex items-center gap-3">
              <div className="bg-white/20 backdrop-blur-sm p-2 rounded-xl">
                <Settings size={28} className="text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white drop-shadow-lg">Admin Dashboard</h1>
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

      {/* Tabs */}
      <div className="px-6 mt-6 mb-4">
        <div className="flex gap-2 bg-white rounded-2xl p-2 shadow-lg">
          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-200 ${
              activeTab === 'analytics'
                ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            Analytics
          </button>
          <button
            onClick={() => setActiveTab('menu')}
            className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-200 ${
              activeTab === 'menu'
                ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            Menu
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-200 ${
              activeTab === 'users'
                ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            Users
          </button>
        </div>
      </div>

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="px-6 py-4 space-y-4 pb-24">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="bg-green-100 p-3 rounded-xl">
                  <DollarSign size={24} className="text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Total Sales</p>
                  <p className="text-xl font-bold text-gray-900">
                    ₱ {analytics.totalSales.toLocaleString('en-US')}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-3 rounded-xl">
                  <ShoppingCart size={24} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Total Orders</p>
                  <p className="text-xl font-bold text-gray-900">{analytics.totalOrders}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="bg-purple-100 p-3 rounded-xl">
                  <Users size={24} className="text-purple-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Customers</p>
                  <p className="text-xl font-bold text-gray-900">{analytics.totalCustomers}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="bg-orange-100 p-3 rounded-xl">
                  <TrendingUp size={24} className="text-orange-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Today Revenue</p>
                  <p className="text-xl font-bold text-gray-900">
                    ₱ {analytics.todayRevenue.toLocaleString('en-US')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Chart Placeholder */}
          <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <BarChart3 size={20} className="text-orange-600" />
              Sales Overview
            </h3>
            <div className="h-64 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl flex items-center justify-center">
              <p className="text-gray-400">Sales chart visualization</p>
            </div>
          </div>
        </div>
      )}

      {/* Menu Management Tab */}
      {activeTab === 'menu' && (
        <div className="px-6 py-4 space-y-4 pb-24">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-800">Menu Items</h2>
            <button className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-2 rounded-xl font-semibold hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg flex items-center gap-2">
              <Plus size={18} />
              Add Item
            </button>
          </div>

          {menuItems.map((item) => (
            <div 
              key={item.id} 
              className="bg-white rounded-3xl p-5 shadow-xl hover:shadow-2xl transition-all duration-200 border-2 border-white/50"
            >
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-yellow-100 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0 shadow-md">
                  {item.image ? (
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.parentElement.innerHTML = '<svg class="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>';
                      }}
                    />
                  ) : (
                    <Coffee size={24} className="text-orange-600" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg">{item.name}</h3>
                      <p className="text-xs text-gray-500 mb-1">{item.description}</p>
                      <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded font-semibold">
                        {item.category}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-all hover:scale-110">
                        <Edit size={18} />
                      </button>
                      <button 
                        onClick={() => handleDeleteMenuItem(item.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all hover:scale-110"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <span className="font-bold text-xl text-orange-600">
                      ₱ {item.price.toLocaleString('en-US')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* User Management Tab */}
      {activeTab === 'users' && (
        <div className="px-6 py-4 space-y-4 pb-24">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-800">User Management</h2>
            <button className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-2 rounded-xl font-semibold hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg flex items-center gap-2">
              <Plus size={18} />
              Add User
            </button>
          </div>

          {users.map((user) => (
            <div 
              key={user.id} 
              className="bg-white rounded-3xl p-5 shadow-xl hover:shadow-2xl transition-all duration-200 border-2 border-white/50"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-white text-lg font-bold">
                      {user.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">{user.name}</h3>
                    <p className="text-xs text-gray-500">{user.email}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-xs px-2 py-1 rounded font-semibold ${
                        user.role === 'Admin' ? 'bg-purple-100 text-purple-700' :
                        user.role === 'Staff' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {user.role}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded font-semibold ${
                        user.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {user.status}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-all hover:scale-110">
                    <Edit size={18} />
                  </button>
                  <button 
                    onClick={() => handleDeleteUser(user.id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all hover:scale-110"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
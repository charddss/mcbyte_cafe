import React, { useState, useEffect } from 'react';
import { Settings, Users, BarChart3, Coffee, Plus, Edit, Trash2, LogOut, TrendingUp, DollarSign, ShoppingCart, X, Loader2, User } from 'lucide-react';

import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { supabase } from '../lib/supabaseclient';

const TAX_RATE = 0.12; // 12% tax rate (adjust if needed)

const AdminDashboard = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState('analytics');
  const [menuItems, setMenuItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState(null); // { message, type }
  const [showAddModal, setShowAddModal] = useState(false);
  const [newItem, setNewItem] = useState({
    name: '',
    category: 'Hot Drinks',
    price: '',
    description: '',
    image: ''
  });

  const [users, setUsers] = useState([]);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUser, setNewUser] = useState({
    full_name: '',
    email: '',
    password: '',
    role: 'Staff',
    status: 'Active',
  });

  const [analytics, setAnalytics] = useState({
    totalSales: 0,
    totalOrders: 0,
    totalCustomers: 0,
    todayRevenue: 0,
    todayOrders: 0
  });

  useEffect(() => {
    if (activeTab === 'menu') {
      fetchProducts();
    } else if (activeTab === 'analytics') {
      fetchAnalytics();
    } else if (activeTab === 'users') {
      fetchUsers();
    }
  }, [activeTab]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 2000);
  };

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMenuItems(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      showToast('Error fetching products: ' + error.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      // Fetch orders for sales and orders metrics
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('id, total_price, status, created_at');

      if (ordersError) {
        console.error('Error fetching analytics orders:', ordersError);
        return;
      }

      const allOrders = orders || [];
      const completedOrders = allOrders.filter(o => (o.status || '').toLowerCase() === 'completed');

      // Orders by status for charts
      const ordersByStatusBase = { pending: 0, preparing: 0, ready: 0, completed: 0 };
      const ordersByStatus = allOrders.reduce((acc, o) => {
        const s = (o.status || '').toString().trim().toLowerCase();
        if (acc[s] === undefined) acc[s] = 0;
        acc[s] += 1;
        return acc;
      }, ordersByStatusBase);

      const totalSales = completedOrders.reduce(
        (sum, o) => sum + (Number(o.total_price) || 0),
        0
      );

      const totalOrders = allOrders.length;

      // Daily orders series for line chart (last 7 days)
      const countsByDay = {};
      allOrders.forEach((o) => {
        if (!o.created_at) return;
        const d = new Date(o.created_at);
        if (Number.isNaN(d.getTime())) return;
        const key = d.toISOString().slice(0, 10);
        countsByDay[key] = (countsByDay[key] || 0) + 1;
      });

      const sortedKeys = Object.keys(countsByDay).sort();
      const dailyOrders = sortedKeys.slice(-7).map((key) => {
        const d = new Date(key);
        const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        return { date: key, label, count: countsByDay[key] };
      });

      const now = new Date();
      const isSameDay = (dateStr) => {
        if (!dateStr) return false;
        const d = new Date(dateStr);
        return (
          d.getFullYear() === now.getFullYear() &&
          d.getMonth() === now.getMonth() &&
          d.getDate() === now.getDate()
        );
      };

      const todayCompleted = completedOrders.filter(o => isSameDay(o.created_at));
      const todayRevenue = todayCompleted.reduce(
        (sum, o) => sum + (Number(o.total_price) || 0),
        0
      );
      const todayOrders = todayCompleted.length;

      // Fetch users for customer count
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('id, role');

      if (usersError) {
        console.error('Error fetching analytics users:', usersError);
        setAnalytics(prev => ({
          ...prev,
          totalSales,
          totalOrders,
          todayRevenue,
          todayOrders,
        }));
        return;
      }

      const customerRoles = ['customer', 'user'];
      let adminCount = 0;
      let staffCount = 0;
      let customerCount = 0;
      let otherCount = 0;

      (usersData || []).forEach((u) => {
        const role = (u.role || '').toString().trim().toLowerCase();
        if (role === 'admin') adminCount += 1;
        else if (role === 'staff') staffCount += 1;
        else if (customerRoles.includes(role)) customerCount += 1;
        else otherCount += 1;
      });

      const totalCustomers = customerCount;

      setAnalytics({
        totalSales,
        totalOrders,
        totalCustomers,
        todayRevenue,
        todayOrders,
        ordersByStatus,
        customersByRole: {
          admin: adminCount,
          staff: staffCount,
          customer: customerCount,
          other: otherCount,
        },
        dailyOrders,
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, email, full_name, role, status, created_at')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching users:', error);
        setUsers([]);
        return;
      }

      const mappedUsers = (data || []).map((u) => {
        const rawRole = (u.role || '').toString();
        const roleCapitalized = rawRole
          ? rawRole.charAt(0).toUpperCase() + rawRole.slice(1).toLowerCase()
          : 'User';

        const rawStatus = (u.status || '').toString().toLowerCase();
        let statusLabel = 'Unknown';
        if (rawStatus === 'active') statusLabel = 'Active';
        else if (rawStatus === 'suspended') statusLabel = 'Suspended';
        else if (rawStatus) statusLabel = rawStatus.charAt(0).toUpperCase() + rawStatus.slice(1);

        return {
          id: u.id,
          name: u.full_name || u.email || 'Unnamed User',
          email: u.email,
          role: roleCapitalized,
          status: statusLabel,
        };
      });

      setUsers(mappedUsers);
    } catch (error) {
      console.error('Unexpected error fetching users:', error);
      setUsers([]);
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .insert([{
          name: newItem.name,
          category: newItem.category,
          price: parseFloat(newItem.price),
          description: newItem.description,
          image: newItem.image
        }])
        .select();

      if (error) throw error;

      setMenuItems([data[0], ...menuItems]);
      setShowAddModal(false);
      setNewItem({ name: '', category: 'Hot Drinks', price: '', description: '', image: '' });
      showToast('Product added successfully!', 'success');
    } catch (error) {
      console.error('Error adding product:', error);
      showToast('Error adding product: ' + error.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteMenuItem = async (id) => {
    if (window.confirm('Are you sure you want to delete this menu item?')) {
      try {
        const { error } = await supabase
          .from('products')
          .delete()
          .eq('id', id);

        if (error) throw error;

        setMenuItems(prevItems => prevItems.filter(item => item.id !== id));
      } catch (error) {
        console.error('Error deleting product:', error);
        showToast('Error deleting product: ' + error.message, 'error');
      }
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;

    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setUsers(prevUsers => prevUsers.filter(user => user.id !== id));
    } catch (error) {
      console.error('Error deleting user:', error);
      showToast('Error deleting user: ' + error.message, 'error');
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    const email = newUser.email.trim();
    const password = newUser.password;

    if (!email) {
      showToast('Email is required', 'error');
      return;
    }

    if (!password || password.length < 6) {
      showToast('Password must be at least 6 characters', 'error');
      return;
    }

    try {
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError) throw signUpError;

      const authUserId = signUpData?.user?.id;
      if (!authUserId) {
        throw new Error('Failed to create auth user');
      }

      const { data, error } = await supabase
        .from('users')
        .insert([
          {
            id: authUserId,
            full_name: newUser.full_name.trim() || null,
            email,
            role: newUser.role.toLowerCase(),
            status: newUser.status.toLowerCase(),
          },
        ])
        .select();

      if (error) throw error;

      setShowAddUserModal(false);
      setNewUser({ full_name: '', email: '', password: '', role: 'Staff', status: 'Active' });
      await fetchUsers();
      showToast('User added successfully!', 'success');
    } catch (error) {
      console.error('Error adding user:', error);
      showToast('Error adding user: ' + error.message, 'error');
    }
  };

  // Helpers for charts
  const roleStats = analytics.customersByRole || {};
  const roleTotal =
    (roleStats.admin || 0) +
    (roleStats.staff || 0) +
    (roleStats.customer || 0) +
    (roleStats.other || 0);

  const revenueData = [
    { name: 'Total Sales', value: analytics.totalSales || 0 },
  ];

  const totalTax = (analytics.totalSales || 0) * TAX_RATE;
  const taxData = [
    { name: 'Total Tax', value: totalTax },
  ];

  const ordersLineData = (analytics.dailyOrders || []).map((d) => ({
    name: d.label,
    orders: d.count,
  }));

  const roleData = [
    { name: 'Admin', value: roleStats.admin || 0 },
    { name: 'Staff', value: roleStats.staff || 0 },
    { name: 'Customer', value: roleStats.customer || 0 },
    { name: 'Other', value: roleStats.other || 0 },
  ];

  const roleColors = ['#a855f7', '#3b82f6', '#22c55e', '#9ca3af'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50/50 to-orange-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-yellow-400 via-orange-400 to-orange-500 px-4 pt-4 pb-3 shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30 shadow-sm">
                <User size={22} className="text-white" />
              </div>
              <h1 className="text-xl font-bold text-white drop-shadow-lg">Admin Dashboard</h1>
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
            className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-200 ${activeTab === 'analytics'
              ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg'
              : 'text-gray-600 hover:bg-gray-50'
              }`}
          >
            Analytics
          </button>
          <button
            onClick={() => setActiveTab('menu')}
            className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-200 ${activeTab === 'menu'
              ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg'
              : 'text-gray-600 hover:bg-gray-50'
              }`}
          >
            Menu
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-200 ${activeTab === 'users'
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
        <div className="px-4 sm:px-6 py-4 space-y-4 pb-24">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-3 mb-4 max-w-xl mx-auto">
            <div className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="bg-orange-100 p-3 rounded-xl">
                  <DollarSign size={24} className="text-orange-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Total Sales</p>
                  <p className="text-xl font-bold text-gray-900 whitespace-nowrap">
                    ₱ {analytics.totalSales.toLocaleString('en-US')}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="bg-amber-100 p-3 rounded-xl">
                  <TrendingUp size={24} className="text-amber-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Total Tax (₱)</p>
                  <p className="text-xl font-bold text-gray-900 whitespace-nowrap">
                    ₱ {totalTax.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
          </div>

          {/* Analytics Charts */}
          <div className="bg-white rounded-3xl p-4 sm:p-6 shadow-xl border border-gray-100 space-y-6 max-w-xl mx-auto">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <BarChart3 size={20} className="text-orange-600" />
              Analytics Visuals
            </h3>

            {/* Total Sales Bar Chart */}
            <div>
              <p className="text-xs text-gray-500 mb-2">Total Sales (Completed Orders)</p>
              <div className="h-40 sm:h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenueData}>
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(value) => `₱${Number(value).toLocaleString('en-US')}`} />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]} fill="#f97316" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Total Tax Bar Chart */}
            <div>
              <p className="text-xs text-gray-500 mb-2">Total Tax (Based on Sales)</p>
              <div className="h-40 sm:h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={taxData}>
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(value) => `₱${Number(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]} fill="#facc15" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Total Orders Line Chart (Last 7 Days) */}
            <div>
              <p className="text-xs text-gray-500 mb-2">Orders (Last 7 Days)</p>
              <div className="h-40 sm:h-48">
                {ordersLineData.length > 1 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={ordersLineData}>
                      <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="orders"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        dot={{ r: 3 }}
                        activeDot={{ r: 5 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-xs text-gray-400">
                    Not enough data for line graph yet.
                  </div>
                )}
              </div>
            </div>

            {/* Customers Pie Chart (by Role) */}
            <div>
              <p className="text-xs text-gray-500 mb-2">Customers by Role</p>
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                {roleTotal > 0 ? (
                  <>
                    <div className="w-full sm:w-1/2 h-40">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={roleData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={70}
                            label={({ name, percent }) =>
                              `${name} ${(percent * 100).toFixed(0)}%`
                            }
                          >
                            {roleData.map((entry, index) => (
                              <Cell
                                key={entry.name}
                                fill={roleColors[index % roleColors.length]}
                              />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="w-full sm:w-1/2 grid grid-cols-2 gap-2 text-[11px] text-gray-600">
                      {roleData.map((entry, index) => (
                        <div key={entry.name} className="flex items-center gap-1">
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: roleColors[index % roleColors.length] }}
                          ></span>
                          <span className="truncate">
                            {entry.name}: {entry.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="w-full flex items-center justify-center text-xs text-gray-400">
                    No customer data yet.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Menu Management Tab */}
      {activeTab === 'menu' && (
        <div className="px-6 py-4 space-y-4 pb-24">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-800">Menu Items</h2>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-2 rounded-xl font-semibold hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg flex items-center gap-2"
            >
              <Plus size={18} />
              Add Item
            </button>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="animate-spin text-orange-500" size={40} />
            </div>
          ) : menuItems.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              No items found. Add some items to get started!
            </div>
          ) : (
            menuItems.map((item) => (
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
                      <span className="font-bold text-xl text-orange-600 whitespace-nowrap">
                        ₱ {parseFloat(item.price).toLocaleString('en-US')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* User Management Tab */}
      {activeTab === 'users' && (
        <div className="px-6 py-4 space-y-4 pb-24">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-800">User Management</h2>
            <button
              type="button"
              onClick={() => setShowAddUserModal(true)}
              className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-2 rounded-xl font-semibold hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg flex items-center gap-2"
            >
              <Plus size={18} />
              Add User
            </button>
          </div>

          {users.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              No users found. Users will be loaded from the database.
            </div>
          ) : (
            users.map((user) => (
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
                        <span className={`text-xs px-2 py-1 rounded font-semibold ${user.role === 'Admin' ? 'bg-purple-100 text-purple-700' :
                          user.role === 'Staff' ? 'bg-blue-100 text-blue-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                          {user.role}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded font-semibold ${user.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
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
            ))
          )}
        </div>
      )}

      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Add New User</h2>
              <button
                onClick={() => setShowAddUserModal(false)}
                type="button"
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={24} className="text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleAddUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  value={newUser.full_name}
                  onChange={(e) => setNewUser({ ...newUser, full_name: e.target.value })}
                  placeholder="e.g. Juan Dela Cruz"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  required
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  placeholder="user@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  required
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  placeholder="At least 6 characters"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                >
                  <option value="Admin">Admin</option>
                  <option value="Staff">Staff</option>
                  <option value="Customer">Customer</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  value={newUser.status}
                  onChange={(e) => setNewUser({ ...newUser, status: e.target.value })}
                >
                  <option value="Active">Active</option>
                  <option value="Suspended">Suspended</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 rounded-xl font-bold shadow-lg hover:from-orange-600 hover:to-orange-700 transition-all mt-4"
              >
                Create User
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Add Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Add New Item</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={24} className="text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleAddProduct} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  placeholder="e.g. Caramel Macchiato"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  value={newItem.category}
                  onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                >
                  <option value="Hot Drinks">Hot Drinks</option>
                  <option value="Cold Drinks">Cold Drinks</option>
                  <option value="Pastries">Pastries</option>
                  <option value="Meals">Meals</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price (₱)</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  value={newItem.price}
                  onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  rows="3"
                  value={newItem.description}
                  onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                  placeholder="Brief description of the item"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                <input
                  type="url"
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  value={newItem.image}
                  onChange={(e) => setNewItem({ ...newItem, image: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 rounded-xl font-bold shadow-lg hover:from-orange-600 hover:to-orange-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-4"
              >
                {isLoading ? 'Adding...' : 'Add Item'}
              </button>
            </form>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed inset-x-0 bottom-6 flex justify-center px-4 pointer-events-none">
          <div
            className={`pointer-events-auto max-w-sm w-full sm:w-auto flex items-start gap-3 px-4 py-3 rounded-2xl shadow-2xl backdrop-blur-md border text-sm font-semibold text-white transform transition-all duration-300 ease-out
              ${toast.type === 'error'
                ? 'bg-red-500/90 border-red-400/70'
                : 'bg-emerald-500/90 border-emerald-400/70'
              }`}
          >
            <div className="mt-0.5 flex-shrink-0">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/15">
                {toast.type === 'error' ? (
                  <span className="text-xs font-bold">!</span>
                ) : (
                  <span className="text-xs font-bold">✓</span>
                )}
              </span>
            </div>
            <div className="flex-1 text-left leading-snug">
              <p className="text-[13px] sm:text-sm text-white/90">{toast.message}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
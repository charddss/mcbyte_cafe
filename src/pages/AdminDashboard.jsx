import React, { useState, useEffect } from 'react';
import { Settings, Users, BarChart3, Coffee, Plus, Edit, Trash2, LogOut, TrendingUp, DollarSign, ShoppingCart, X, Loader2, User } from 'lucide-react';
import Swal from 'sweetalert2';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { supabase } from '../lib/supabaseclient';

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
  const [showEditItemModal, setShowEditItemModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [editedItem, setEditedItem] = useState({
    name: '',
    category: 'Hot Drinks',
    price: '',
    description: '',
    image: ''
  });

  const [users, setUsers] = useState([]);
  const [userFilter, setUserFilter] = useState('all'); // 'all', 'users', 'staff'
  const [menuFilter, setMenuFilter] = useState('all'); // 'all', 'Hot Drinks', 'Cold Drinks', 'Pastries', 'Meals'
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [newUser, setNewUser] = useState({
    full_name: '',
    email: '',
    password: '',
    role: 'Staff',
    status: 'Active',
  });
  const [editedUser, setEditedUser] = useState({
    full_name: '',
    email: '',
    role: 'Staff',
    status: 'Active',
  });

  // Admin Profile State
  const [currentAdminId, setCurrentAdminId] = useState(null);
  const [adminProfile, setAdminProfile] = useState({
    full_name: '',
    email: '',
    role: 'Admin',
    status: 'Active',
  });
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [editedProfile, setEditedProfile] = useState({
    full_name: '',
    email: '',
  });

  const [analytics, setAnalytics] = useState({
    totalSales: 0,
    totalOrders: 0,
    totalCustomers: 0,
    todayRevenue: 0,
    todayOrders: 0,
    todaySalesSeries: [],
    todayProductCounts: [],
  });
  const [productNameFilter, setProductNameFilter] = useState('');

  useEffect(() => {
    fetchAdminProfile();
  }, []);

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

      // Daily sales (completed orders only) for line chart (last 7 days)
      const salesByDay = {};
      completedOrders.forEach((o) => {
        if (!o.created_at) return;
        const d = new Date(o.created_at);
        if (Number.isNaN(d.getTime())) return;
        const key = d.toISOString().slice(0, 10);
        const amount = Number(o.total_price) || 0;
        salesByDay[key] = (salesByDay[key] || 0) + amount;
      });

      const sortedSalesKeys = Object.keys(salesByDay).sort();
      const dailySales = sortedSalesKeys.slice(-7).map((key) => {
        const d = new Date(key);
        const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        return { date: key, label, total: salesByDay[key] };
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

      // Today's product counts (by product_name, across completed orders today)
      const todayOrderIds = todayCompleted.map((o) => o.id);
      let todayProductCounts = [];

      if (todayOrderIds.length > 0) {
        const { data: todayItems, error: todayItemsError } = await supabase
          .from('order_items')
          .select('product_name, quantity, order_id')
          .in('order_id', todayOrderIds);

        if (todayItemsError) {
          console.error('Error fetching today order items for product counts:', todayItemsError);
        } else {
          const countsMap = {};
          (todayItems || []).forEach((item) => {
            const name = (item.product_name || 'Unknown').toString();
            const qty = Number(item.quantity) || 1;
            countsMap[name] = (countsMap[name] || 0) + qty;
          });

          todayProductCounts = Object.entries(countsMap)
            .map(([name, quantity]) => ({ name, quantity }))
            .sort((a, b) => b.quantity - a.quantity);
        }
      }

      // Today's sales by hour (for Today Sales line chart)
      const todaySalesByHour = {};
      todayCompleted.forEach((o) => {
        if (!o.created_at) return;
        const d = new Date(o.created_at);
        if (Number.isNaN(d.getTime())) return;
        const hour = d.getHours();
        const amount = Number(o.total_price) || 0;
        todaySalesByHour[hour] = (todaySalesByHour[hour] || 0) + amount;
      });

      const sortedHourKeys = Object.keys(todaySalesByHour)
        .map((h) => Number(h))
        .sort((a, b) => a - b);

      const todaySalesSeries = sortedHourKeys.map((hour) => {
        const label = `${hour.toString().padStart(2, '0')}:00`;
        return { hour: label, total: todaySalesByHour[hour] };
      });

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
          todaySalesSeries,
          todayProductCounts,
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
        dailySales,
        todaySalesSeries,
        todayProductCounts,
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  const fetchAdminProfile = async () => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        console.error('Error fetching current user:', userError);
        return;
      }

      setCurrentAdminId(user.id);

      const { data, error } = await supabase
        .from('users')
        .select('id, email, full_name, role, status')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching admin profile:', error);
        return;
      }

      if (data) {
        setAdminProfile({
          full_name: data.full_name || '',
          email: data.email || '',
          role: data.role || 'Admin',
          status: data.status || 'Active',
        });
      }
    } catch (error) {
      console.error('Unexpected error fetching admin profile:', error);
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

      const mappedUsers = (data || [])
        .filter(u => u.id !== currentAdminId) // Exclude current admin
        .map((u) => {
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
            rawRole: rawRole.toLowerCase(),
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

  const openEditItemModal = (item) => {
    setEditingItem(item);
    setEditedItem({
      name: item.name || '',
      category: item.category || 'Hot Drinks',
      price:
        item.price !== undefined && item.price !== null
          ? String(item.price)
          : '',
      description: item.description || '',
      image: item.image || '',
    });
    setShowEditItemModal(true);
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    if (!editingItem) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('products')
        .update({
          name: editedItem.name,
          category: editedItem.category,
          price: parseFloat(editedItem.price),
          description: editedItem.description,
          image: editedItem.image,
        })
        .eq('id', editingItem.id);

      if (error) throw error;

      setShowEditItemModal(false);
      setEditingItem(null);
      await fetchProducts();
      showToast('Product updated successfully!', 'success');
    } catch (error) {
      console.error('Error updating product:', error);
      showToast('Error updating product: ' + error.message, 'error');
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

  const handleDeleteUser = async (id, userName) => {
    const result = await Swal.fire({
      title: 'Delete User?',
      text: `Are you sure you want to delete ${userName}? This action cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete',
      cancelButtonText: 'Cancel',
      reverseButtons: true,
    });

    if (!result.isConfirmed) return;

    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setUsers(prevUsers => prevUsers.filter(user => user.id !== id));

      Swal.fire({
        title: 'Deleted!',
        text: 'User has been deleted successfully.',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error('Error deleting user:', error);
      Swal.fire({
        title: 'Error!',
        text: 'Error deleting user: ' + error.message,
        icon: 'error',
        confirmButtonColor: '#f97316',
      });
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

  const openEditUserModal = (user) => {
    setEditingUser(user);
    setEditedUser({
      full_name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
    });
    setShowEditUserModal(true);
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();

    try {
      const { error } = await supabase
        .from('users')
        .update({
          full_name: editedUser.full_name.trim(),
          email: editedUser.email.trim(),
          role: editedUser.role.toLowerCase(),
          status: editedUser.status.toLowerCase(),
        })
        .eq('id', editingUser.id);

      if (error) throw error;

      setShowEditUserModal(false);
      await fetchUsers();

      Swal.fire({
        title: 'Success!',
        text: 'User updated successfully!',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error('Error updating user:', error);
      Swal.fire({
        title: 'Error!',
        text: 'Error updating user: ' + error.message,
        icon: 'error',
        confirmButtonColor: '#f97316',
      });
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();

    try {
      const { error } = await supabase
        .from('users')
        .update({
          full_name: editedProfile.full_name.trim(),
          email: editedProfile.email.trim(),
        })
        .eq('id', currentAdminId);

      if (error) throw error;

      setAdminProfile({
        ...adminProfile,
        full_name: editedProfile.full_name.trim(),
        email: editedProfile.email.trim(),
      });

      setShowEditProfileModal(false);
      showToast('Profile updated successfully!', 'success');
    } catch (error) {
      console.error('Error updating profile:', error);
      showToast('Error updating profile: ' + error.message, 'error');
    }
  };

  const openEditProfileModal = () => {
    setEditedProfile({
      full_name: adminProfile.full_name,
      email: adminProfile.email,
    });
    setShowEditProfileModal(true);
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

  const salesLineData = (analytics.dailySales || []).map((d) => ({
    name: d.label,
    sales: d.total,
  }));

  const todaySalesLineData = (analytics.todaySalesSeries || []).map((d) => ({
    name: d.hour,
    sales: d.total,
  }));

  const roleData = [
    { name: 'Admin', value: roleStats.admin || 0 },
    { name: 'Staff', value: roleStats.staff || 0 },
    { name: 'Customer', value: roleStats.customer || 0 },
    { name: 'Other', value: roleStats.other || 0 },
  ];

  const roleColors = ['#a855f7', '#3b82f6', '#22c55e', '#9ca3af'];
  const todayProductCounts = analytics.todayProductCounts || [];
  const productNameOptions = Array.from(
    new Set(todayProductCounts.map((p) => p.name))
  );
  const filteredTodayProductCounts = productNameFilter
    ? todayProductCounts.filter((p) => p.name === productNameFilter)
    : todayProductCounts;
  const hasAnyTodayProducts = todayProductCounts.length > 0;

  const filteredMenuItems = menuItems.filter((item) =>
    menuFilter === 'all' ? true : item.category === menuFilter
  );

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
      <div className="px-4 mt-6 mb-4">
        <div className="flex gap-2 bg-white rounded-2xl p-2 shadow-lg">
          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex-1 py-2 px-2 rounded-xl font-semibold transition-all duration-200 flex flex-col items-center justify-center gap-1 text-xs ${activeTab === 'analytics'
              ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg'
              : 'text-gray-600 hover:bg-gray-50'
              }`}
          >
            <BarChart3 size={18} className="flex-shrink-0" />
            <span>Analytics</span>
          </button>
          <button
            onClick={() => setActiveTab('menu')}
            className={`flex-1 py-2 px-2 rounded-xl font-semibold transition-all duration-200 flex flex-col items-center justify-center gap-1 text-xs ${activeTab === 'menu'
              ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg'
              : 'text-gray-600 hover:bg-gray-50'
              }`}
          >
            <Coffee size={18} className="flex-shrink-0" />
            <span>Menu</span>
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`flex-1 py-2 px-2 rounded-xl font-semibold transition-all duration-200 flex flex-col items-center justify-center gap-1 text-xs ${activeTab === 'users'
              ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg'
              : 'text-gray-600 hover:bg-gray-50'
              }`}
          >
            <Users size={18} className="flex-shrink-0" />
            <span>Users</span>
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 py-2 px-2 rounded-xl font-semibold transition-all duration-200 flex flex-col items-center justify-center gap-1 text-xs ${activeTab === 'profile'
              ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg'
              : 'text-gray-600 hover:bg-gray-50'
              }`}
          >
            <User size={18} className="flex-shrink-0" />
            <span>Profile</span>
          </button>
        </div>
      </div>

      {activeTab === 'menu' && (
        <div className="px-6 py-4 space-y-4 pb-24">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-800">Menu Management</h2>
            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-2 rounded-xl font-semibold hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg flex items-center gap-2"
            >
              <Plus size={18} />
              Add Item
            </button>
          </div>

          <div className="flex gap-2 bg-white rounded-2xl p-2 shadow-lg overflow-x-auto mb-4">
            <button
              onClick={() => setMenuFilter('all')}
              className={`flex-1 py-2 px-4 rounded-xl font-semibold transition-all duration-200 whitespace-nowrap text-sm ${menuFilter === 'all'
                ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg'
                : 'text-gray-600 hover:bg-gray-50'
                }`}
            >
              All
            </button>
            <button
              onClick={() => setMenuFilter('Hot Drinks')}
              className={`flex-1 py-2 px-4 rounded-xl font-semibold transition-all duration-200 whitespace-nowrap text-sm ${menuFilter === 'Hot Drinks'
                ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg'
                : 'text-gray-600 hover:bg-gray-50'
                }`}
            >
              Hot Drinks
            </button>
            <button
              onClick={() => setMenuFilter('Cold Drinks')}
              className={`flex-1 py-2 px-4 rounded-xl font-semibold transition-all duration-200 whitespace-nowrap text-sm ${menuFilter === 'Cold Drinks'
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg'
                : 'text-gray-600 hover:bg-gray-50'
                }`}
            >
              Cold Drinks
            </button>
            <button
              onClick={() => setMenuFilter('Pastries')}
              className={`flex-1 py-2 px-4 rounded-xl font-semibold transition-all duration-200 whitespace-nowrap text-sm ${menuFilter === 'Pastries'
                ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white shadow-lg'
                : 'text-gray-600 hover:bg-gray-50'
                }`}
            >
              Pastries
            </button>
            <button
              onClick={() => setMenuFilter('Meals')}
              className={`flex-1 py-2 px-4 rounded-xl font-semibold transition-all duration-200 whitespace-nowrap text-sm ${menuFilter === 'Meals'
                ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg'
                : 'text-gray-600 hover:bg-gray-50'
                }`}
            >
              Meals
            </button>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-10 text-gray-500 gap-2">
              <Loader2 className="animate-spin" size={20} />
              <span>Loading menu items...</span>
            </div>
          ) : filteredMenuItems.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              No items found for this category.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredMenuItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-3xl p-4 shadow-xl hover:shadow-2xl transition-all duration-200 border-2 border-white/50 flex flex-col gap-3"
                >
                  <div className="flex gap-3">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-20 h-20 rounded-2xl object-cover border border-gray-100"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-2xl bg-orange-50 flex items-center justify-center border border-dashed border-orange-200">
                        <Coffee size={24} className="text-orange-400" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-bold text-gray-900 text-sm truncate">{item.name}</h3>
                          <p className="text-[11px] text-gray-500 truncate">{item.category}</p>
                        </div>
                        <p className="text-sm font-bold text-orange-600 whitespace-nowrap">
                          ₱ {Number(item.price || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                      </div>
                      {item.description && (
                        <p className="mt-1 text-xs text-gray-600 line-clamp-2">{item.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 mt-1">
                    <button
                      onClick={() => openEditItemModal(item)}
                      className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-all hover:scale-110"
                    >
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
              ))}
            </div>
          )}
        </div>
      )}

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
                <div className="bg-green-100 p-3 rounded-xl">
                  <DollarSign size={24} className="text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Today's Sales</p>
                  <p className="text-xl font-bold text-gray-900 whitespace-nowrap">
                    ₱ {analytics.todayRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
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

            {/* Total Sales Line Chart (Last 7 Days) */}
            <div>
              <p className="text-xs text-gray-500 mb-2">Sales (Last 7 Days)</p>
              <div className="h-40 sm:h-48">
                {salesLineData.length > 1 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={salesLineData}>
                      <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip formatter={(value) => `₱${Number(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} />
                      <Line
                        type="monotone"
                        dataKey="sales"
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

            {/* Today's Sales Line Chart (by hour) */}
            <div>
              <p className="text-xs text-gray-500 mb-2">Today's Sales (by hour)</p>
              <div className="h-40 sm:h-48">
                {todaySalesLineData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={todaySalesLineData}>
                      <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip formatter={(value) => `₱${Number(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} />
                      <Line
                        type="monotone"
                        dataKey="sales"
                        stroke="#16a34a"
                        strokeWidth={2}
                        dot={{ r: 3 }}
                        activeDot={{ r: 5 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-xs text-gray-400">
                    No sales data for today yet.
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
                            style={{
                              backgroundColor: roleColors[index % roleColors.length],
                            }}
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

          {/* Today's Products (by quantity) */}
          <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-xl border border-gray-100 space-y-3 max-w-xl mx-auto">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="font-bold text-gray-900 text-sm">Today's Products</h3>
                <span className="text-xs text-gray-500">
                  {hasAnyTodayProducts
                    ? `${todayProductCounts.length} product${todayProductCounts.length === 1 ? '' : 's'} today`
                    : 'No completed orders today'}
                </span>
              </div>
              <div className="w-full sm:w-48">
                <select
                  value={productNameFilter}
                  onChange={(e) => setProductNameFilter(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl border border-gray-200 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="">All products</option>
                  {productNameOptions.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {filteredTodayProductCounts.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {filteredTodayProductCounts.slice(0, 10).map((p) => (
                  <div
                    key={p.name}
                    className="flex items-center justify-between py-2 text-xs sm:text-sm"
                  >
                    <span className="font-medium text-gray-800 truncate max-w-[65%]">
                      {p.name}
                    </span>
                    <span className="font-semibold text-gray-900 whitespace-nowrap">
                      x{p.quantity}
                    </span>
                  </div>
                ))}
              </div>
            ) : hasAnyTodayProducts ? (
              <p className="text-xs text-gray-400 pt-1">
                No products match this name.
              </p>
            ) : (
              <p className="text-xs text-gray-400 pt-1">
                No product orders recorded today.
              </p>
            )}
          </div>
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

          {/* User Filters */}
          <div className="flex gap-2 bg-white rounded-2xl p-2 shadow-lg overflow-x-auto mb-4">
            <button
              onClick={() => setUserFilter('all')}
              className={`flex-1 py-2 px-4 rounded-xl font-semibold transition-all duration-200 whitespace-nowrap text-sm ${userFilter === 'all'
                ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg'
                : 'text-gray-600 hover:bg-gray-50'
                }`}
            >
              All
            </button>
            <button
              onClick={() => setUserFilter('users')}
              className={`flex-1 py-2 px-4 rounded-xl font-semibold transition-all duration-200 whitespace-nowrap text-sm ${userFilter === 'users'
                ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg'
                : 'text-gray-600 hover:bg-gray-50'
                }`}
            >
              Users
            </button>
            <button
              onClick={() => setUserFilter('staff')}
              className={`flex-1 py-2 px-4 rounded-xl font-semibold transition-all duration-200 whitespace-nowrap text-sm ${userFilter === 'staff'
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg'
                : 'text-gray-600 hover:bg-gray-50'
                }`}
            >
              Staff
            </button>
          </div>

          {users.filter(user => {
            if (userFilter === 'all') return true;
            if (userFilter === 'users') return user.rawRole === 'customer' || user.rawRole === 'user';
            if (userFilter === 'staff') return user.rawRole === 'staff';
            return true;
          }).length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              No {userFilter === 'all' ? '' : userFilter} found.
            </div>
          ) : (
            users.filter(user => {
              if (userFilter === 'all') return true;
              if (userFilter === 'users') return user.rawRole === 'customer' || user.rawRole === 'user';
              if (userFilter === 'staff') return user.rawRole === 'staff';
              return true;
            }).map((user) => (
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
                    <button
                      onClick={() => openEditUserModal(user)}
                      className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-all hover:scale-110"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user.id, user.name)}
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

      {/* Admin Profile Tab */}
      {activeTab === 'profile' && (
        <div className="px-6 py-4 space-y-4 pb-24">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-800">Admin Profile</h2>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-xl border-2 border-white/50 max-w-xl mx-auto">
            {/* Profile Header */}
            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-200">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-white text-3xl font-bold">
                  {adminProfile.full_name ? adminProfile.full_name.charAt(0).toUpperCase() : 'A'}
                </span>
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 text-2xl">
                  {adminProfile.full_name || 'Admin User'}
                </h3>
                <p className="text-sm text-gray-500">{adminProfile.email}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs px-3 py-1 rounded-full font-semibold bg-purple-100 text-purple-700">
                    {adminProfile.role}
                  </span>
                  <span className={`text-xs px-3 py-1 rounded-full font-semibold ${adminProfile.status === 'Active'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
                    }`}>
                    {adminProfile.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Profile Details */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                <div className="bg-gray-50 px-4 py-3 rounded-xl border border-gray-200">
                  <p className="text-gray-900">{adminProfile.full_name || 'Not set'}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                <div className="bg-gray-50 px-4 py-3 rounded-xl border border-gray-200">
                  <p className="text-gray-900">{adminProfile.email || 'Not set'}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Role</label>
                <div className="bg-gray-50 px-4 py-3 rounded-xl border border-gray-200">
                  <p className="text-gray-900">{adminProfile.role}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Account Status</label>
                <div className="bg-gray-50 px-4 py-3 rounded-xl border border-gray-200">
                  <p className="text-gray-900">{adminProfile.status}</p>
                </div>
              </div>

              {/* Edit Profile Button */}
              <button
                onClick={openEditProfileModal}
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 rounded-xl font-bold shadow-lg hover:from-orange-600 hover:to-orange-700 transition-all mt-6 flex items-center justify-center gap-2"
              >
                <Edit size={18} />
                Edit Profile
              </button>
            </div>
          </div>
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

      {/* Edit User Modal */}
      {showEditUserModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Edit User</h2>
              <button
                onClick={() => setShowEditUserModal(false)}
                type="button"
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={24} className="text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleUpdateUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  value={editedUser.full_name}
                  onChange={(e) => setEditedUser({ ...editedUser, full_name: e.target.value })}
                  placeholder="e.g. Juan Dela Cruz"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  required
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  value={editedUser.email}
                  onChange={(e) => setEditedUser({ ...editedUser, email: e.target.value })}
                  placeholder="user@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  value={editedUser.role}
                  onChange={(e) => setEditedUser({ ...editedUser, role: e.target.value })}
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
                  value={editedUser.status}
                  onChange={(e) => setEditedUser({ ...editedUser, status: e.target.value })}
                >
                  <option value="Active">Active</option>
                  <option value="Suspended">Suspended</option>
                </select>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowEditUserModal(false)}
                  className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-200 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 rounded-xl font-bold shadow-lg hover:from-orange-600 hover:to-orange-700 transition-all"
                >
                  Save Changes
                </button>
              </div>
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

      {/* Edit Item Modal */}
      {showEditItemModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Edit Item</h2>
              <button
                onClick={() => setShowEditItemModal(false)}
                type="button"
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={24} className="text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleUpdateProduct} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  value={editedItem.name}
                  onChange={(e) => setEditedItem({ ...editedItem, name: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  value={editedItem.category}
                  onChange={(e) => setEditedItem({ ...editedItem, category: e.target.value })}
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
                  value={editedItem.price}
                  onChange={(e) => setEditedItem({ ...editedItem, price: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  rows="3"
                  value={editedItem.description}
                  onChange={(e) => setEditedItem({ ...editedItem, description: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                <input
                  type="url"
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  value={editedItem.image}
                  onChange={(e) => setEditedItem({ ...editedItem, image: e.target.value })}
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 rounded-xl font-bold shadow-lg hover:from-orange-600 hover:to-orange-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-4"
              >
                {isLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {showEditProfileModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Edit Profile</h2>
              <button
                onClick={() => setShowEditProfileModal(false)}
                type="button"
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={24} className="text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  value={editedProfile.full_name}
                  onChange={(e) => setEditedProfile({ ...editedProfile, full_name: e.target.value })}
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  required
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  value={editedProfile.email}
                  onChange={(e) => setEditedProfile({ ...editedProfile, email: e.target.value })}
                  placeholder="Enter your email"
                />
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowEditProfileModal(false)}
                  className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-200 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 rounded-xl font-bold shadow-lg hover:from-orange-600 hover:to-orange-700 transition-all"
                >
                  Save Changes
                </button>
              </div>
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
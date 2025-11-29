import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import { supabase } from './lib/supabaseclient';
import LoadingScreen from './pages/LoadingScreen';
import LoginScreen from './pages/LoginScreen';
import RegisterScreen from './pages/RegisterScreen';
import AdminStaffRegisterScreen from './pages/AdminStaffRegister';
import CoffeeShopScreen from './pages/CoffeeShopScreen';
import Order from './components/Order';
import Cart from './components/Cart';
import Profile from './components/Profile';
import EditProfile from './components/EditProfile';
import Payment from './components/Payment';
import PayNow from './components/PayNow';
import Receipt from './components/Receipt';
import History from './components/History';
import Favorites from './components/Favorites';
import StaffDashboard from './pages/StaffDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Swal from 'sweetalert2';
import './index.css';

function App() {
  const navigate = useNavigate();
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('Cash on Delivery');
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [activeReceiptOrder, setActiveReceiptOrder] = useState(null);

  useEffect(() => {
    fetchCartItems();

    const handleCartUpdate = () => fetchCartItems();
    window.addEventListener('cartUpdated', handleCartUpdate);

    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
    };
  }, [currentUser]);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError || !user) {
          setUserProfile(null);
          return;
        }

        const { data, error } = await supabase
          .from('users')
          .select('full_name, address')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error fetching user profile for receipt:', error);
          setUserProfile(null);
          return;
        }

        setUserProfile(data || null);
      } catch (err) {
        console.error('Unexpected error fetching user profile for receipt:', err);
        setUserProfile(null);
      }
    };

    fetchUserProfile();
  }, []);

  const fetchCartItems = async () => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError) {
        console.error('Error getting user for cart:', userError);
        setCartItems([]);
        return;
      }

      if (!user) {
        setCartItems([]);
        return;
      }

      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('id')
        .eq('user_id', user.id)
        .eq('status', 'pending')
        .neq('is_reorder', true);

      if (ordersError) {
        console.error('Error fetching pending orders for cart:', ordersError);
        setCartItems([]);
        return;
      }

      const pendingOrder = (orders && orders[0]) || null;

      if (!pendingOrder) {
        setCartItems([]);
        return;
      }

      const { data: items, error: itemsError } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', pendingOrder.id);

      if (itemsError) {
        console.error('Error fetching order items for cart:', itemsError);
        setCartItems([]);
        return;
      }

      setCartItems(items || []);
    } catch (error) {
      console.error('Error fetching cart:', error);
      setCartItems([]);
    }
  };

  const addToCart = (item) => {
    if (item) {
      setCartItems((prev) => [...prev, item]);
    }
    navigate('/cart');
  };

  const handleLoginSuccess = (user) => {
    // Debug log for tracing
    try {
      // eslint-disable-next-line no-console
      console.log('[App] handleLoginSuccess received user:', user);
    } catch (e) { }

    setCurrentUser(user);

    // Normalize role to avoid case/whitespace mismatches
    const role = (user?.role || '').toString().trim().toLowerCase();

    switch (role) {
      case 'admin':
        navigate('/admin');
        break;
      case 'staff':
        navigate('/staff');
        break;
      case 'customer':
      case 'user':
        navigate('/home');
        break;
      default:
        // Fallback: log and alert so developer notices the unexpected value
        try {
          // eslint-disable-next-line no-console
          console.warn('[App] Unexpected role value:', user?.role);
        } catch (e) { }
        alert('Invalid user role: ' + (user?.role ?? 'undefined'));
        break;
    }
  };

  const handlePayNow = async ({ total, paymentMethod, captureOnDelivery, orderId }) => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        alert('Please log in to complete payment.');
        return;
      }

      // Prefer orderId passed from PayNow; otherwise derive from current cart items
      let targetOrderId = orderId || (cartItems[0] && cartItems[0].order_id);

      if (!targetOrderId) {
        alert('No order found to pay. Please add items to your cart first.');
        return;
      }

      const { error: updateError } = await supabase
        .from('orders')
        .update({
          total_price: total,
          status: 'pending',
        })
        .eq('id', targetOrderId);

      if (updateError) {
        console.error('Error updating order during payment:', updateError);
        alert('Failed to update your order for payment.');
        return;
      }

      const { error: paymentError } = await supabase
        .from('payments')
        .insert([
          {
            order_id: targetOrderId,
            total_amount: total,
            payment_method: paymentMethod || 'Cash on Delivery',
            status: 'paid',
            capture_on_delivery: !!captureOnDelivery,
          },
        ]);

      if (paymentError) {
        console.error('Error inserting payment record:', paymentError);
        alert('Payment record could not be saved: ' + (paymentError.message || 'Unknown error'));
        return;
      }

      Swal.fire({
        icon: 'success',
        title: 'Payment Successful',
        text: 'Thank you for your order!',
        confirmButtonColor: '#8B4513',
      }).then(() => {
        navigate('/receipt');
      });
    } catch (err) {
      console.error('Unexpected error during payment:', err);
      alert('Unexpected error during payment. Please try again.');
    }
  };

  return (
    <Routes>
      <Route path="/" element={<LoadingScreen onGetStarted={() => navigate('/login')} />} />

      <Route path="/login" element={
        <LoginScreen
          onSignUp={() => navigate('/register')}
          onLoginSuccess={handleLoginSuccess}
          onStaffLogin={(user) => handleLoginSuccess(user)}
          onAdminLogin={(user) => handleLoginSuccess(user)}
          onAdminStaffRegister={() => navigate('/admin-register')}
        />
      } />

      <Route path="/register" element={
        <RegisterScreen
          onLogin={() => navigate('/login')}
          onRegisterSuccess={handleLoginSuccess}
        />
      } />

      <Route path="/admin-register" element={
        <AdminStaffRegisterScreen
          onBack={() => navigate('/login')}
          onRegisterSuccess={handleLoginSuccess}
        />
      } />

      <Route path="/home" element={
        <CoffeeShopScreen
          onOrder={(product) => { setSelectedProduct(product); navigate('/order'); }}
          onCart={() => navigate('/cart')}
          onProfile={() => navigate('/profile')}
          onHistory={() => navigate('/history')}
          onFavorites={() => navigate('/favorites')}
          onStaffDashboard={() => navigate('/staff')}
          onAdminDashboard={() => navigate('/admin')}
          cartItemsCount={cartItems.length}
        />
      } />

      <Route path="/order" element={
        selectedProduct ? (
          <Order
            product={selectedProduct}
            onBack={() => navigate('/home')}
            onAddToCart={addToCart}
          />
        ) : (
          <Navigate to="/home" replace />
        )
      } />

      <Route path="/cart" element={
        <Cart
          items={cartItems}
          onBack={() => navigate('/home')}
          onCheckout={() => navigate('/payment')}
          onUpdateCart={(updatedItems) => setCartItems(updatedItems)}
        />
      } />

      <Route path="/profile" element={
        <Profile
          onBack={() => navigate('/home')}
          onEdit={() => navigate('/edit-profile')}
          onLogout={() => { setCurrentUser(null); navigate('/login'); }}
        />
      } />

      <Route path="/edit-profile" element={
        <EditProfile onBack={() => navigate('/profile')} onSave={() => navigate('/profile')} />
      } />

      <Route path="/payment" element={
        <Payment
          total={cartItems.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity ?? 1)), 0)}
          items={cartItems}
          onBack={() => navigate('/cart')}
          onPayNow={(method) => { setSelectedPaymentMethod(method || 'Cash on Delivery'); navigate('/paynow'); }}
        />
      } />

      <Route path="/paynow" element={
        <PayNow
          total={cartItems.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity ?? 1)), 0) * 1.1}
          paymentMethod={selectedPaymentMethod}
          orderId={cartItems[0]?.order_id}
          customerName={
            userProfile?.full_name ||
            currentUser?.fullName ||
            currentUser?.email ||
            'Guest'
          }
          onBack={() => navigate('/payment')}
          onPayNow={handlePayNow}
        />
      } />

      <Route path="/receipt" element={
        <Receipt
          items={activeReceiptOrder?.items || cartItems}
          customerName={
            userProfile?.full_name ||
            currentUser?.fullName ||
            currentUser?.email ||
            'Guest'
          }
          deliveryAddress={userProfile?.address}
          paymentMethod={selectedPaymentMethod}
          onBackHome={() => { setCartItems([]); setSelectedProduct(null); navigate('/home'); }}
        />
      } />

      <Route path="/history" element={
        <History
          onBack={() => navigate('/home')}
          onReorder={(product) => { setSelectedProduct(product); navigate('/order'); }}
          onViewReceipt={(order) => { setActiveReceiptOrder(order); navigate('/receipt'); }}
        />
      } />

      <Route path="/favorites" element={
        <Favorites
          onBack={() => navigate('/home')}
          onOrder={(product) => { setSelectedProduct(product); navigate('/order'); }}
        />
      } />

      <Route path="/staff" element={
        <StaffDashboard onBack={() => navigate('/home')} onLogout={() => { setCurrentUser(null); navigate('/login'); }} />
      } />

      <Route path="/admin" element={
        <AdminDashboard onBack={() => navigate('/home')} onLogout={() => { setCurrentUser(null); navigate('/login'); }} />
      } />

      {/* Catch all redirect to login or home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;

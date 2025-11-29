// ===== App.jsx =====
import React, { useState } from 'react';
import LoadingScreen from './pages/LoadingScreen';
import LoginScreen from './pages/LoginScreen';
import RegisterScreen from './pages/RegisterScreen';
import AdminStaffRegisterScreen from './pages/AdminStaffRegister'; // New admin/staff register screen
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
import './index.css';

function App() {
  const [screen, setScreen] = useState('loading');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('Cash on Delivery');
  const [currentUser, setCurrentUser] = useState(null);

  const addToCart = (item) => {
    setCartItems(prev => [...prev, item]);
  };

  const handleLoginSuccess = (user) => {
    // Debug log for tracing
    try {
      // eslint-disable-next-line no-console
      console.log('[App] handleLoginSuccess received user:', user);
    } catch (e) {}

    setCurrentUser(user);

    // Normalize role to avoid case/whitespace mismatches
    const role = (user?.role || '').toString().trim().toLowerCase();

    switch (role) {
      case 'admin':
        setScreen('admin');
        break;
      case 'staff':
        setScreen('staff');
        break;
      case 'customer':
      case 'user':
        setScreen('home');
        break;
      default:
        // Fallback: log and alert so developer notices the unexpected value
        try {
          // eslint-disable-next-line no-console
          console.warn('[App] Unexpected role value:', user?.role);
        } catch (e) {}
        alert('Invalid user role: ' + (user?.role ?? 'undefined'));
        break;
    }
  };

  return (
    <>
      {screen === 'loading' && <LoadingScreen onGetStarted={() => setScreen('login')} />}

      {screen === 'login' && (
        <LoginScreen
          onSignUp={() => setScreen('register')}
          onLoginSuccess={handleLoginSuccess}
          onStaffLogin={(user) => handleLoginSuccess(user)}
          onAdminLogin={(user) => handleLoginSuccess(user)}
          onAdminStaffRegister={() => setScreen('adminStaffRegister')} // New button
        />
      )}

      {screen === 'register' && (
        <RegisterScreen
          onLogin={() => setScreen('login')}
          onRegisterSuccess={handleLoginSuccess}
        />
      )}

      {screen === 'adminStaffRegister' && (
        <AdminStaffRegisterScreen
          onBack={() => setScreen('login')}
          onRegisterSuccess={handleLoginSuccess}
        />
      )}

      {screen === 'home' && (
        <CoffeeShopScreen
          onOrder={(product) => { setSelectedProduct(product); setScreen('order'); }}
          onCart={() => setScreen('cart')}
          onProfile={() => setScreen('profile')}
          onHistory={() => setScreen('history')}
          onFavorites={() => setScreen('favorites')}
          onStaffDashboard={() => setScreen('staff')}
          onAdminDashboard={() => setScreen('admin')}
          cartItemsCount={cartItems.length}
        />
      )}

      {screen === 'order' && selectedProduct ? (
        <Order
          product={selectedProduct}
          onBack={() => setScreen('home')}
          onAddToCart={(item) => { addToCart(item); setScreen('cart'); }}
        />
      ) : screen === 'order' ? (
        <div style={{ padding: 20 }}>
          <p>No product selected. Returning home.</p>
          <button onClick={() => setScreen('home')}>Go home</button>
        </div>
      ) : null}

      {screen === 'cart' && (
        <Cart
          items={cartItems}
          onBack={() => setScreen('home')}
          onCheckout={() => setScreen('payment')}
          onUpdateCart={setCartItems}
        />
      )}

      {screen === 'profile' && (
        <Profile
          onBack={() => setScreen('home')}
          onEdit={() => setScreen('editProfile')}
          onLogout={() => { setCurrentUser(null); setScreen('login'); }}
        />
      )}

      {screen === 'editProfile' && (
        <EditProfile onBack={() => setScreen('profile')} onSave={() => setScreen('profile')} />
      )}

      {screen === 'payment' && (
        <Payment
          total={cartItems.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity ?? 1)), 0)}
          items={cartItems}
          onBack={() => setScreen('cart')}
          onPayNow={(method) => { setSelectedPaymentMethod(method || 'Cash on Delivery'); setScreen('paynow'); }}
        />
      )}

      {screen === 'paynow' && (
        <PayNow
          total={cartItems.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity ?? 1)), 0) * 1.1}
          paymentMethod={selectedPaymentMethod}
          onBack={() => setScreen('payment')}
          onPayNow={() => setScreen('receipt')}
        />
      )}

      {screen === 'receipt' && (
        <Receipt
          items={cartItems}
          onBackHome={() => { setCartItems([]); setSelectedProduct(null); setScreen('home'); }}
        />
      )}

      {screen === 'history' && (
        <History
          onBack={() => setScreen('home')}
          onReorder={(product) => { setSelectedProduct(product); setScreen('order'); }}
          onViewReceipt={(items) => { setCartItems(items || []); setScreen('receipt'); }}
        />
      )}

      {screen === 'favorites' && (
        <Favorites
          onBack={() => setScreen('home')}
          onOrder={(product) => { setSelectedProduct(product); setScreen('order'); }}
        />
      )}

      {screen === 'staff' && (
        <StaffDashboard onBack={() => setScreen('home')} onLogout={() => { setCurrentUser(null); setScreen('login'); }} />
      )}

      {screen === 'admin' && (
        <AdminDashboard onBack={() => setScreen('home')} onLogout={() => { setCurrentUser(null); setScreen('login'); }} />
      )}
    </>
  );
}

export default App;

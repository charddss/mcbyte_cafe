/**
 * Centralized Navigation Function
 * Handles all navigation flows in the application
 */

export const createNavigationHandler = (setScreen, setSelectedProduct, setCartItems, setSelectedPaymentMethod) => {
  
  // Authentication Flow
  const navigateToLogin = () => setScreen('login');
  const navigateToRegister = () => setScreen('register');
  const navigateToHome = () => setScreen('home');

  // Main Flow: Login/Sign Up → Home → Order → Payment → Pay Now → Receipt
  const handleLoginSuccess = () => {
    setScreen('home');
  };

  const handleRegisterSuccess = () => {
    setScreen('home');
  };

  const handleOrder = (product) => {
    setSelectedProduct(product);
    setScreen('order');
  };

  const handleAddToCart = (item) => {
    setCartItems(prev => [...prev, item]);
    setScreen('cart');
  };

  const handleCheckout = () => {
    setScreen('payment');
  };

  const handlePayNow = (method) => {
    setSelectedPaymentMethod(method || 'Cash on Delivery');
    setScreen('paynow');
  };

  const handleCompletePayment = () => {
    setScreen('receipt');
  };

  const handleBackToHome = () => {
    setCartItems([]);
    setSelectedProduct(null);
    setScreen('home');
  };

  // Home Page Navigation
  const navigateToFavorites = () => {
    setScreen('favorites');
  };

  const navigateToCart = () => {
    setScreen('cart');
  };

  const navigateToProfile = () => {
    setScreen('profile');
  };

  const navigateToHistory = () => {
    setScreen('history');
  };

  // Profile Navigation
  const navigateToEditProfile = () => {
    setScreen('editProfile');
  };

  const handleLogout = () => {
    setCartItems([]);
    setSelectedProduct(null);
    setScreen('login');
  };

  // Dashboard Navigation (from Profile/Navbar)
  const navigateToStaffDashboard = () => {
    setScreen('staff');
  };

  const navigateToAdminDashboard = () => {
    setScreen('admin');
  };

  // Back Navigation
  const navigateBack = (fromScreen) => {
    const backMap = {
      'order': 'home',
      'cart': 'home',
      'payment': 'cart',
      'paynow': 'payment',
      'profile': 'home',
      'editProfile': 'profile',
      'favorites': 'home',
      'history': 'home',
      'staff': 'home',
      'admin': 'home',
    };
    setScreen(backMap[fromScreen] || 'home');
  };

  // Return all navigation functions
  return {
    // Authentication
    navigateToLogin,
    navigateToRegister,
    navigateToHome,
    handleLoginSuccess,
    handleRegisterSuccess,
    
    // Main Order Flow
    handleOrder,
    handleAddToCart,
    handleCheckout,
    handlePayNow,
    handleCompletePayment,
    handleBackToHome,
    
    // Home Page Navigation
    navigateToFavorites,
    navigateToCart,
    navigateToProfile,
    navigateToHistory,
    
    // Profile Navigation
    navigateToEditProfile,
    handleLogout,
    
    // Dashboard Navigation
    navigateToStaffDashboard,
    navigateToAdminDashboard,
    
    // Back Navigation
    navigateBack,
  };
};


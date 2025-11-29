import React, { useState } from 'react';
import { Coffee, Mail, Lock, AlertCircle, ShieldCheck, UserCog, User as UserIcon } from 'lucide-react';
import { supabase } from '../lib/supabaseclient';

const LoginScreen = ({ onSignUp, onLoginSuccess, onStaffLogin, onAdminLogin, onAdminStaffRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleLogin = async () => {
    setError('');

    // Input validation
    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);

    try {
      // Sign in with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase(),
        password,
      });

      if (authError || !authData?.user) {
        // Show the real Supabase error if available to help debugging,
        // otherwise fall back to a generic message.
        const message = authError?.message || 'Invalid email or password';

        // Allow login to proceed even when Supabase reports "Email not confirmed".
        if (!authError || !message.toLowerCase().includes('email not confirmed')) {
          setError(message);
          setIsLoading(false);
          return;
        }
      }

      // Fetch user info from users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('email', email.toLowerCase())
        .single();

      if (userError || !userData) {
        setError('User not found in database');
        setIsLoading(false);
        return;
      }

      // Check if account is active
      if (userData.status === 'suspended') {
        await supabase.auth.signOut();
        setError('Your account has been suspended. Please contact support.');
        setIsLoading(false);
        return;
      }

      // Update last login timestamp
      await supabase
        .from('users')
        .update({ last_login: new Date().toISOString() })
        .eq('id', userData.id);

      const userInfo = {
        id: userData.id,
        email: userData.email,
        fullName: userData.full_name,
        role: userData.role,
        status: userData.status,
        permissions: userData.permissions || [],
      };

      // Debug: log role and userInfo to help trace redirect issues
      try {
        // eslint-disable-next-line no-console
        console.log('[LoginScreen] userData.role ->', userData.role, 'userInfo ->', userInfo);
      } catch (e) {}

      // Role-based routing: call role-specific callbacks if provided,
      // but always notify parent via `onLoginSuccess` when possible.
      // Normalize role to lowercase to avoid case mismatches.
      const role = (userData.role || '').toString().trim().toLowerCase();

      switch (role) {
        case 'admin':
          if (typeof onAdminLogin === 'function') onAdminLogin(userInfo);
          if (typeof onLoginSuccess === 'function') onLoginSuccess(userInfo);
          break;
        case 'staff':
          if (typeof onStaffLogin === 'function') onStaffLogin(userInfo);
          if (typeof onLoginSuccess === 'function') onLoginSuccess(userInfo);
          break;
        case 'customer':
        case 'user':
          if (typeof onLoginSuccess === 'function') onLoginSuccess(userInfo);
          break;
        default:
          setError('Invalid user role');
          await supabase.auth.signOut();
          setIsLoading(false);
          return;
      }

      setIsLoading(false);
    } catch (err) {
      console.error('Login error:', err);
      setError('An unexpected error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex flex-col items-center justify-center px-6 py-10 relative overflow-hidden">
      {/* Decorative Coffee Elements */}
      <div className="absolute top-10 left-10 opacity-10"><Coffee size={80} className="text-amber-800" /></div>
      <div className="absolute bottom-20 right-10 opacity-10"><Coffee size={60} className="text-amber-800" /></div>
      <div className="absolute top-1/3 right-20 opacity-10"><Coffee size={40} className="text-amber-800" /></div>

      {/* Main Card */}
      <div className="bg-white bg-opacity-80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 w-full max-w-md border-4 border-amber-200">
        <div className="flex flex-col items-center mb-6">
          <div className="bg-gradient-to-br from-amber-400 to-orange-500 p-4 rounded-full mb-4 shadow-lg">
            <img src="/logo.png" alt="Mcbyte's Cafe" className="w-16 h-16" />
          </div>
          <h1 className="text-3xl font-bold text-amber-900 mb-1">Welcome Back</h1>
          <p className="text-sm text-amber-700">Log in to your cafe account</p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border-2 border-red-300 rounded-2xl flex items-start gap-2">
            <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
            <div className="text-red-600 font-medium text-sm">{error}</div>
          </div>
        )}

        <div className="flex flex-col gap-4 mb-6">
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-800" size={20} />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(''); }}
              disabled={isLoading}
              className="w-full pl-12 pr-4 py-3 rounded-2xl bg-amber-100 text-amber-900 placeholder-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-400 disabled:opacity-50 border-2 border-amber-200 font-medium"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-800" size={20} />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(''); }}
              onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleLogin()}
              disabled={isLoading}
              className="w-full pl-12 pr-4 py-3 rounded-2xl bg-amber-100 text-amber-900 placeholder-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-400 disabled:opacity-50 border-2 border-amber-200 font-medium"
            />
          </div>
        </div>

        <button
          onClick={handleLogin}
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white py-3 rounded-2xl font-bold text-lg hover:from-amber-600 hover:to-orange-600 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 border-2 border-amber-600 mb-4"
        >
          {isLoading ? (
            <>
              <Coffee className="animate-spin" size={20} />
              <span>Brewing...</span>
            </>
          ) : (
            <>
              <Coffee size={20} />
              <span>Login</span>
            </>
          )}
        </button>

        <p className="text-sm text-center text-amber-800">
          Don't have an account?{' '}
          <button onClick={onSignUp} className="text-orange-600 underline hover:text-orange-700 font-semibold" disabled={isLoading}>
            Sign Up
          </button>
        </p>

        {/* Admin/Staff Registration Button */}
        <p className="text-sm text-center text-amber-800 mt-2">
          Need to create an Admin or Staff account?{' '}
          <button
            onClick={onAdminStaffRegister}
            className="text-orange-600 underline hover:text-orange-700 font-semibold"
            disabled={isLoading}
          >
            Register here
          </button>
        </p>
        
      </div>
    </div>
  );
};

export default LoginScreen;

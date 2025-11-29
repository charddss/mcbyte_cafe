// RegisterScreen.jsx
import React, { useState } from 'react';
import { Coffee, User, Mail, Lock, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabaseclient';

const RegisterScreen = ({ onLogin, onRegisterSuccess }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Validate email format
  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
    setSuccess('');
  };

  const handleRegister = async () => {
    setError('');
    setSuccess('');
    const { fullName, email, password, confirmPassword } = formData;
    const emailLower = email.trim().toLowerCase();

    // Validation
    if (!fullName.trim()) return setError('Please enter your full name');
    if (fullName.trim().length < 2) return setError('Name must be at least 2 characters');
    if (!email.trim()) return setError('Please enter your email');
    if (!validateEmail(email)) return setError('Please enter a valid email address');
    if (!password) return setError('Please enter a password');
    if (password.length < 6) return setError('Password must be at least 6 characters long');
    if (!confirmPassword) return setError('Please confirm your password');
    if (password !== confirmPassword) return setError('Passwords do not match');

    // Block admin/staff emails
    const restrictedDomains = ['admin@', 'staff@', 'mcbytes-admin@', 'mcbytes-staff@'];
    if (restrictedDomains.some(domain => emailLower.startsWith(domain))) {
      return setError('Admin and staff accounts must be created by system administrators');
    }

    setIsLoading(true);

    try {
      // Check if email exists in users table
      const { data: existingUser } = await supabase
        .from('users')
        .select('email')
        .eq('email', emailLower)
        .limit(1);

      if (existingUser?.length) {
        setError('This email is already registered. Please log in.');
        setIsLoading(false);
        return;
      }

      console.log('Attempting signup:', { email: emailLower, password });

      // Register user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp(
        { email: emailLower, password },
        { emailRedirectTo: window.location.origin + '/login' }
      );

      if (authError) {
        setError(authError.message.includes('already registered') ? 'This email is already registered. Please log in.' : authError.message);
        setIsLoading(false);
        return;
      }

      if (!authData.user?.id) {
        setSuccess('Account created! Please check your email to confirm your account.');
        setIsLoading(false);
        return;
      }

      // Generate unique customer ID
      const customerId = `CUST-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

      // Insert user into 'users' table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .insert([{
          id: authData.user.id,
          email: emailLower,
          full_name: fullName.trim(),
          role: 'customer',
          customer_id: customerId,
          permissions: ['view_menu', 'place_order', 'view_order_history'],
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (userError) {
        setError('Failed to create user profile. Please try again.');
        console.error('User profile error:', userError);
        setIsLoading(false);
        return;
      }

      setSuccess('Account created successfully! Please verify your email, then log in. Redirecting to login...');
      setTimeout(() => {
        setIsLoading(false);
        // After registration we send the user back to the login screen so they can sign in
        // (same behavior expected for admin/staff registrations handled elsewhere)
        onLogin();
      }, 1500);

    } catch (err) {
      console.error('Registration error:', err);
      setError('An error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex flex-col items-center justify-center px-6 py-10 relative overflow-hidden">
      <div className="absolute top-10 left-10 opacity-10"><Coffee size={80} className="text-amber-800" /></div>
      <div className="absolute bottom-20 right-10 opacity-10"><Coffee size={60} className="text-amber-800" /></div>
      <div className="absolute top-1/3 right-20 opacity-10"><Coffee size={40} className="text-amber-800" /></div>

      <div className="bg-white bg-opacity-80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 w-full max-w-md border-4 border-amber-200">
        <div className="flex flex-col items-center mb-6">
          <div className="bg-gradient-to-br from-amber-400 to-orange-500 p-4 rounded-full mb-4 shadow-lg">
            <img src="/logo.png" alt="Mcbyte's Cafe" className="w-16 h-16" />
          </div>
          <h1 className="text-3xl font-bold text-amber-900 mb-1">Join Our Cafe</h1>
          <p className="text-sm text-amber-700">Create your customer account</p>
        </div>

        {error && <div className="mb-4 p-4 bg-red-50 border-2 border-red-300 rounded-2xl flex items-start gap-2"><AlertCircle className="text-red-500" size={20} /><div className="text-red-600 text-sm">{error}</div></div>}
        {success && <div className="mb-4 p-4 bg-green-50 border-2 border-green-300 rounded-2xl flex items-start gap-2"><CheckCircle className="text-green-500" size={20} /><div className="text-green-600 text-sm">{success}</div></div>}

        <div className="flex flex-col gap-4 mb-6">
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-800" size={20} />
            <input type="text" placeholder="Full Name" value={formData.fullName} onChange={(e)=>handleInputChange('fullName', e.target.value)} disabled={isLoading} className="w-full pl-12 pr-4 py-3 rounded-2xl bg-amber-100 text-amber-900 placeholder-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-400 disabled:opacity-50 border-2 border-amber-200 font-medium"/>
          </div>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-800" size={20} />
            <input type="email" placeholder="Email" value={formData.email} onChange={(e)=>handleInputChange('email', e.target.value)} disabled={isLoading} className="w-full pl-12 pr-4 py-3 rounded-2xl bg-amber-100 text-amber-900 placeholder-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-400 disabled:opacity-50 border-2 border-amber-200 font-medium"/>
          </div>
          <div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-800" size={20} />
              <input type="password" placeholder="Password" value={formData.password} onChange={(e)=>handleInputChange('password', e.target.value)} disabled={isLoading} className="w-full pl-12 pr-4 py-3 rounded-2xl bg-amber-100 text-amber-900 placeholder-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-400 disabled:opacity-50 border-2 border-amber-200 font-medium"/>
            </div>
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-800" size={20} />
            <input type="password" placeholder="Confirm Password" value={formData.confirmPassword} onChange={(e)=>handleInputChange('confirmPassword', e.target.value)} onKeyPress={(e)=>e.key==='Enter' && !isLoading && handleRegister()} disabled={isLoading} className="w-full pl-12 pr-4 py-3 rounded-2xl bg-amber-100 text-amber-900 placeholder-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-400 disabled:opacity-50 border-2 border-amber-200 font-medium"/>
          </div>
        </div>

        <button onClick={handleRegister} disabled={isLoading} className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white py-3 rounded-2xl font-bold text-lg hover:from-amber-600 hover:to-orange-600 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 border-2 border-amber-600 mb-4">
          {isLoading ? <><Coffee className="animate-spin" size={20} />Creating account...</> : <><CheckCircle size={20}/> Sign Up</>}
        </button>

        <p className="text-sm text-center text-amber-800">
          Already have an account?{' '}
          <button onClick={onLogin} disabled={isLoading} className="text-orange-600 underline hover:text-orange-700 font-semibold">Log in here</button>
        </p>
      </div>
    </div>
  );
};

export default RegisterScreen;

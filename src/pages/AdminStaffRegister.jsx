import React, { useState } from 'react';
import { Coffee, User, Mail, Lock, CheckCircle, AlertCircle, ShieldCheck } from 'lucide-react';
import { supabase } from '../lib/supabaseclient';

const AdminStaffRegister = ({ onBack }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'staff', // default role
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
    setSuccess('');
  };

  const handleRegister = async () => {
    setError('');
    setSuccess('');

    const { fullName, email, password, confirmPassword, role } = formData;
    const emailLower = email.trim().toLowerCase();

    if (!fullName.trim()) return setError('Please enter full name');
    if (!email.trim()) return setError('Please enter email');
    if (!validateEmail(email)) return setError('Invalid email address');
    if (!password) return setError('Please enter password');
    if (password !== confirmPassword) return setError('Passwords do not match');

    setIsLoading(true);

    try {
      // Check if email already exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('email')
        .eq('email', emailLower)
        .maybeSingle();

      if (existingUser) {
        setError('Email already registered');
        setIsLoading(false);
        return;
      }

      // Create user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: emailLower,
        password
      });

      if (authError) {
        setError(authError.message);
        setIsLoading(false);
        return;
      }

      // Insert user into 'users' table
      await supabase.from('users').insert([{
        id: authData.user.id,
        email: emailLower,
        full_name: fullName.trim(),
        role: role, // staff or admin
        status: 'active',
        permissions: role === 'admin'
          ? ['manage_users','manage_orders','view_reports']
          : ['view_menu','place_order','view_order_history'],
        created_at: new Date().toISOString()
      }]);

      setSuccess(`${role.charAt(0).toUpperCase() + role.slice(1)} account created successfully!`);
      setIsLoading(false);

    } catch (err) {
      console.error(err);
      setError('Error creating account');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex flex-col items-center justify-center px-6 py-10">
      <div className="bg-white bg-opacity-80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 w-full max-w-md border-4 border-amber-200">
        <div className="flex flex-col items-center mb-6">
          <ShieldCheck className="text-amber-800 mb-2" size={40} />
          <h1 className="text-2xl font-bold text-amber-900 mb-1">Admin/Staff Registration</h1>
          <p className="text-sm text-amber-700">Only authorized admins can create accounts</p>
        </div>

        {error && <div className="mb-4 p-4 bg-red-50 border-2 border-red-300 rounded-2xl flex items-start gap-2">
          <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
          <div className="text-red-600 font-medium text-sm">{error}</div>
        </div>}

        {success && <div className="mb-4 p-4 bg-green-50 border-2 border-green-300 rounded-2xl flex items-start gap-2">
          <CheckCircle className="text-green-500 flex-shrink-0 mt-0.5" size={20} />
          <div className="text-green-600 font-medium text-sm">{success}</div>
        </div>}

        <div className="flex flex-col gap-4 mb-6">
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-800" size={20} />
            <input type="text" placeholder="Full Name" value={formData.fullName} onChange={e => handleInputChange('fullName', e.target.value)} className="w-full pl-12 pr-4 py-3 rounded-2xl bg-amber-100 text-amber-900 placeholder-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-400 border-2 border-amber-200" />
          </div>

          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-800" size={20} />
            <input type="email" placeholder="Email" value={formData.email} onChange={e => handleInputChange('email', e.target.value)} className="w-full pl-12 pr-4 py-3 rounded-2xl bg-amber-100 text-amber-900 placeholder-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-400 border-2 border-amber-200" />
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-800" size={20} />
            <input type="password" placeholder="Password" value={formData.password} onChange={e => handleInputChange('password', e.target.value)} className="w-full pl-12 pr-4 py-3 rounded-2xl bg-amber-100 text-amber-900 placeholder-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-400 border-2 border-amber-200" />
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-800" size={20} />
            <input type="password" placeholder="Confirm Password" value={formData.confirmPassword} onChange={e => handleInputChange('confirmPassword', e.target.value)} className="w-full pl-12 pr-4 py-3 rounded-2xl bg-amber-100 text-amber-900 placeholder-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-400 border-2 border-amber-200" />
          </div>

          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <input type="radio" name="role" value="admin" checked={formData.role==='admin'} onChange={e=>handleInputChange('role', e.target.value)} />
              Admin
            </label>
            <label className="flex items-center gap-2">
              <input type="radio" name="role" value="staff" checked={formData.role==='staff'} onChange={e=>handleInputChange('role', e.target.value)} />
              Staff
            </label>
          </div>
        </div>

        <button onClick={handleRegister} disabled={isLoading} className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white py-3 rounded-2xl font-bold text-lg hover:from-amber-600 hover:to-orange-600 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mb-4">
          {isLoading ? <><Coffee className="animate-spin" size={20} />Creating account...</> : <> <CheckCircle size={20}/> Create Account</>}
        </button>

        <p className="text-sm text-center text-amber-800">
          <button onClick={onBack} className="text-orange-600 underline hover:text-orange-700 font-semibold">Back to Login</button>
        </p>
      </div>
    </div>
  );
};

export default AdminStaffRegister;

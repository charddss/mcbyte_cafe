import React, { useEffect, useState } from 'react';
import { User, MapPin, Phone, Mail, CreditCard, Settings, LogOut, ChevronRight, ChevronLeft } from 'lucide-react';
import { supabase } from '../lib/supabaseclient';

const Profile = ({ onBack, onEdit, onLogout, onStaff, onAdmin }) => {
  const [profile, setProfile] = useState({
    name: 'Guest User',
    email: '',
    phone: '',
    address: '',
    role: '',
  });

  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState(null); // { message, type }

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
          return;
        }

        const { data, error } = await supabase
          .from('users')
          .select('full_name, email, phone, address, role')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error fetching profile:', error);
          setProfile((prev) => ({
            ...prev,
            name: user.user_metadata?.full_name || prev.name,
            email: user.email || prev.email,
          }));
          return;
        }

        if (data) {
          setProfile((prev) => ({
            ...prev,
            name: data.full_name || user.user_metadata?.full_name || prev.name,
            email: data.email || user.email || prev.email,
            phone: data.phone || prev.phone,
            address: data.address || prev.address,
            role: data.role || prev.role,
          }));
        }
      } catch (error) {
        console.error('Unexpected error fetching profile:', error);
      }
    };

    fetchProfile();
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 2000);
  };

  const handleSaveProfile = async () => {
    try {
      setIsSaving(true);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        showToast('You must be logged in to update your profile.', 'error');
        return;
      }

      const updates = {
        full_name: profile.name,
        email: profile.email || null,
        phone: profile.phone || null,
        address: profile.address || null,
      };

      const { error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', user.id);

      if (error) {
        console.error('Error updating profile:', error);
        showToast('Error updating profile. Please try again.', 'error');
        return;
      }

      showToast('Profile updated successfully.', 'success');
    } catch (error) {
      console.error('Unexpected error updating profile:', error);
      showToast('Unexpected error updating profile. Please try again.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4a825] flex flex-col">
      {/* Header + Profile Card */}
      <div className="px-6 pt-8 pb-4">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={onBack}
            className="text-white hover:bg-white/20 p-2 rounded-xl transition-all duration-200 hover:scale-110"
          >
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-2xl sm:text-3xl font-bold text-white drop-shadow-lg">Profile</h1>
          <div className="w-10"></div>
        </div>

        {/* Profile Card */}
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-6 shadow-2xl border-2 border-white/50">
          <div className="flex items-center gap-4 mb-5">
            <div className="relative flex-shrink-0">
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600 rounded-full flex items-center justify-center shadow-xl border-4 border-white">
                <User size={40} className="text-white sm:size-[44px]" />
              </div>
              <div className="absolute bottom-0 right-0 w-5 h-5 sm:w-6 sm:h-6 bg-green-500 rounded-full border-4 border-white shadow-md"></div>
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1 leading-tight break-words">
                {profile.name}
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 break-words">
                {profile.email || 'No email on file'}
              </p>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-gray-100">
            {/* Email (read-only) */}
            <div className="flex items-center gap-3 text-sm">
              <div className="bg-gray-50 p-2 rounded-lg flex-shrink-0">
                <Mail size={18} className="text-gray-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-500 mb-1">Email</p>
                <input
                  type="email"
                  value={profile.email}
                  readOnly
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-700 cursor-not-allowed"
                />
              </div>
            </div>

            {/* Phone */}
            <div className="flex items-center gap-3 text-sm">
              <div className="bg-blue-50 p-2 rounded-lg flex-shrink-0">
                <Phone size={18} className="text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-500 mb-1">Phone</p>
                <input
                  type="tel"
                  value={profile.phone}
                  onChange={(e) =>
                    setProfile((prev) => ({ ...prev, phone: e.target.value }))
                  }
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Enter phone number"
                />
              </div>
            </div>

            {/* Address */}
            <div className="flex items-start gap-3 text-sm">
              <div className="bg-green-50 p-2 rounded-lg flex-shrink-0 mt-6">
                <MapPin size={18} className="text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-500 mb-1">Address</p>
                <textarea
                  rows={2}
                  value={profile.address}
                  onChange={(e) =>
                    setProfile((prev) => ({ ...prev, address: e.target.value }))
                  }
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                  placeholder="Enter address"
                />
              </div>
            </div>

            {/* Role (read-only badge) */}
            {profile.role && (
              <div className="flex items-center justify-between text-sm bg-gray-50 px-4 py-3 rounded-xl">
                <span className="text-gray-500">Role</span>
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-orange-100 text-orange-700 uppercase tracking-wide">
                  {profile.role}
                </span>
              </div>
            )}

            <button
              type="button"
              onClick={handleSaveProfile}
              disabled={isSaving}
              className="w-full mt-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white py-2.5 rounded-xl font-semibold hover:from-orange-600 hover:to-orange-700 transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-md"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>

      {/* Logout Button */}
      <div className="px-6 mt-6 pb-6">
        <button
          onClick={onLogout}
          className="w-full bg-white text-orange-600 py-4 rounded-xl font-bold border border-orange-200 hover:bg-orange-50 transition-all duration-200 shadow-xl hover:shadow-2xl hover:scale-105 transform flex items-center justify-center gap-2"
        >
          <LogOut size={20} />
          Logout
        </button>
      </div>

      {toast && (
        <div className="fixed inset-x-0 bottom-6 flex justify-center px-4 pointer-events-none">
          <div
            className={`pointer-events-auto max-w-sm w-full sm:w-auto flex items-start gap-3 px-4 py-3 rounded-2xl shadow-2xl backdrop-blur-md border text-sm font-semibold text-white transform transition-all duration-300 ease-out
              ${toast.type === 'error'
                ? 'bg-red-500/90 border-red-400/70'
                : 'bg-emerald-500/90 border-emerald-400/70'}
            `}
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

export default Profile;
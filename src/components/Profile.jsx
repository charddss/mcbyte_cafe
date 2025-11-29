import React from 'react';
import { User, MapPin, Phone, Mail, CreditCard, Settings, LogOut, ChevronRight, ChevronLeft } from 'lucide-react';

const Profile = ({ onBack, onEdit, onLogout, onStaff, onAdmin }) => {
  const menuItems = [
    { icon: User, label: 'Edit Profile', color: 'text-blue-600', onClick: onEdit },
    { icon: MapPin, label: 'Addresses', color: 'text-green-600', onClick: () => {} },
    { icon: CreditCard, label: 'Payment Methods', color: 'text-purple-600', onClick: () => {} },
    { icon: Settings, label: 'Settings', color: 'text-gray-600', onClick: () => {} },
  ];

  // Add Staff and Admin dashboard options if provided
  if (onStaff || onAdmin) {
    if (onStaff) {
      menuItems.push({ 
        icon: Settings, 
        label: 'Staff Dashboard', 
        color: 'text-orange-600', 
        onClick: onStaff 
      });
    }
    if (onAdmin) {
      menuItems.push({ 
        icon: Settings, 
        label: 'Admin Dashboard', 
        color: 'text-purple-600', 
        onClick: onAdmin 
      });
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50/20 to-yellow-50/20">
      {/* Header with Profile Info */}
      <div className="bg-gradient-to-br from-yellow-400 via-orange-400 to-orange-500 rounded-b-3xl px-6 pt-8 pb-8 shadow-xl relative overflow-hidden">
        <div className="absolute inset-0 bg-black/5"></div>
        <div className="relative">
          <div className="flex items-center justify-between mb-8">
            <button 
              onClick={onBack} 
              className="text-white hover:bg-white/20 p-2 rounded-xl transition-all duration-200 hover:scale-110"
            >
              <ChevronLeft size={24} />
            </button>
            <h1 className="text-2xl font-bold text-white drop-shadow-lg">Profile</h1>
            <div className="w-10"></div>
          </div>
          
          {/* Profile Card */}
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-6 shadow-2xl border-2 border-white/50">
            <div className="flex items-center gap-4 mb-5">
              <div className="relative">
                <div className="w-24 h-24 bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600 rounded-full flex items-center justify-center shadow-xl border-4 border-white">
                  <User size={44} className="text-white" />
                </div>
                <div className="absolute bottom-0 right-0 w-6 h-6 bg-green-500 rounded-full border-4 border-white shadow-md"></div>
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-1">John Doe</h2>
                <p className="text-gray-500 text-sm">john.doe@email.com</p>
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-3 text-sm bg-gray-50 px-4 py-3 rounded-xl hover:bg-gray-100 transition-colors">
                <div className="bg-blue-50 p-2 rounded-lg">
                  <Phone size={18} className="text-blue-600" />
                </div>
                <span className="text-gray-700 font-medium">+63 912 345 6789</span>
              </div>
              <div className="flex items-center gap-3 text-sm bg-gray-50 px-4 py-3 rounded-xl hover:bg-gray-100 transition-colors">
                <div className="bg-green-50 p-2 rounded-lg">
                  <MapPin size={18} className="text-green-600" />
                </div>
                <span className="text-gray-700 font-medium">Bunawan, Caraga, Philippines</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="px-6 mt-6">
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-xl overflow-hidden border border-white/50">
          {menuItems.map((item, index) => (
            <button
              key={index}
              onClick={item.onClick}
              className={`group w-full flex items-center justify-between p-5 hover:bg-gradient-to-r hover:from-orange-50 hover:to-yellow-50 transition-all duration-200 ${
                index !== menuItems.length - 1 ? 'border-b border-gray-100' : ''
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`${item.color} bg-gray-50 group-hover:bg-white p-2.5 rounded-xl transition-all duration-200 group-hover:scale-110`}>
                  <item.icon size={22} />
                </div>
                <span className="font-semibold text-gray-700 group-hover:text-orange-600 transition-colors">{item.label}</span>
              </div>
              <ChevronRight size={20} className="text-gray-400 group-hover:text-orange-500 group-hover:translate-x-1 transition-all" />
            </button>
          ))}
        </div>

        {/* Logout Button */}
        <button 
          onClick={onLogout}
          className="w-full mt-6 bg-gradient-to-r from-red-500 to-red-600 text-white py-4 rounded-xl font-bold hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-xl hover:shadow-2xl hover:scale-105 transform flex items-center justify-center gap-2"
        >
          <LogOut size={20} />
          Logout
        </button>
      </div>
    </div>
  );
};

export default Profile;
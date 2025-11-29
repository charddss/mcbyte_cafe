import React, { useState } from 'react';
import { ChevronLeft, User, Camera } from 'lucide-react';

const EditProfile = ({ onBack, onSave }) => {
  const [formData, setFormData] = useState({
    name: 'John Doe',
    email: 'john.doe@email.com',
    phone: '+63 912 345 6789',
    address: 'Bunawan, Caraga, Philippines'
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = () => {
    console.log('Profile updated:', formData);
    onSave();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-yellow-400 via-orange-400 to-orange-500 px-6 pt-8 pb-6">
        <div className="flex items-center justify-between mb-6">
          <button onClick={onBack} className="text-white">
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-xl font-bold text-white">Edit Profile</h1>
          <div className="w-6"></div>
        </div>
      </div>

      {/* Profile Photo */}
      <div className="px-6 -mt-12">
        <div className="bg-white rounded-2xl p-6 shadow-lg mb-6">
          <div className="flex flex-col items-center">
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center">
                <User size={48} className="text-white" />
              </div>
              <button className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center border-2 border-orange-500">
                <Camera size={16} className="text-orange-500" />
              </button>
            </div>
            <p className="text-sm text-gray-500 mt-3">Tap to change photo</p>
          </div>
        </div>

        {/* Edit Form */}
        <div className="space-y-4 pb-6">
          <div className="bg-white rounded-2xl p-5 shadow-md">
            <label className="text-sm font-semibold text-gray-700 block mb-2">
              Full Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white"
              placeholder="Enter your name"
            />
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-md">
            <label className="text-sm font-semibold text-gray-700 block mb-2">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white"
              placeholder="Enter your email"
            />
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-md">
            <label className="text-sm font-semibold text-gray-700 block mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white"
              placeholder="Enter your phone"
            />
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-md">
            <label className="text-sm font-semibold text-gray-700 block mb-2">
              Address
            </label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              rows="3"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white resize-none"
              placeholder="Enter your address"
            />
          </div>

          {/* Save Button */}
          <button
            onClick={handleSubmit}
            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-4 rounded-xl font-bold hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg mt-6"
          >
            Save Changes
          </button>

          {/* Cancel Button */}
          <button
            onClick={onBack}
            className="w-full bg-gray-100 text-gray-700 py-4 rounded-xl font-bold hover:bg-gray-200 transition-all"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;
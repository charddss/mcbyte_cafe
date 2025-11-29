import React, { useState } from 'react';
import { ChevronLeft, User, Camera, Check } from 'lucide-react';

const PayNow = ({ total = 0, paymentMethod = 'Cash on Delivery', onBack, onPayNow }) => {
  const [captureOnDelivery, setCaptureOnDelivery] = useState(false);

  return (
    <div className="min-h-screen bg-[#f4a825] pb-24">
      {/* Header */}
      <div className="bg-[#8B4513] px-6 pt-8 pb-4">
        <div className="flex items-center justify-between mb-6">
          <button onClick={onBack} className="text-white">
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-xl font-bold text-white">Payment</h1>
          <div className="w-6"></div>
        </div>
      </div>

      {/* Payment Card */}
      <div className="px-6 mt-4">
        <div className="bg-white rounded-2xl p-5 shadow-lg">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Order paid by cash!</h2>
          
          {/* User Info */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
              <User size={24} className="text-gray-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Imam</h3>
            </div>
          </div>

          {/* Capture on Delivery */}
          <div className="flex items-center gap-3 mb-4">
            <Camera size={20} className="text-gray-600" />
            <span className="text-sm text-gray-700">Capture on Delivery only</span>
          </div>

          {/* Amount */}
          <div className="space-y-2 mb-4">
            <div className="flex justify-between">
              <span className="text-gray-600">Amount:</span>
              <span className="font-semibold">$ {(total / 10000).toFixed(1)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Price:</span>
              <span className="font-bold text-lg">$ {(total / 10000).toFixed(1)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Pay Now Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-4 shadow-lg">
        <div className="flex items-center gap-3 mb-3">
          <button
            onClick={() => setCaptureOnDelivery(!captureOnDelivery)}
            className={`w-6 h-6 rounded border-2 flex items-center justify-center ${
              captureOnDelivery 
                ? 'bg-[#f4a825] border-[#f4a825]' 
                : 'border-gray-300'
            }`}
          >
            {captureOnDelivery && <Check size={16} className="text-white" />}
          </button>
          <span className="text-sm text-gray-700">Submit Here</span>
        </div>
        <button 
          onClick={onPayNow}
          className="w-full bg-[#8B4513] text-white py-4 rounded-xl font-bold hover:bg-[#6B3410] transition-colors shadow-lg"
        >
          Pay Now
        </button>
      </div>
    </div>
  );
};

export default PayNow;


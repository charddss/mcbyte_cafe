import React, { useState } from 'react';
import { ChevronLeft, Plus, Minus, MapPin, Clock } from 'lucide-react';

const Payment = ({ items = [], total = 0, onBack, onPayNow }) => {
  const [deliveryAddress, setDeliveryAddress] = useState('3rd Door North');
  const [deliveryTime, setDeliveryTime] = useState('10-20 Min');

  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const discount = subtotal * 0.2; // 20% discount
  const deliveryFee = 0;
  const finalTotal = (subtotal - discount) + deliveryFee;

  const handlePayNow = () => {
    onPayNow('Cash on Delivery');
  };

  const updateQuantity = (id, change) => {
    // This would update cart items, but for now we'll just pass through
  };

  return (
    <div className="min-h-screen bg-[#f4a825] pb-24">
      {/* Header */}
      <div className="bg-[#8B4513] px-6 pt-8 pb-4">
        <div className="flex items-center justify-between mb-6">
          <button onClick={onBack} className="text-white">
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-xl font-bold text-white">My Order</h1>
          <div className="w-6"></div>
        </div>
      </div>

      {/* Delivery Address Section */}
      <div className="px-6 mt-4 mb-4">
        <div className="bg-white rounded-2xl p-4 shadow-md">
          <div className="flex items-center gap-3 mb-3">
            <MapPin size={20} className="text-gray-600" />
            <div className="flex-1">
              <span className="text-sm text-gray-600">Delivery Address: </span>
              <span className="text-sm font-semibold text-gray-900">{deliveryAddress}</span>
            </div>
          </div>
          <div className="flex items-center gap-3 mb-3">
            <Clock size={20} className="text-gray-600" />
            <div className="flex-1">
              <span className="text-sm text-gray-600">Delivery Time: </span>
              <span className="text-sm font-semibold text-gray-900">{deliveryTime}</span>
            </div>
          </div>
          <button className="w-full bg-gray-100 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-200 transition-colors text-sm">
            Add Delivery
          </button>
        </div>
      </div>

      {/* Cart Items */}
      <div className="px-6 space-y-3 mb-4">
        {items.map((item) => (
          <div key={item.id} className="bg-white rounded-2xl p-4 shadow-md">
            <div className="flex items-center gap-4">
              <div className="text-3xl">☕</div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900">{item.name}</h3>
              </div>
              <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-2 py-1">
                <button
                  onClick={() => updateQuantity(item.id, -1)}
                  className="text-gray-600 hover:text-gray-900"
                >
                  <Minus size={16} />
                </button>
                <span className="font-semibold w-6 text-center">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.id, 1)}
                  className="text-gray-600 hover:text-gray-900"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Discount Banner */}
      <div className="px-6 mb-4">
        <div className="bg-[#f4a825] rounded-xl p-4 flex items-center justify-between">
          <span className="text-white font-semibold">20% Discount is applied!</span>
          <ChevronLeft size={20} className="text-white rotate-180" />
        </div>
      </div>

      {/* Payment Summary */}
      <div className="px-6 mb-4">
        <div className="bg-white rounded-2xl p-5 shadow-md">
          <h2 className="font-bold text-lg mb-4">Payment Summary</h2>
          
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Price:</span>
              <span className="font-semibold">$ {(subtotal / 10000).toFixed(1)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Delivery Fee:</span>
              <span className="font-semibold">$ {deliveryFee.toFixed(1)}</span>
            </div>
            <div className="border-t pt-2 flex justify-between">
              <span className="font-bold">Total Payment:</span>
              <span className="font-bold text-lg">
                $ {(finalTotal / 10000).toFixed(1)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Pay Now Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-4 shadow-lg">
        <button 
          onClick={handlePayNow}
          className="w-full bg-[#8B4513] text-white py-4 rounded-xl font-bold hover:bg-[#6B3410] transition-colors shadow-lg"
        >
          Pay Now
        </button>
      </div>
    </div>
  );
};
   
export default Payment;
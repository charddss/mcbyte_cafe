import React, { useState } from 'react';
import { ChevronLeft, Plus, Minus, MapPin, Clock, Wallet, CreditCard, Smartphone, UtensilsCrossed, ShoppingBag, Store } from 'lucide-react';

const Payment = ({ items = [], total = 0, onBack, onPayNow }) => {
  const [deliveryAddress, setDeliveryAddress] = useState('3rd Door North');
  const [deliveryTime, setDeliveryTime] = useState('10-20 Min');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('Cash');
  const [selectedOrderType, setSelectedOrderType] = useState('Dine In');

  const subtotal = items.reduce(
    (sum, item) => sum + ((item.price || 0) * (item.quantity ?? 1)),
    0
  );
  const tax = subtotal * 0.1; // 10% tax to match cart
  const deliveryFee = 0;
  const finalTotal = subtotal + tax + deliveryFee;

  const handlePayNow = () => {
    onPayNow({ paymentMethod: selectedPaymentMethod, orderType: selectedOrderType });
  };

  const updateQuantity = (id, change) => {
    // This would update cart items, but for now we'll just pass through
  };

  const orderTypes = [
    {
      id: 'Dine In',
      name: 'Dine In',
      icon: UtensilsCrossed,
      description: 'Eat at the restaurant',
      color: 'from-orange-500 to-orange-600'
    },
    {
      id: 'Takeout',
      name: 'Takeout',
      icon: ShoppingBag,
      description: 'Take your order to go',
      color: 'from-teal-500 to-teal-600'
    },
    {
      id: 'Pickup',
      name: 'Pickup',
      icon: Store,
      description: 'Pick up at counter',
      color: 'from-indigo-500 to-indigo-600'
    }
  ];

  const paymentMethods = [
    {
      id: 'Cash',
      name: 'Cash',
      icon: Wallet,
      description: 'Pay with cash',
      color: 'from-green-500 to-green-600'
    },
    {
      id: 'GCash',
      name: 'GCash',
      icon: Smartphone,
      description: 'Pay via GCash',
      color: 'from-blue-500 to-blue-600'
    },
    {
      id: 'PayMaya',
      name: 'PayMaya',
      icon: CreditCard,
      description: 'Pay via PayMaya',
      color: 'from-purple-500 to-purple-600'
    }
  ];

  return (
    <div className="min-h-screen bg-[#f4a825] pb-32 flex flex-col">
      {/* Header */}
      <div className="bg-[#8B4513] px-4 sm:px-6 pt-8 pb-4">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between mb-6">
            <button onClick={onBack} className="text-white">
              <ChevronLeft size={24} />
            </button>
            <h1 className="text-xl font-bold text-white">My Order</h1>
            <div className="w-6"></div>
          </div>
        </div>
      </div>

      {/* Delivery Address Section */}
      <div className="px-4 sm:px-6 mt-4 mb-4 max-w-md mx-auto w-full">
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

      {/* Order Type Selection */}
      <div className="px-4 sm:px-6 mb-4 max-w-md mx-auto w-full">
        <div className="bg-white rounded-2xl p-4 shadow-md">
          <h2 className="font-bold text-lg mb-4 text-gray-800">Order Type</h2>
          <div className="grid grid-cols-3 gap-2">
            {orderTypes.map((type) => {
              const Icon = type.icon;
              const isSelected = selectedOrderType === type.id;
              return (
                <button
                  key={type.id}
                  onClick={() => setSelectedOrderType(type.id)}
                  className={`p-3 rounded-xl border-2 transition-all duration-200 ${isSelected
                    ? 'border-amber-600 bg-amber-50 shadow-md'
                    : 'border-gray-200 bg-white hover:border-amber-300 hover:bg-amber-50/50'
                    }`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${type.color} flex items-center justify-center shadow-sm`}>
                      <Icon size={20} className="text-white" />
                    </div>
                    <div className="text-center">
                      <p className="font-semibold text-gray-900 text-xs">{type.name}</p>
                      <p className="text-[10px] text-gray-500 mt-0.5 leading-tight">{type.description}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Payment Method Selection */}
      <div className="px-4 sm:px-6 mb-4 max-w-md mx-auto w-full">
        <div className="bg-white rounded-2xl p-4 shadow-md">
          <h2 className="font-bold text-lg mb-4 text-gray-800">Payment Method</h2>
          <div className="space-y-3">
            {paymentMethods.map((method) => {
              const Icon = method.icon;
              const isSelected = selectedPaymentMethod === method.id;
              return (
                <button
                  key={method.id}
                  onClick={() => setSelectedPaymentMethod(method.id)}
                  className={`w-full p-4 rounded-xl border-2 transition-all duration-200 ${isSelected
                    ? 'border-amber-600 bg-amber-50 shadow-md'
                    : 'border-gray-200 bg-white hover:border-amber-300 hover:bg-amber-50/50'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${method.color} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                      <Icon size={24} className="text-white" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-semibold text-gray-900 text-sm sm:text-base">{method.name}</p>
                      <p className="text-xs text-gray-500">{method.description}</p>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${isSelected
                      ? 'border-amber-600 bg-amber-600'
                      : 'border-gray-300'
                      }`}>
                      {isSelected && (
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Cart Items */}
      <div className="px-4 sm:px-6 space-y-3 mb-4 max-w-md mx-auto w-full">
        {items.map((item) => (
          <div key={item.id} className="bg-white rounded-2xl p-4 shadow-md">
            <div className="flex items-center gap-4">
              {/* Item Image */}
              <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
                {item.product_image ? (
                  <img
                    src={item.product_image}
                    alt={item.product_name || 'Product image'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-2xl">☕</span>
                )}
              </div>

              {/* Item Details */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 text-sm leading-snug break-words">
                  {item.product_name}
                </h3>
                {item.category && (
                  <p className="text-[11px] font-medium text-amber-700/90 mb-0.5">
                    {item.category}
                  </p>
                )}
                <div className="text-xs text-gray-500 space-y-0.5">
                  {(item.category === 'Hot Drinks' || item.category === 'Cold Drinks') && (
                    <>
                      {item.size && <p>Size: {item.size}</p>}
                      {item.ice_level && <p>Ice: {item.ice_level}</p>}
                      {item.sugar_level && <p>Sugar: {item.sugar_level}</p>}
                    </>
                  )}
                  {item.category &&
                    item.category !== 'Hot Drinks' &&
                    item.category !== 'Cold Drinks' &&
                    item.special_request && (
                      <p className="line-clamp-2">Notes: {item.special_request}</p>
                    )}
                </div>
              </div>

              {/* Quantity & Line Price */}
              <div className="flex flex-col items-end justify-between gap-2 self-stretch">
                <span className="text-xs text-gray-500">
                  Qty: <span className="font-semibold text-gray-800">{item.quantity}</span>
                </span>
                <p className="text-sm font-semibold text-amber-700">
                  ₱{(((item.price || 0) * (item.quantity ?? 1))).toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        ))}

        {items.length === 0 && (
          <div className="text-center text-white/90 text-sm py-4">
            No items in your order.
          </div>
        )}
      </div>

      {/* Discount Banner */}
      <div className="px-4 sm:px-6 mb-4 max-w-md mx-auto w-full">
        <div className="bg-[#f4a825] rounded-xl p-4 flex items-center justify-between">
          <span className="text-white font-semibold">20% Discount is applied!</span>
          <ChevronLeft size={20} className="text-white rotate-180" />
        </div>
      </div>

      {/* Payment Summary */}
      <div className="px-4 sm:px-6 mb-4 max-w-md mx-auto w-full">
        <div className="bg-white rounded-2xl p-5 shadow-md">
          <h2 className="font-bold text-lg mb-4">Payment Summary</h2>

          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal:</span>
              <span className="font-semibold">₱{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Tax (10%):</span>
              <span className="font-semibold">₱{tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Delivery Fee:</span>
              <span className="font-semibold">₱{deliveryFee.toFixed(2)}</span>
            </div>
            <div className="border-t pt-2 flex justify-between">
              <span className="font-bold">Total Payment:</span>
              <span className="font-bold text-lg text-amber-700">
                ₱{finalTotal.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Pay Now Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 sm:px-6 py-4 shadow-lg">
        <div className="max-w-md mx-auto">
          <button
            onClick={handlePayNow}
            className="w-full bg-[#8B4513] text-white py-4 rounded-xl font-bold hover:bg-[#6B3410] transition-colors shadow-lg"
          >
            Pay Now with {selectedPaymentMethod}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Payment;
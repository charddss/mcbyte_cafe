import React, { useState } from 'react';
import { ChevronLeft, User, Camera, Check } from 'lucide-react';

const PayNow = ({
  total = 0,
  paymentMethod = 'Cash',
  orderType = 'Dine In',
  customerName = 'Guest',
  orderId,
  phoneNumber,
  items = [],
  onBack,
  onPayNow,
}) => {
  const [captureOnDelivery, setCaptureOnDelivery] = useState(false);

  const formattedTotal = `₱${Number(total || 0).toFixed(2)}`;

  const handlePayNowClick = () => {
    if (onPayNow) {
      onPayNow({
        total,
        paymentMethod,
        orderType,
        captureOnDelivery,
        orderId,
        phoneNumber,
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 pb-24">
      {/* Header */}
      <div className="bg-[#8B4513] px-6 pt-8 pb-4 shadow-md">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <button onClick={onBack} className="text-white">
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-xl font-bold text-white">Payment</h1>
          <div className="w-6" />
        </div>
      </div>

      {/* Payment Card */}
      <div className="px-6 mt-4">
        <div className="max-w-md mx-auto bg-white rounded-2xl p-5 shadow-lg">
          <h2 className="text-lg font-bold text-gray-900 mb-1">Payment Summary</h2>
          <p className="text-xs text-gray-500 mb-4">
            {paymentMethod === 'Cash on Delivery'
              ? 'You will pay the rider in cash when your order arrives.'
              : `You selected ${paymentMethod} as your payment method.`}
          </p>

          {/* User Info */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
              <User size={24} className="text-gray-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{customerName}</h3>
              {orderId && (
                <p className="text-xs text-gray-500">Order #{orderId}</p>
              )}
            </div>
          </div>

          {/* Capture on Delivery */}
          {paymentMethod === 'Cash on Delivery' && (
            <div className="flex items-center gap-3 mb-4">
              <Camera size={20} className="text-gray-600" />
              <span className="text-sm text-gray-700">Capture on Delivery only</span>
            </div>
          )}

          {/* Amount */}
          <div className="space-y-2 mb-1">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Payment Method:</span>
              <span className="font-semibold text-gray-900 max-w-[55%] text-right truncate">
                {paymentMethod}
              </span>
            </div>
            <div className="border-t pt-2 flex justify-between items-center">
              <span className="font-semibold text-gray-700">Total Price:</span>
              <span className="font-bold text-lg text-amber-700">{formattedTotal}</span>
            </div>
          </div>

          {/* Order Items (minimalist list with picture) */}
          {items.length > 0 && (
            <div className="mt-4 border-t pt-3">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-gray-800">Order Items</h3>
                <span className="text-xs text-gray-500">
                  {items.length} {items.length === 1 ? 'item' : 'items'}
                </span>
              </div>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 text-xs text-gray-700"
                  >
                    {/* Item Image */}
                    <div className="w-10 h-10 bg-gradient-to-br from-amber-100 to-orange-100 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                      {item.product_image || item.image ? (
                        <img
                          src={item.product_image || item.image}
                          alt={item.product_name || 'Product image'}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-lg">☕</span>
                      )}
                    </div>

                    {/* Item Text */}
                    <div className="flex-1 min-w-0 mr-1">
                      <p className="font-medium text-gray-900 truncate">
                        {item.product_name}
                      </p>
                      <p className="text-[11px] text-gray-500">
                        Qty: {item.quantity ?? 1}
                        {item.size ? ` • ${item.size}` : ''}
                      </p>
                    </div>

                    {/* Line Total */}
                    <span className="font-semibold text-gray-900 whitespace-nowrap">
                      ₱{(((item.price || 0) * (item.quantity ?? 1))).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Pay Now Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-4 shadow-lg">
        <div className="max-w-md mx-auto">
          <div className="flex items-center gap-3 mb-3">
            <button
              onClick={() => setCaptureOnDelivery(!captureOnDelivery)}
              className={`w-6 h-6 rounded border-2 flex items-center justify-center ${captureOnDelivery
                  ? 'bg-[#f4a825] border-[#f4a825]'
                  : 'border-gray-300'
                }`}
            >
              {captureOnDelivery && <Check size={16} className="text-white" />}
            </button>
            <span className="text-sm text-gray-700">
              {captureOnDelivery ? 'Capture requirement enabled' : 'Confirm payment details'}
            </span>
          </div>
          <button
            onClick={handlePayNowClick}
            className="w-full bg-[#8B4513] text-white py-4 rounded-xl font-bold hover:bg-[#6B3410] transition-colors shadow-lg"
          >
            Pay Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default PayNow;


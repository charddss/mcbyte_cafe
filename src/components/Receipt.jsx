import React from 'react';
import { ChevronLeft } from 'lucide-react';
import QRCode from 'react-qr-code';

const Receipt = ({
  items = [],
  customerName,
  paymentMethod = 'Cash on Delivery',
  totalPaid,
  deliveryAddress,
  deliveryTime = '10-20 Min',
  onBackHome,
}) => {

  const subtotal = items.reduce(
    (sum, item) => sum + ((item.price || 0) * (item.quantity ?? 1)),
    0
  );
  const tax = subtotal * 0.1;
  const computedTotal = subtotal + tax;
  const finalTotal = typeof totalPaid === 'number' ? totalPaid : computedTotal;

  const qrData = {
    customerName: customerName || 'Guest',
    paymentMethod,
    deliveryAddress: deliveryAddress || 'No address specified',
    deliveryTime,
    total: finalTotal,
    items: items.map((item) => ({
      name: item.product_name,
      quantity: item.quantity ?? 1,
      price: item.price || 0,
    })),
  };

  const qrValue = JSON.stringify(qrData);

  return (
    <div className="min-h-screen bg-[#f4a825] flex flex-col p-6">
      {/* Header */}
      <div className="w-full mb-6">
        <button onClick={onBackHome} className="text-white">
          <ChevronLeft size={24} />
        </button>
      </div>

      <div className="w-full max-w-md mx-auto flex-1 flex flex-col justify-between">
        <div>
          {/* Coffee Bag Icon */}
          <div className="text-center mb-4 flex flex-col items-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full shadow-lg mb-2">
              <div className="text-4xl">
                🛍️
              </div>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Order Placed</h1>
            {/* Order Message */}
            <div className="text-center text-white max-w-xs mx-auto">
              <p className="text-base mb-2 leading-relaxed">
                {customerName || 'Guest'}, your order has been successfully placed.
              </p>
              <p className="text-sm leading-relaxed">
                Your order will be ready in {deliveryTime} at {deliveryAddress}.
              </p>
              <p className="text-xs mt-2 opacity-80">Payment method: {paymentMethod}</p>
            </div>
          </div>

          {/* Items and totals */}
          <div className="bg-white rounded-2xl p-4 shadow-md mb-4 max-h-64 overflow-y-auto">
            {items.length === 0 ? (
              <p className="text-center text-gray-500 text-sm">
                No items found for this order.
              </p>
            ) : (
              <div className="space-y-3">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-3 text-sm border-b border-gray-100 pb-2 last:border-b-0 last:pb-0"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate">
                        {item.product_name}
                      </p>
                      <p className="text-xs text-gray-500">
                        Qty: {item.quantity ?? 1}
                      </p>
                    </div>
                    <p className="font-semibold text-amber-700 text-sm">
                      {`₱${(((item.price || 0) * (item.quantity ?? 1))).toFixed(2)}`}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-md">
            <h2 className="font-bold text-gray-800 mb-3 text-base">Order Summary</h2>
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>{`₱${subtotal.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Tax (10%)</span>
                <span>{`₱${tax.toFixed(2)}`}</span>
              </div>
              <div className="border-t pt-2 mt-1 flex justify-between font-bold text-gray-900 text-base">
                <span>Total Paid</span>
                <span className="text-amber-700">{`₱${finalTotal.toFixed(2)}`}</span>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-100 flex flex-col items-center gap-2">
              <span className="text-xs text-gray-500">Scan this QR code for order details</span>
              <div className="bg-white p-2 rounded-lg shadow-sm">
                <QRCode value={qrValue} size={96} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Back to Home Button */}
      <button
        onClick={onBackHome}
        className="w-full max-w-md mx-auto bg-[#8B4513] text-white py-4 rounded-xl font-bold hover:bg-[#6B3410] transition-colors shadow-lg mt-6"
      >
        Back to Home
      </button>
    </div>
  );
};

export default Receipt;
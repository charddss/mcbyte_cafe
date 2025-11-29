import React from 'react';
import { ChevronLeft, Plus, Minus, Trash2 } from 'lucide-react';

const Cart = ({ items = [], onBack, onCheckout, onUpdateCart }) => {
  const updateQuantity = (id, change) => {
    const updatedItems = items.map(item =>
      item.id === id
        ? { ...item, quantity: Math.max(1, item.quantity + change) }
        : item
    );
    onUpdateCart(updatedItems);
  };

  const removeItem = (id) => {
    const updatedItems = items.filter(item => item.id !== id);
    onUpdateCart(updatedItems);
  };

  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.1;
  const total = subtotal + tax;

  const discount = subtotal * 0.2; // 20% discount
  const finalTotal = total - discount;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50/50 to-orange-50 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-yellow-400 via-orange-400 to-orange-500 px-6 pt-8 pb-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <button 
            onClick={onBack} 
            className="text-white hover:bg-white/20 p-2 rounded-xl transition-all duration-200"
          >
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-2xl font-bold text-white drop-shadow-lg">My Cart</h1>
          <div className="w-10"></div>
        </div>
      </div>

      {/* Cart Items */}
      <div className="px-6 space-y-3 mb-4 mt-6">
        {items.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center shadow-xl">
            <div className="text-6xl mb-4">🛒</div>
            <p className="text-gray-500 text-lg font-semibold">Your cart is empty</p>
            <p className="text-gray-400 text-sm mt-2">Add some delicious coffee to get started!</p>
          </div>
        ) : (
          items.map((item) => (
            <div key={item.id} className="bg-white rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all duration-200 border border-gray-100">
              <div className="flex items-center gap-4">
                {/* Product Image */}
                <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-yellow-100 rounded-xl overflow-hidden flex-shrink-0 shadow-md">
                  <img 
                    src={item.image} 
                    alt={item.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.parentElement.innerHTML = '<span style="font-size: 32px; display: flex; align-items: center; justify-content: center; height: 100%;">☕</span>';
                    }}
                  />
                </div>
                
                {/* Product Info */}
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 mb-1">{item.name}</h3>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    {item.size && <span>Size: {item.size}</span>}
                    {item.ice && <span>• Ice: {item.ice}</span>}
                  </div>
                  <p className="text-orange-600 font-bold mt-1">₱{item.price.toLocaleString('en-US')}</p>
                </div>
                
                {/* Quantity Controls */}
                <div className="flex flex-col items-end gap-2">
                  <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-2 py-1.5 border border-gray-200">
                    <button
                      onClick={() => updateQuantity(item.id, -1)}
                      className="text-gray-600 hover:text-orange-600 transition-colors"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="font-bold w-6 text-center text-gray-800">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, 1)}
                      className="text-gray-600 hover:text-orange-600 transition-colors"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded transition-all"
                    title="Remove item"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Discount Banner */}
      {items.length > 0 && (
        <div className="px-6 mb-4">
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl p-4 flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🎉</span>
              <span className="text-white font-semibold">20% Discount Applied!</span>
            </div>
            <ChevronLeft size={20} className="text-white rotate-180" />
          </div>
        </div>
      )}

      {/* Summary Section */}
      {items.length > 0 && (
        <div className="px-6 pb-6">
          <div className="bg-white rounded-3xl p-6 shadow-2xl border-2 border-orange-100">
            <h2 className="font-bold text-xl mb-5 text-gray-800 flex items-center gap-2">
              <span className="w-1 h-6 bg-gradient-to-b from-orange-500 to-yellow-500 rounded-full"></span>
              Payment Summary
            </h2>
            
            <div className="space-y-3 mb-5">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-semibold text-gray-800">₱ {subtotal.toLocaleString('en-US')}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tax (10%):</span>
                <span className="font-semibold text-gray-800">₱ {tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Discount (20%):</span>
                <span className="font-semibold text-green-600">- ₱ {discount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Delivery Fee:</span>
                <span className="font-semibold text-green-600">FREE</span>
              </div>
              <div className="border-t-2 border-gray-200 pt-3 flex justify-between">
                <span className="font-bold text-gray-800">Total Payment:</span>
                <span className="font-bold text-2xl text-orange-600">
                  ₱ {finalTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            <button 
              onClick={onCheckout}
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-4 rounded-xl font-bold hover:from-orange-600 hover:to-orange-700 transition-all duration-200 shadow-xl hover:shadow-2xl transform hover:scale-105"
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
import React, { useState } from 'react';
import { ChevronLeft, Plus, Minus } from 'lucide-react';

const Order = ({ product, onBack, onAddToCart }) => {
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('Regular');
  const [selectedIce, setSelectedIce] = useState('Normal');
  const [selectedSugar, setSelectedSugar] = useState('Normal');
  
  const sizeOptions = [
    { label: 'Venti', value: 'Venti', extra: 30 },
    { label: 'Grande', value: 'Grande', extra: 20 },
    { label: 'Regular', value: 'Regular', extra: 0 }
  ];
  
  // Price is already in peso
  const basePrice = product?.price || 250;
  
  // Get selected size extra cost
  const selectedSizeOption = sizeOptions.find(opt => opt.value === selectedSize);
  const sizeExtra = selectedSizeOption?.extra || 0;
  
  // Calculate total price per item
  const pricePerItem = basePrice + sizeExtra;
  const totalPrice = pricePerItem * quantity;

  const iceOptions = [
    { label: 'Less', value: 'Less' },
    { label: 'Normal', value: 'Normal' },
    { label: 'Regular', value: 'Regular' }
  ];

  const sugarOptions = [
    { label: 'Less', value: 'Less' },
    { label: 'Normal', value: 'Normal' }
  ];

  const handleQuantityChange = (change) => {
    setQuantity(Math.max(1, quantity + change));
  };

  const handleAddToCart = () => {
    const orderItem = {
      id: Date.now(),
      name: product?.name || 'Cappuccino',
      description: product?.description || 'Ice americano + fresh milk',
      price: pricePerItem, // Price per item including size extra
      quantity,
      size: selectedSize,
      ice: selectedIce,
      sugar: selectedSugar,
      image: product?.image || ''
    };
    onAddToCart(orderItem);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50/20 to-yellow-50/20 pb-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-yellow-400 via-orange-400 to-orange-500 rounded-b-3xl px-6 pt-8 pb-16 shadow-xl relative overflow-hidden">
        <div className="absolute inset-0 bg-black/5"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-yellow-300/20 rounded-full blur-2xl"></div>
        <div className="relative">
          <button 
            onClick={onBack} 
            className="text-white hover:bg-white/20 p-2 rounded-xl transition-all duration-200 hover:scale-110 mb-6 shadow-lg"
          >
            <ChevronLeft size={24} />
          </button>
          
          {/* Coffee Image Card */}
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-yellow-300 via-orange-300 to-yellow-300 rounded-3xl blur opacity-75 animate-pulse"></div>
            <div className="relative bg-white rounded-3xl p-2 shadow-2xl">
              <div className="relative overflow-hidden rounded-2xl">
                <img 
                  src={product?.image || ""} 
                  alt={product?.name || "Cappuccino"}
                  className="w-full aspect-[4/3] object-cover hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg">
                  <span className="text-orange-600 font-bold text-sm">🔥 Hot Pick</span>
                </div>
                <div className="absolute bottom-3 left-3 right-3 flex gap-2">
                  <div className="bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5">
                    <span className="text-xs">☕</span>
                    <span className="text-xs font-semibold text-gray-700">Premium</span>
                  </div>
                  <div className="bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5">
                    <span className="text-xs">⚡</span>
                    <span className="text-xs font-semibold text-gray-700">Fresh</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Coffee Details */}
          <div className="flex justify-between items-start mb-4 relative z-10 mt-6">
            <div className="flex-1">
              <div className="inline-block bg-white/25 backdrop-blur-sm px-3 py-1 rounded-full mb-2">
                <h3 className="text-xs text-white font-bold uppercase tracking-wider">Specialty Coffee</h3>
              </div>
              <h1 className="text-4xl font-black text-white drop-shadow-2xl mb-1 leading-tight">{product?.name || 'Cappuccino'}</h1>
              <div className="flex items-center gap-2 mt-2">
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className={`${i < 4 ? 'text-yellow-300' : 'text-white/30'} text-sm drop-shadow-lg`}>★</span>
                  ))}
                </div>
                <span className="text-white/90 text-sm font-medium">4.5/5</span>
              </div>
            </div>
            <div className="text-right bg-gradient-to-br from-white/30 to-white/20 backdrop-blur-md px-5 py-3 rounded-2xl shadow-2xl border-2 border-white/40">
              <h3 className="text-xs text-white/90 mb-1 font-bold uppercase tracking-wide">Starting at</h3>
              <h1 className="text-3xl font-black text-white drop-shadow-lg">₱{basePrice.toLocaleString('en-US')}</h1>
            </div>
          </div>

          <p className="text-white/95 text-base mb-4 leading-relaxed relative z-10 bg-white/15 backdrop-blur-sm px-4 py-3 rounded-xl border border-white/20">{product?.description || 'Ice americano + fresh milk'}</p>
          
          {/* Features */}
          <div className="flex gap-3 relative z-10">
            <div className="flex-1 bg-gradient-to-br from-white/25 to-white/15 backdrop-blur-md p-3 rounded-xl border border-white/30 shadow-lg">
              <div className="text-2xl mb-1">🌟</div>
              <div className="text-white font-bold text-sm">Premium</div>
              <div className="text-white/80 text-xs">Quality Beans</div>
            </div>
            <div className="flex-1 bg-gradient-to-br from-white/25 to-white/15 backdrop-blur-md p-3 rounded-xl border border-white/30 shadow-lg">
              <div className="text-2xl mb-1">⚡</div>
              <div className="text-white font-bold text-sm">Quick</div>
              <div className="text-white/80 text-xs">5-10 mins</div>
            </div>
            <div className="flex-1 bg-gradient-to-br from-white/25 to-white/15 backdrop-blur-md p-3 rounded-xl border border-white/30 shadow-lg">
              <div className="text-2xl mb-1">💯</div>
              <div className="text-white font-bold text-sm">Fresh</div>
              <div className="text-white/80 text-xs">Made Daily</div>
            </div>
          </div>
        </div>
      </div>

      {/* Options Section */}
      <div className="px-6 mt-6 space-y-5">
        {/* Customize Section */}
        <div className="bg-white rounded-3xl p-5 shadow-xl border border-gray-100">
          <h3 className="text-xl font-bold mb-4 text-gray-800 flex items-center gap-2">
            <span className="w-1 h-6 bg-gradient-to-b from-orange-500 to-yellow-500 rounded-full"></span>
            Customize Your Order
          </h3>
          
          {/* Size Options */}
          <div className="mb-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-gray-700">Size</span>
              {selectedSizeOption?.extra > 0 && (
                <span className="text-xs text-orange-600 font-medium">+₱ {selectedSizeOption.extra.toLocaleString('en-US')}</span>
              )}
            </div>
            <div className="flex gap-3">
              {sizeOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSelectedSize(option.value)}
                  className={`flex-1 py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-200 transform ${
                    selectedSize === option.value
                      ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg scale-105'
                      : 'bg-gray-50 text-gray-700 border-2 border-gray-200 hover:border-orange-300 hover:bg-orange-50'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Ice Options */}
          <div className="mb-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-gray-700">Ice Level</span>
            </div>
            <div className="flex gap-3">
              {iceOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSelectedIce(option.value)}
                  className={`flex-1 py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-200 transform ${
                    selectedIce === option.value
                      ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg scale-105'
                      : 'bg-gray-50 text-gray-700 border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Sugar Options */}
          <div className="mb-2">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-gray-700">Sugar Level</span>
            </div>
            <div className="flex gap-3">
              {sugarOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSelectedSugar(option.value)}
                  className={`flex-1 py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-200 transform ${
                    selectedSugar === option.value
                      ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg scale-105'
                      : 'bg-gray-50 text-gray-700 border-2 border-gray-200 hover:border-pink-300 hover:bg-pink-50'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Quantity and Price */}
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-3xl p-5 shadow-2xl border-2 border-orange-100 flex items-center justify-between">
          <div>
            <span className="text-sm text-gray-500 block mb-1 font-medium">Total Amount</span>
            <span className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent">
              ₱ {totalPrice.toLocaleString('en-US')}
            </span>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 bg-gradient-to-r from-gray-100 to-gray-50 rounded-xl px-4 py-2.5 shadow-md border border-gray-200">
              <button 
                onClick={() => handleQuantityChange(-1)}
                className="text-gray-600 hover:text-gray-900 hover:scale-110 transition-transform p-1"
              >
                <Minus size={20} />
              </button>
              <span className="font-bold text-lg w-8 text-center text-gray-800">{quantity}</span>
              <button 
                onClick={() => handleQuantityChange(1)}
                className="text-gray-600 hover:text-gray-900 hover:scale-110 transition-transform p-1"
              >
                <Plus size={20} />
              </button>
            </div>
            
            <button 
              onClick={handleAddToCart}
              className="bg-gradient-to-r from-gray-900 to-gray-800 text-white px-8 py-3.5 rounded-xl font-bold hover:from-gray-800 hover:to-gray-700 transition-all duration-200 shadow-xl hover:shadow-2xl hover:scale-105 transform"
            >
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Order;
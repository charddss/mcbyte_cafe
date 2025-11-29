import React, { useState } from 'react';
import { ChevronLeft, Plus, Minus } from 'lucide-react';
import { supabase } from '../lib/supabaseclient';

const Order = ({ product, onBack, onAddToCart }) => {
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('Regular');
  const [selectedIce, setSelectedIce] = useState('Normal');
  const [selectedSugar, setSelectedSugar] = useState('Normal');
  const [isLoading, setIsLoading] = useState(false);
  const [specialRequest, setSpecialRequest] = useState('');

  const category = product?.category || '';
  const isDrink = category === 'Hot Drinks' || category === 'Cold Drinks';

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

  const handleAddToCart = async () => {
    setIsLoading(true);
    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        alert('Please log in to place an order');
        setIsLoading(false);
        return;
      }

      // Check if there's already a pending order
      let orderId;
      const { data: existingOrder, error: fetchError } = await supabase
        .from('orders')
        .select('id, total_price')
        .eq('user_id', user.id)
        .eq('status', 'pending')
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        // PGRST116 means no rows returned, which is fine
        throw fetchError;
      }

      if (existingOrder) {
        // Use existing pending order
        orderId = existingOrder.id;

        // Update the total price
        const newTotalPrice = existingOrder.total_price + totalPrice;
        const { error: updateError } = await supabase
          .from('orders')
          .update({ total_price: newTotalPrice })
          .eq('id', orderId);

        if (updateError) throw updateError;
      } else {
        // Create new order
        const { data: orderData, error: orderError } = await supabase
          .from('orders')
          .insert([{
            user_id: user.id,
            total_price: totalPrice,
            status: 'pending'
          }])
          .select()
          .single();

        if (orderError) throw orderError;
        orderId = orderData.id;
      }

      // Create order item and get inserted row
      const { data: insertedItems, error: itemError } = await supabase
        .from('order_items')
        .insert([{
          order_id: orderId,
          product_id: product?.id || null,
          product_name: product?.name || 'Cappuccino',
          product_description: product?.description || 'Ice americano + fresh milk',
          product_image: product?.image || '',
          quantity: quantity,
          price: pricePerItem,
          size: isDrink ? selectedSize : 'Regular',
          ice_level: isDrink ? selectedIce : null,
          sugar_level: isDrink ? selectedSugar : null,
          category: product?.category || null,
          special_request: !isDrink ? specialRequest : null
        }])
        .select();

      if (itemError) throw itemError;
      const insertedItem = Array.isArray(insertedItems) ? insertedItems[0] : insertedItems;

      // Dispatch custom event for cart update
      window.dispatchEvent(new Event('cartUpdated'));

      // Also call the original onAddToCart for local cart state
      if (onAddToCart && insertedItem) {
        onAddToCart(insertedItem);
      }

    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Failed to add item to cart. Please try again.');
    } finally {
      setIsLoading(false);
    }
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
      <div className="px-5 mt-4 space-y-4">
        {/* Customize Section */}
        <div className="bg-white rounded-2xl p-4 shadow border border-gray-200">
          <h3 className="text-xl font-bold mb-4 text-gray-800 flex items-center gap-2">
            <span className="w-1 h-6 bg-orange-500 rounded-full"></span>
            Customize Your Order
          </h3>

          {/* Size / Ice / Sugar for Drinks */}
          {isDrink && (
            <>
              {/* Size Options */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
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
                      className={`flex-1 py-2 px-3 rounded-lg text-sm font-semibold transition-colors duration-150 ${selectedSize === option.value
                        ? 'bg-orange-500 text-white border border-orange-500'
                        : 'bg-white text-gray-700 border border-gray-300 hover:border-orange-400 hover:bg-orange-50'
                        }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Ice Options */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-700">Ice Level</span>
                </div>
                <div className="flex gap-3">
                  {iceOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setSelectedIce(option.value)}
                      className={`flex-1 py-2 px-3 rounded-lg text-sm font-semibold transition-colors duration-150 ${selectedIce === option.value
                        ? 'bg-blue-500 text-white border border-blue-500'
                        : 'bg-white text-gray-700 border border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                        }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sugar Options */}
              <div className="mb-2">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-700">Sugar Level</span>
                </div>
                <div className="flex gap-3">
                  {sugarOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setSelectedSugar(option.value)}
                      className={`flex-1 py-2 px-3 rounded-lg text-sm font-semibold transition-colors duration-150 ${selectedSugar === option.value
                        ? 'bg-rose-500 text-white border border-rose-500'
                        : 'bg-white text-gray-700 border border-gray-300 hover:border-rose-400 hover:bg-rose-50'
                        }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Special instructions for Pastries / Meals */}
          {!isDrink && (
            <div className="mb-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-gray-700">
                  {category === 'Pastries' ? 'Pastry Instructions' : category === 'Meals' ? 'Meal Instructions' : 'Special Instructions'}
                </span>
              </div>
              <textarea
                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm text-gray-800 bg-white"
                rows={3}
                placeholder="Add your custom request (e.g. heat level, sauce on side, etc.)"
                value={specialRequest}
                onChange={(e) => setSpecialRequest(e.target.value)}
              />
            </div>
          )}
        </div>

        {/* Quantity and Price */}
        <div className="bg-white rounded-2xl px-3 py-2 shadow border border-gray-200 flex items-center justify-between gap-2">
          <div className="flex flex-col mr-2">
            <span className="text-xs text-gray-500 block mb-0.5 font-medium">Total Amount</span>
            <span className="text-2xl font-bold text-amber-900 whitespace-nowrap">
              ₱ {totalPrice.toLocaleString('en-US')}
            </span>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="inline-flex items-center gap-2 bg-gray-50 rounded-lg px-3 h-10 shadow-sm border border-gray-300">
              <button
                onClick={() => handleQuantityChange(-1)}
                className="text-gray-600 hover:text-gray-900 hover:scale-110 transition-transform p-1"
              >
                <Minus size={18} />
              </button>
              <span className="font-bold text-base w-7 text-center text-gray-800">{quantity}</span>
              <button
                onClick={() => handleQuantityChange(1)}
                className="text-gray-600 hover:text-gray-900 hover:scale-110 transition-transform p-1"
              >
                <Plus size={18} />
              </button>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={isLoading}
              className={`flex items-center justify-center h-10 bg-amber-800 text-white text-xs sm:text-sm px-3 sm:px-4 rounded-lg font-semibold transition-colors duration-150 shadow-sm ${isLoading
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:bg-amber-900'
                }`}
            >
              {isLoading ? 'Adding...' : 'Add to Cart'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Order;
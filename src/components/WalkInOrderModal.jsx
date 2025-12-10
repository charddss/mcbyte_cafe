import React, { useState } from 'react';
import { X, Plus, Minus } from 'lucide-react';

const WalkInOrderModal = ({ product, onClose, onAddToCart }) => {
    const [quantity, setQuantity] = useState(1);
    const [selectedSize, setSelectedSize] = useState('Regular');
    const [selectedIce, setSelectedIce] = useState('Normal');
    const [selectedSugar, setSelectedSugar] = useState('Normal');
    const [specialRequest, setSpecialRequest] = useState('');

    const category = product?.category || '';
    const isDrink = category === 'Hot Drinks' || category === 'Cold Drinks';

    const sizeOptions = [
        { label: 'Venti', value: 'Venti', extra: 30 },
        { label: 'Grande', value: 'Grande', extra: 20 },
        { label: 'Regular', value: 'Regular', extra: 0 }
    ];

    const basePrice = product?.price || 0;
    const selectedSizeOption = sizeOptions.find(opt => opt.value === selectedSize);
    const sizeExtra = selectedSizeOption?.extra || 0;
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
            ...product,
            quantity,
            size: isDrink ? selectedSize : 'Regular',
            ice_level: isDrink ? selectedIce : null,
            sugar_level: isDrink ? selectedSugar : null,
            special_request: !isDrink ? specialRequest : null,
            pricePerItem,
            totalPrice
        };
        onAddToCart(orderItem);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl">
                {/* Header */}
                <div className="sticky top-0 bg-gradient-to-br from-yellow-400 via-orange-400 to-orange-500 rounded-t-3xl px-6 py-6 relative overflow-hidden">
                    <div className="absolute inset-0 bg-black/10"></div>
                    <div className="relative flex items-start justify-between">
                        <div className="flex-1">
                            <h2 className="text-2xl font-bold text-white mb-1">{product?.name}</h2>
                            <p className="text-white/90 text-sm">{product?.description}</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-white hover:bg-white/20 p-2 rounded-xl transition-all"
                        >
                            <X size={24} />
                        </button>
                    </div>
                    <div className="relative mt-4 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl inline-block">
                        <span className="text-white font-bold text-lg">Base: ₱{basePrice.toLocaleString('en-US')}</span>
                    </div>
                </div>

                {/* Product Image */}
                <div className="px-6 pt-4">
                    <div className="w-full h-48 bg-gray-100 rounded-2xl overflow-hidden">
                        {product?.image ? (
                            <img
                                src={product.image}
                                alt={product.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center text-6xl">☕</div>';
                                }}
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-6xl">☕</div>
                        )}
                    </div>
                </div>

                {/* Customization Options */}
                <div className="px-6 py-4 space-y-4">
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <span className="w-1 h-5 bg-orange-500 rounded-full"></span>
                        Customize Order
                    </h3>

                    {isDrink && (
                        <>
                            {/* Size Options */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-semibold text-gray-700">Size</span>
                                    {selectedSizeOption?.extra > 0 && (
                                        <span className="text-xs text-orange-600 font-medium">+₱{selectedSizeOption.extra}</span>
                                    )}
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                    {sizeOptions.map((option) => (
                                        <button
                                            key={option.value}
                                            onClick={() => setSelectedSize(option.value)}
                                            className={`py-2 px-3 rounded-lg text-sm font-semibold transition-all ${selectedSize === option.value
                                                    ? 'bg-orange-500 text-white shadow-lg scale-105'
                                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                }`}
                                        >
                                            {option.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Ice Level */}
                            <div>
                                <span className="text-sm font-semibold text-gray-700 block mb-2">Ice Level</span>
                                <div className="grid grid-cols-3 gap-2">
                                    {iceOptions.map((option) => (
                                        <button
                                            key={option.value}
                                            onClick={() => setSelectedIce(option.value)}
                                            className={`py-2 px-3 rounded-lg text-sm font-semibold transition-all ${selectedIce === option.value
                                                    ? 'bg-blue-500 text-white shadow-lg scale-105'
                                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                }`}
                                        >
                                            {option.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Sugar Level */}
                            <div>
                                <span className="text-sm font-semibold text-gray-700 block mb-2">Sugar Level</span>
                                <div className="grid grid-cols-2 gap-2">
                                    {sugarOptions.map((option) => (
                                        <button
                                            key={option.value}
                                            onClick={() => setSelectedSugar(option.value)}
                                            className={`py-2 px-3 rounded-lg text-sm font-semibold transition-all ${selectedSugar === option.value
                                                    ? 'bg-rose-500 text-white shadow-lg scale-105'
                                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                }`}
                                        >
                                            {option.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}

                    {/* Special Instructions for non-drinks */}
                    {!isDrink && (
                        <div>
                            <span className="text-sm font-semibold text-gray-700 block mb-2">
                                {category === 'Pastries' ? 'Pastry Instructions' : category === 'Meals' ? 'Meal Instructions' : 'Special Instructions'}
                            </span>
                            <textarea
                                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm"
                                rows={3}
                                placeholder="Add custom request (e.g. heat level, sauce on side, etc.)"
                                value={specialRequest}
                                onChange={(e) => setSpecialRequest(e.target.value)}
                            />
                        </div>
                    )}
                </div>

                {/* Footer with Quantity and Add Button */}
                <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 rounded-b-3xl">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <span className="text-xs text-gray-500 block mb-1">Total Amount</span>
                            <span className="text-2xl font-bold text-orange-600">₱{totalPrice.toLocaleString('en-US')}</span>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2">
                                <button
                                    onClick={() => handleQuantityChange(-1)}
                                    className="text-gray-600 hover:text-gray-900 transition-all hover:scale-110"
                                >
                                    <Minus size={18} />
                                </button>
                                <span className="font-bold text-lg w-8 text-center">{quantity}</span>
                                <button
                                    onClick={() => handleQuantityChange(1)}
                                    className="text-gray-600 hover:text-gray-900 transition-all hover:scale-110"
                                >
                                    <Plus size={18} />
                                </button>
                            </div>

                            <button
                                onClick={handleAddToCart}
                                className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                            >
                                Place Order
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WalkInOrderModal;

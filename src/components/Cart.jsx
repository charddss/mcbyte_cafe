import React, { useState, useEffect } from 'react';
import { ChevronLeft, Trash2, Plus, Minus } from 'lucide-react';
import { supabase } from '../lib/supabaseclient';

const Cart = ({ items = [], onBack, onCheckout, onUpdateCart }) => {
    const [cartItems, setCartItems] = useState(items);
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState(null); // { message, type }

    useEffect(() => {
        setCartItems(items);
    }, [items]);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => {
            setToast(null);
        }, 2000);
    };

    const updateQuantity = async (targetItem, newQuantity) => {
        if (newQuantity < 1) return;

        try {
            setLoading(true);
            const { error } = await supabase
                .from('order_items')
                .update({ quantity: newQuantity })
                .eq('id', targetItem.id);

            if (error) throw error;

            // Update local and parent state in sync
            setCartItems(prev => {
                const updated = prev.map(item =>
                    item.id === targetItem.id
                        ? { ...item, quantity: newQuantity }
                        : item
                );
                if (onUpdateCart) onUpdateCart(updated);
                return updated;
            });
        } catch (error) {
            console.error('Error updating quantity:', error);
            alert('Failed to update quantity');
        } finally {
            setLoading(false);
        }
    };

    const removeItem = async (targetItem) => {
        try {
            setLoading(true);
            const orderId = targetItem.order_id;
            const { error } = await supabase
                .from('order_items')
                .delete()
                .eq('id', targetItem.id);

            if (error) throw error;

            // If this was the last item for the order, also delete the order itself
            if (orderId) {
                const remainingItemsForOrder = cartItems.filter(item =>
                    item.id !== targetItem.id && item.order_id === orderId
                );

                if (remainingItemsForOrder.length === 0) {
                    const { error: orderDeleteError } = await supabase
                        .from('orders')
                        .delete()
                        .eq('id', orderId);

                    if (orderDeleteError) {
                        console.error('Error deleting empty order:', orderDeleteError);
                    }
                }
            }

            // Update local and parent state in sync
            setCartItems(prev => {
                const updated = prev.filter(item => item.id !== targetItem.id);
                if (onUpdateCart) onUpdateCart(updated);
                return updated;
            });

            showToast('Item removed from cart', 'success');
        } catch (error) {
            console.error('Error removing item:', error);
            showToast('Failed to remove item', 'error');
        } finally {
            setLoading(false);
        }
    };

    const calculateSubtotal = () => {
        return cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    };

    const calculateTax = () => {
        return calculateSubtotal() * 0.1; // 10% tax
    };

    const calculateTotal = () => {
        return calculateSubtotal() + calculateTax();
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 relative">
            {/* Header */}
            <div className="bg-gradient-to-r from-amber-600 to-orange-600 text-white px-6 py-4 shadow-lg">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onBack}
                        className="p-2 hover:bg-white/20 rounded-full transition-all"
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <h1 className="text-2xl font-bold">My Cart</h1>
                </div>
            </div>

            {/* Cart Content */}
            <div className="p-6 pb-32">
                {cartItems.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="text-6xl mb-4">🛒</div>
                        <h2 className="text-2xl font-bold text-gray-700 mb-2">Your cart is empty</h2>
                        <p className="text-gray-500 mb-6">Add some delicious items to get started!</p>
                        <button
                            onClick={onBack}
                            className="bg-gradient-to-r from-amber-600 to-orange-600 text-white px-8 py-3 rounded-full font-semibold hover:shadow-lg transition-all"
                        >
                            Browse Menu
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Cart Items */}
                        <div className="space-y-3 mb-6">
                            {cartItems.map((item) => (
                                <div
                                    key={item.id}
                                    className="bg-white/95 border border-amber-100 rounded-2xl px-4 py-3 shadow-sm hover:shadow-md hover:border-amber-300 transition-all"
                                >
                                    <div className="flex gap-4 items-center">
                                        {/* Item Image */}
                                        <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
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
                                            <div className="flex items-start justify-between gap-2 mb-0.5">
                                                <h3 className="font-semibold text-gray-900 text-sm sm:text-base leading-snug break-words">
                                                    {item.product_name}
                                                </h3>
                                            </div>
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
                                                {item.category && item.category !== 'Hot Drinks' && item.category !== 'Cold Drinks' && item.special_request && (
                                                    <p className="line-clamp-2">Notes: {item.special_request}</p>
                                                )}
                                            </div>
                                            <p className="mt-2 text-sm font-semibold text-amber-700">
                                                ₱{item.price.toFixed(2)}
                                            </p>
                                        </div>

                                        {/* Quantity Controls */}
                                        <div className="flex flex-col items-end justify-between gap-3 self-stretch">
                                            <button
                                                onClick={() => removeItem(item)}
                                                disabled={loading}
                                                className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-full transition-colors disabled:opacity-50"
                                            >
                                                <Trash2 size={18} />
                                            </button>

                                            <div className="inline-flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-full px-3 py-1">
                                                <button
                                                    onClick={() => updateQuantity(item, item.quantity - 1)}
                                                    disabled={loading || item.quantity <= 1}
                                                    className="text-gray-500 hover:text-gray-800 disabled:opacity-40"
                                                >
                                                    <Minus size={14} />
                                                </button>
                                                <span className="font-semibold text-gray-900 text-sm w-6 text-center">
                                                    {item.quantity}
                                                </span>
                                                <button
                                                    onClick={() => updateQuantity(item, item.quantity + 1)}
                                                    disabled={loading}
                                                    className="text-amber-600 hover:text-amber-800 disabled:opacity-40"
                                                >
                                                    <Plus size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Price Summary */}
                        <div className="bg-white rounded-2xl p-6 shadow-md">
                            <h3 className="font-bold text-gray-800 mb-4 text-lg">Order Summary</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between text-gray-600">
                                    <span>Subtotal</span>
                                    <span>₱{calculateSubtotal().toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Tax (10%)</span>
                                    <span>₱{calculateTax().toFixed(2)}</span>
                                </div>
                                <div className="border-t pt-3 flex justify-between font-bold text-lg text-gray-800">
                                    <span>Total</span>
                                    <span className="text-amber-600">₱{calculateTotal().toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Checkout Button */}
            {cartItems.length > 0 && (
                <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-6 shadow-lg">
                    <button
                        onClick={onCheckout}
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-amber-600 to-orange-600 text-white py-4 rounded-full font-bold text-lg hover:shadow-xl transition-all disabled:opacity-50"
                    >
                        Proceed to Checkout
                    </button>
                </div>
            )}

            {toast && (
                <div className={`fixed bottom-24 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-full shadow-lg text-sm font-semibold text-white
                    ${toast.type === 'error' ? 'bg-red-600' : 'bg-emerald-600'}`}>
                    {toast.message}
                </div>
            )}
        </div>
    );
};

export default Cart;
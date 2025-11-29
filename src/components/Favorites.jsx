import React, { useState } from 'react';
import { ChevronLeft, Heart, Trash2 } from 'lucide-react';

const Favorites = ({ onBack, onOrder, favorites = [] }) => {
  // Sample favorite items - in real app, this would come from props or state
  const [favoriteItems, setFavoriteItems] = useState([
    { id: 1, name: 'Classic Cappuccino', price: 4.50, rating: 4.7, image: '', description: 'Rich espresso with steamed milk' },
    { id: 3, name: 'Caramel Cappuccino', price: 5.50, rating: 4.8, image: '', description: 'Smooth caramel delight' },
    { id: 5, name: 'Hazelnut Cappuccino', price: 5.25, rating: 4.7, image: '', description: 'Nutty and aromatic' },
  ]);

  const handleDeleteFavorite = (itemId) => {
    if (window.confirm('Remove this item from favorites?')) {
      setFavoriteItems(prevItems => prevItems.filter(item => item.id !== itemId));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50/30 to-yellow-50/30">
      {/* Header */}
      <div className="bg-gradient-to-br from-yellow-400 via-orange-400 to-orange-500 px-6 pt-8 pb-8 shadow-lg relative overflow-hidden">
        <div className="absolute inset-0 bg-black/5"></div>
        <div className="relative flex items-center justify-between mb-6">
          <button 
            onClick={onBack} 
            className="text-white hover:bg-white/20 p-2 rounded-xl transition-all duration-200 hover:scale-110"
          >
            <ChevronLeft size={24} />
          </button>
          <div className="flex items-center gap-3">
            <Heart size={28} className="text-white fill-white animate-pulse" />
            <h1 className="text-2xl font-bold text-white drop-shadow-lg">My Favorites</h1>
          </div>
          <div className="w-10"></div>
        </div>
      </div>

      {/* Favorites List */}
      <div className="px-6 py-6 -mt-4">
        {favoriteItems.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-12 text-center shadow-xl border border-white/50">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-red-100 to-pink-100 rounded-full mb-6">
              <Heart size={48} className="text-red-400" />
            </div>
            <p className="text-gray-700 text-xl font-semibold mb-2">No favorites yet</p>
            <p className="text-gray-500 text-sm">Start adding your favorite coffees!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {favoriteItems.map((item, index) => (
              <div 
                key={item.id} 
                className="group bg-white rounded-3xl p-5 shadow-lg hover:shadow-2xl transition-all duration-300 flex gap-4 relative overflow-hidden border border-white/50 hover:scale-[1.02]"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-orange-50/0 to-yellow-50/0 group-hover:from-orange-50/50 group-hover:to-yellow-50/50 transition-all duration-300 rounded-3xl"></div>
                
                <div 
                  className="relative w-20 h-20 bg-gradient-to-br from-orange-100 to-yellow-100 rounded-2xl overflow-hidden flex-shrink-0 cursor-pointer shadow-md group-hover:shadow-xl transition-all duration-300 group-hover:scale-105"
                  onClick={() => onOrder && onOrder(item)}
                >
                  <img 
                    src={item.image} 
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.parentElement.innerHTML = '<span style="font-size: 48px; display: flex; align-items: center; justify-content: center; height: 100%;">☕</span>';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>
                </div>
                <div 
                  className="flex-1 cursor-pointer relative z-10"
                  onClick={() => onOrder && onOrder(item)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-bold text-gray-900 text-xl mb-1 group-hover:text-orange-600 transition-colors">{item.name}</h3>
                      <p className="text-sm text-gray-500 leading-relaxed">{item.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="bg-red-50 p-2 rounded-full">
                        <Heart size={18} className="text-red-500 fill-red-500 animate-pulse" />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-2 bg-yellow-50 px-3 py-1.5 rounded-full">
                      <span className="text-yellow-500 text-lg">⭐</span>
                      <span className="text-sm font-bold text-gray-800">{item.rating}</span>
                    </div>
                    <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-2 rounded-xl shadow-md">
                      <span className="font-bold text-lg">
                        Rp {(item.price * 10000).toLocaleString('id-ID')}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteFavorite(item.id);
                  }}
                  className="absolute top-5 right-5 p-2.5 text-red-500 hover:bg-red-50 rounded-xl transition-all duration-200 hover:scale-110 hover:rotate-12 z-20 shadow-sm hover:shadow-md"
                  title="Remove from favorites"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Favorites;
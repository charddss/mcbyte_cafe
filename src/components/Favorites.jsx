import React, { useState, useEffect } from 'react';
import { ChevronLeft, Heart, ShoppingCart, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabaseclient';

const Favorites = ({ onBack, onOrder }) => {
  const [favorites, setFavorites] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      setIsLoading(true);
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        console.log('No user found');
        setFavorites([]);
        setIsLoading(false);
        return;
      }

      console.log('Fetching favorites for user:', user.id);

      // First, get user's favorites
      const { data: favoritesData, error: favoritesError } = await supabase
        .from('favorites')
        .select('id, product_id, created_at')
        .eq('user_id', user.id);

      if (favoritesError) {
        console.error('Error fetching favorites:', favoritesError);
        throw favoritesError;
      }

      console.log('Favorites data:', favoritesData);

      if (!favoritesData || favoritesData.length === 0) {
        setFavorites([]);
        setIsLoading(false);
        return;
      }

      // Get product IDs from favorites
      const productIds = favoritesData.map(fav => fav.product_id);

      // Fetch product details
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('id, name, description, price, category, image')
        .in('id', productIds);

      if (productsError) {
        console.error('Error fetching products:', productsError);
        throw productsError;
      }

      console.log('Products data:', productsData);

      // Combine favorites with product details
      const favoritesWithProducts = favoritesData.map(fav => {
        const product = productsData.find(p => p.id === fav.product_id);
        return {
          id: fav.id,
          product_id: fav.product_id,
          products: product || null
        };
      }).filter(fav => fav.products !== null); // Filter out any favorites where product was deleted

      console.log('Final favorites with products:', favoritesWithProducts);
      setFavorites(favoritesWithProducts);
    } catch (error) {
      console.error('Error fetching favorites:', error);
      alert('Error loading favorites: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const removeFavorite = async (favoriteId, productId) => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        alert('Please log in to manage favorites');
        return;
      }

      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', productId);

      if (error) throw error;

      // Update local state
      setFavorites(prev => prev.filter(fav => fav.id !== favoriteId));
    } catch (error) {
      console.error('Error removing favorite:', error);
      alert('Failed to remove favorite. Please try again.');
    }
  };

  const handleOrder = (product) => {
    if (onOrder) {
      onOrder(product);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50/50 to-orange-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-yellow-400 via-orange-400 to-orange-500 px-6 pt-5 pb-4 shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={onBack}
              className="text-white hover:bg-white/20 p-2 rounded-xl transition-all duration-200 hover:scale-110"
            >
              <ChevronLeft size={24} />
            </button>
            <div className="flex items-center gap-2">
              <Heart size={28} className="text-white fill-white" />
              <h1 className="text-2xl font-bold text-white drop-shadow-lg">My Favorites</h1>
            </div>
            <div className="w-10"></div>
          </div>
        </div>
      </div>

      {/* Favorites Grid */}
      <div className="px-6 py-6">
        {isLoading ? (
          <div className="bg-white rounded-3xl p-12 text-center shadow-2xl border-2 border-white/50">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-orange-400 to-orange-500 rounded-full mb-6 shadow-lg animate-pulse">
              <Heart size={48} className="text-white" />
            </div>
            <p className="text-gray-700 text-xl font-semibold">Loading favorites...</p>
          </div>
        ) : favorites.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center shadow-2xl border-2 border-white/50">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-orange-400 to-orange-500 rounded-full mb-6 shadow-lg">
              <Heart size={48} className="text-white" />
            </div>
            <p className="text-gray-700 text-xl font-semibold mb-2">No favorites yet</p>
            <p className="text-gray-500 text-sm">Start adding your favorite items!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {favorites.map((favorite) => {
              const product = favorite.products;
              return (
                <div
                  key={favorite.id}
                  className="bg-gradient-to-br from-amber-700 to-orange-800 rounded-3xl p-3 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 relative overflow-hidden"
                >
                  {/* Remove Favorite Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFavorite(favorite.id, product.id);
                    }}
                    className="absolute top-2 right-2 z-10 bg-white/90 hover:bg-white p-2 rounded-full transition-all duration-200 hover:scale-110 shadow-lg"
                    title="Remove from favorites"
                  >
                    <Trash2 size={16} className="text-red-500" />
                  </button>

                  {/* Rating Badge */}
                  <div className="flex items-center gap-1 mb-2 bg-black/30 px-2 py-1 rounded-lg w-fit">
                    <span className="text-sm">⭐</span>
                    <span className="text-white text-xs font-semibold">
                      {product.rating || 5.0}
                    </span>
                  </div>

                  {/* Product Image */}
                  <div className="bg-amber-900/50 rounded-2xl h-40 mb-3 flex items-center justify-center overflow-hidden">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.parentElement.innerHTML = '<span style="font-size: 48px;">☕</span>';
                        }}
                      />
                    ) : (
                      <span className="text-5xl">☕</span>
                    )}
                  </div>

                  {/* Product Info */}
                  {product.category && (
                    <span
                      className={`inline-block px-2 py-1 rounded-full text-[10px] font-semibold tracking-wider mb-1
                        ${product.category === 'Hot Drinks'
                          ? 'bg-red-100 text-red-700'
                          : product.category === 'Cold Drinks'
                          ? 'bg-blue-100 text-blue-700'
                          : product.category === 'Pastries'
                          ? 'bg-yellow-100 text-amber-800'
                          : product.category === 'Meals'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-700'
                        }
                      `}
                    >
                      {product.category}
                    </span>
                  )}
                  <h3 className="text-white font-bold text-sm mb-1 line-clamp-1">
                    {product.name}
                  </h3>
                  <p className="text-white/80 text-xs mb-3 line-clamp-2">
                    {product.description}
                  </p>

                  {/* Price and Order Button */}
                  <div className="flex items-center justify-between">
                    <span className="text-white font-bold text-lg">
                      ₱ {product.price ? parseFloat(product.price).toLocaleString('en-US') : '0.00'}
                    </span>
                    <button
                      onClick={() => handleOrder(product)}
                      className="bg-orange-500 hover:bg-orange-600 text-white p-2 rounded-xl transition-all duration-200 hover:scale-110 shadow-lg"
                      title="Order now"
                    >
                      <ShoppingCart size={18} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Favorites;

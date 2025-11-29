import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseclient';

const CoffeeShopScreen = ({ onOrder, onCart, onProfile, onHistory, onFavorites, onStaffDashboard, onAdminDashboard, cartItemsCount = 0 }) => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [favorites, setFavorites] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [menuItems, setMenuItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userName, setUserName] = useState('Coffee Lover');
  const [greeting, setGreeting] = useState('Good Day ');

  const categories = ['All', 'Hot Drinks', 'Cold Drinks', 'Pastries', 'Meals'];

  useEffect(() => {
    fetchProducts();
    fetchFavorites();
    fetchUserName();
    updateGreetingForPhilippines();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*');

      if (error) throw error;
      setMenuItems(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFavorites = async () => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) return;

      const { data, error } = await supabase
        .from('favorites')
        .select('product_id')
        .eq('user_id', user.id);

      if (error) throw error;

      // Extract product IDs from favorites
      const favoriteIds = data.map(fav => fav.product_id);
      setFavorites(favoriteIds);
    } catch (error) {
      console.error('Error fetching favorites:', error);
    }
  };

  const fetchUserName = async () => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) return;

      const { data, error } = await supabase
        .from('users')
        .select('full_name')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching user name:', error);
        setUserName(user.user_metadata?.full_name || user.email || 'Coffee Lover');
        return;
      }

      setUserName(data?.full_name || user.user_metadata?.full_name || user.email || 'Coffee Lover');
    } catch (error) {
      console.error('Unexpected error fetching user name:', error);
    }
  };

  const updateGreetingForPhilippines = () => {
    try {
      const hourString = new Intl.DateTimeFormat('en-PH', {
        hour: 'numeric',
        hour12: false,
        timeZone: 'Asia/Manila',
      }).format(new Date());

      const hour = parseInt(hourString, 10);
      let text = 'Good Day ';

      if (hour >= 5 && hour < 12) { 
        text = 'Good Morning ';
      } else if (hour >= 12 && hour < 18) {
        text = 'Good Afternoon ';
      } else {
        text = 'Good Evening ';
      }

      setGreeting(text);
    } catch (error) {
      console.error('Error computing greeting:', error);
      setGreeting('Good Day ');
    }
  };

  const toggleFavorite = async (id) => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        alert('Please log in to add favorites');
        return;
      }

      const isFavorite = favorites.includes(id);

      if (isFavorite) {
        // Remove from favorites
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('product_id', id);

        if (error) throw error;

        setFavorites(prev => prev.filter(fav => fav !== id));
      } else {
        // Add to favorites
        const { error } = await supabase
          .from('favorites')
          .insert([{
            user_id: user.id,
            product_id: id
          }]);

        if (error) throw error;

        setFavorites(prev => [...prev, id]);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      alert('Failed to update favorites. Please try again.');
    }
  };

  const styles = {
    container: {
      minHeight: '100vh',
      backgroundColor: '#fafafa',
      paddingBottom: '100px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    },
    header: {
      backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(/coffee1.jpg)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      borderBottomLeftRadius: '32px',
      borderBottomRightRadius: '32px',
      padding: '24px 24px 32px',
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      position: 'relative',
      overflow: 'hidden',
    },
    headerPattern: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      opacity: 0.05,
      backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
      backgroundSize: '20px 20px',
    },
    headerTop: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: '24px',
      position: 'relative',
      zIndex: 1,
    },
    iconButton: {
      background: 'rgba(255, 255, 255, 0.2)',
      backdropFilter: 'blur(10px)',
      border: 'none',
      color: 'white',
      cursor: 'pointer',
      padding: '10px',
      borderRadius: '12px',
      transition: 'all 0.3s',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    cartBadge: {
      position: 'absolute',
      top: '-5px',
      right: '-5px',
      backgroundColor: '#dc2626',
      color: 'white',
      borderRadius: '50%',
      width: '20px',
      height: '20px',
      fontSize: '11px',
      fontWeight: 'bold',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      border: '2px solid white',
    },
    welcomeSection: {
      position: 'relative',
      zIndex: 1,
      marginBottom: '20px',
    },
    welcomeText: {
      color: 'rgba(255, 255, 255, 0.9)',
      fontSize: '14px',
      marginBottom: '4px',
    },
    userName: {
      color: 'white',
      fontSize: '28px',
      fontWeight: 'bold',
      textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    },
    title: {
      fontSize: '24px',
      fontWeight: 'bold',
      color: 'white',
      marginBottom: '16px',
      position: 'relative',
      zIndex: 1,
    },
    categoriesContainer: {
      display: 'flex',
      gap: '12px',
      overflowX: 'auto',
      position: 'relative',
      zIndex: 1,
      paddingBottom: '4px',
      scrollbarWidth: 'none',
      msOverflowStyle: 'none',
    },
    categoryButton: {
      padding: '10px 24px',
      borderRadius: '20px',
      fontWeight: '700',
      border: 'none',
      cursor: 'pointer',
      transition: 'all 0.3s',
      whiteSpace: 'nowrap',
      fontSize: '14px',
      letterSpacing: '0.3px',
    },
    categoryActive: {
      backgroundColor: 'white',
      color: '#92400e',
      boxShadow: '0 6px 14px rgba(0, 0, 0, 0.18)',
      transform: 'translateY(-2px)',
    },
    categoryInactive: {
      backgroundColor: 'rgba(146, 64, 14, 0.7)',
      color: 'white',
      boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)',
    },
    searchBar: {
      margin: '24px 20px',
      position: 'relative',
    },
    searchInput: {
      width: '100%',
      padding: '16px 20px 16px 52px',
      borderRadius: '12px',
      border: '1px solid #e5e7eb',
      backgroundColor: 'white',
      fontSize: '14px',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
      outline: 'none',
      boxSizing: 'border-box',
      transition: 'all 0.2s ease',
    },
    searchIcon: {
      position: 'absolute',
      left: '20px',
      top: '50%',
      transform: 'translateY(-50%)',
      color: '#92400e',
    },
    grid: {
      padding: '0 20px 20px',
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '16px',
    },
    card: {
      background: 'white',
      borderRadius: '20px',
      padding: '10px',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.06)',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      cursor: 'pointer',
      position: 'relative',
      overflow: 'hidden',
      border: 'none',
    },
    imageContainer: {
      width: '100%',
      height: '140px',
      borderRadius: '16px',
      overflow: 'hidden',
      marginBottom: '12px',
      backgroundColor: '#f3f4f6',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
    },
    favoriteButton: {
      position: 'absolute',
      top: '8px',
      right: '8px',
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(10px)',
      border: 'none',
      borderRadius: '50%',
      width: '36px',
      height: '36px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      zIndex: 10,
    },
    coffeeImage: {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    },
    coffeeName: {
      color: '#111827',
      fontWeight: '800',
      marginBottom: '4px',
      fontSize: '16px',
      lineHeight: '1.2',
      letterSpacing: '-0.02em',
    },
    coffeeDescription: {
      color: '#9ca3af',
      fontSize: '11px',
      marginBottom: '8px',
      lineHeight: '1.4',
      display: '-webkit-box',
      WebkitLineClamp: 2,
      WebkitBoxOrient: 'vertical',
      overflow: 'hidden',
    },
    categoryBadge: {
      display: 'inline-block',
      padding: '4px 8px',
      borderRadius: '999px',
      fontSize: '10px',
      fontWeight: '700',
      letterSpacing: '0.4px',
      backgroundColor: '#f3f4f6',
      color: '#6b7280',
      marginBottom: '6px',
      textTransform: 'uppercase',
    },
    ratingContainer: {
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
      marginBottom: '12px',
    },
    rating: {
      color: '#fbbf24',
      fontSize: '14px',
    },
    ratingText: {
      color: '#6b7280',
      fontSize: '12px',
      fontWeight: '600',
    },
    priceContainer: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: 'auto',
      paddingTop: '4px',
    },
    price: {
      color: '#92400e',
      fontWeight: '900',
      fontSize: '20px',
      letterSpacing: '-0.03em',
    },
    addButton: {
      backgroundColor: '#92400e',
      color: 'white',
      border: 'none',
      borderRadius: '12px',
      padding: '12px',
      cursor: 'pointer',
      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
      boxShadow: '0 4px 12px rgba(146, 64, 14, 0.25)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    bottomNav: {
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: 'white',
      borderTop: '1px solid #f3f4f6',
      padding: '6px 16px 8px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-around',
      boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.05)',
      zIndex: 50,
    },
    navButton: {
      background: 'none',
      border: 'none',
      color: '#9ca3af',
      cursor: 'pointer',
      padding: '4px 8px',
      transition: 'all 0.2s ease',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '6px',
      borderRadius: '12px',
    },
    navButtonActive: {
      backgroundColor: '#92400e',
      color: 'white',
      padding: '6px 12px',
      borderRadius: '12px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      border: 'none',
      cursor: 'pointer',
      gap: '6px',
      boxShadow: '0 2px 8px rgba(146, 64, 14, 0.25)',
    },
    navLabel: {
      fontSize: '11px',
      fontWeight: '700',
      letterSpacing: '0.3px',
    },
  };

  const getFilteredItems = () => {
    if (!menuItems) return [];

    let items =
      activeCategory === 'All'
        ? [...menuItems]
        : menuItems.filter(item => item.category === activeCategory);

    if (searchQuery) {
      items = items.filter(item =>
        (item.name && item.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    return items;
  };

  const filteredItems = getFilteredItems();

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerPattern}></div>
        <div style={styles.headerTop}>
          <img
            src="/logo.png"
            alt="Logo"
            style={{
              width: '100px',
              height: '100px',
              objectFit: 'contain',
              marginTop: '-4px',
              marginLeft: '-4px',
            }}
          />

          <button
            style={{ ...styles.iconButton, position: 'relative' }}
            onClick={onCart}
          >
            <svg style={{ width: '24px', height: '24px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            {cartItemsCount > 0 && <div style={styles.cartBadge}>{cartItemsCount}</div>}
          </button>
        </div>

        <div style={styles.welcomeSection}>
          <div style={styles.userName}>
            <span style={{ fontSize: '18px' }}>{greeting}</span>
            <span style={{ fontSize: '18px', marginLeft: 6 }}>{userName}!</span>
          </div>
        </div>

        <h2 style={styles.title}>Categories</h2>

        <div style={styles.categoriesContainer}>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              style={{
                ...styles.categoryButton,
                ...(activeCategory === category ? styles.categoryActive : styles.categoryInactive),
              }}
            >
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                {category === 'All' && (
                  <span role="img" aria-label="all" style={{ fontSize: 16 }}>
                    ⭐
                  </span>
                )}
                {category === 'Hot Drinks' && (
                  <span role="img" aria-label="hot drink" style={{ fontSize: 16 }}>
                    ☕
                  </span>
                )}
                {category === 'Cold Drinks' && (
                  <span role="img" aria-label="cold drink" style={{ fontSize: 16 }}>
                    🧊
                  </span>
                )}
                {category === 'Pastries' && (
                  <span role="img" aria-label="pastry" style={{ fontSize: 16 }}>
                    🥐
                  </span>
                )}
                {category === 'Meals' && (
                  <span role="img" aria-label="meal" style={{ fontSize: 16 }}>
                    🍽️
                  </span>
                )}
                <span>{category}</span>
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Search Bar */}
      <div style={styles.searchBar}>
        <svg style={{ ...styles.searchIcon, width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="Search your favorite coffee..."
          style={styles.searchInput}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            style={{
              position: 'absolute',
              right: '20px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: '#e5e7eb',
              border: 'none',
              borderRadius: '50%',
              width: '24px',
              height: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#6b7280',
              fontSize: '18px',
              fontWeight: 'bold',
            }}
          >
            ×
          </button>
        )}
      </div>

      {/* Coffee Grid */}
      <div style={styles.grid}>
        {isLoading ? (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: '#9ca3af' }}>
            Loading menu...
          </div>
        ) : filteredItems.length === 0 ? (
          <div style={{
            gridColumn: '1 / -1',
            textAlign: 'center',
            padding: '40px 20px',
            color: '#9ca3af',
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
            <div style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
              No coffee found
            </div>
            <div style={{ fontSize: '14px' }}>
              Try searching for something else
            </div>
          </div>
        ) : (
          filteredItems.map((item) => (
            <div
              key={item.id}
              style={styles.card}
              onClick={() => onOrder(item)}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-8px)';
                e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.12)';
                const img = e.currentTarget.querySelector('img');
                if (img) {
                  img.style.transform = 'scale(1.08)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.06)';
                const img = e.currentTarget.querySelector('img');
                if (img) {
                  img.style.transform = 'scale(1)';
                }
              }}
            >
              <div style={styles.imageContainer}>
                <button
                  style={styles.favoriteButton}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(item.id);
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.15)';
                    e.currentTarget.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
                  }}
                >
                  {favorites.includes(item.id) ? '❤️' : '🤍'}
                </button>
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.name}
                    style={styles.coffeeImage}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      const parent = e.target.parentElement;
                      const emoji = document.createElement('span');
                      emoji.textContent = '☕';
                      emoji.style.fontSize = '64px';
                      parent.appendChild(emoji);
                    }}
                  />
                ) : (
                  <span style={{ fontSize: '64px' }}>☕</span>
                )}
              </div>

              {activeCategory === 'All' && (
                <span
                  style={{
                    ...styles.categoryBadge,
                    ...(item.category === 'Hot Drinks'
                      ? { backgroundColor: '#fee2e2', color: '#b91c1c' }
                      : item.category === 'Cold Drinks'
                      ? { backgroundColor: '#dbeafe', color: '#1d4ed8' }
                      : item.category === 'Pastries'
                      ? { backgroundColor: '#fef3c7', color: '#92400e' }
                      : item.category === 'Meals'
                      ? { backgroundColor: '#dcfce7', color: '#166534' }
                      : {}),
                  }}
                >
                  {item.category}
                </span>
              )}
              <h3 style={styles.coffeeName}>{item.name}</h3>
              <p style={styles.coffeeDescription}>{item.description}</p>

              <div style={styles.ratingContainer}>
                <span style={styles.rating}>⭐</span>
                <span style={styles.ratingText}>{item.rating || '4.5'}</span>
              </div>

              <div style={styles.priceContainer}>
                <span style={styles.price}>
                  ₱{item.price ? parseFloat(item.price).toLocaleString('en-US') : '0.00'}
                </span>
                <button
                  style={styles.addButton}
                  onClick={(e) => {
                    e.stopPropagation();
                    onOrder(item);
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#78350f';
                    e.currentTarget.style.transform = 'scale(1.1)';
                    e.currentTarget.style.boxShadow = '0 6px 16px rgba(146, 64, 14, 0.35)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#92400e';
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(146, 64, 14, 0.25)';
                  }}
                >
                  <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Bottom Navigation */}
      <div style={styles.bottomNav}>
        <button style={styles.navButtonActive}>
          <svg style={{ width: '24px', height: '24px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span style={styles.navLabel}>Home</span>
        </button>
        <button
          style={styles.navButton}
          onClick={onFavorites}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#f3f4f6';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <svg style={{ width: '24px', height: '24px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          <span style={styles.navLabel}>Favorites</span>
        </button>
        <button
          style={styles.navButton}
          onClick={onHistory}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#f3f4f6';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <svg style={{ width: '24px', height: '24px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span style={styles.navLabel}>Orders</span>
        </button>
        <button
          style={styles.navButton}
          onClick={onProfile}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#f3f4f6';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <svg style={{ width: '24px', height: '24px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span style={styles.navLabel}>Profile</span>
        </button>
      </div>
    </div>
  );
};

export default CoffeeShopScreen;
import React, { useState } from 'react';

const CoffeeShopScreen = ({ onOrder, onCart, onProfile, onHistory, onFavorites, onStaffDashboard, onAdminDashboard, cartItemsCount = 0 }) => {
  const [activeCategory, setActiveCategory] = useState('Hot Drinks');
  const [favorites, setFavorites] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showMenu, setShowMenu] = useState(false);

  const categories = ['Hot Drinks', 'Cold Drinks'];
  
  const coffeeItems = {
    'Hot Drinks': [
      { id: 1, name: 'Hot Americano', price: 250, rating: 4.7, image: '/hot americano.jpg', description: 'Rich espresso with steamed milk' },
      { id: 2, name: 'Hot Cappucino', price: 280, rating: 4.5, image: '/hot cappucino.jpg', description: 'Sweet vanilla flavor blend' },
      { id: 3, name: 'Hot Choco', price: 300, rating: 4.8, image: '/hot choco.jpg', description: 'Smooth caramel delight' },
      { id: 4, name: 'Hot Flat', price: 290, rating: 4.6, image: '/hot flat whtie.jpg', description: 'Chocolate infused coffee' },
      { id: 5, name: 'Hot Latter', price: 285, rating: 4.7, image: '/hot latte.jpg', description: 'Nutty and aromatic' },
      { id: 6, name: 'Hot Macha', price: 295, rating: 4.5, image: '/hot matcha.jpg', description: 'Warm spiced coffee' },
      { id: 7, name: 'Hot Salted Caramel', price: 310, rating: 4.6, image: '/hot salted caramel.jpg', description: 'Creamy white blend' },
      { id: 8, name: 'Hot Spanisg Latte', price: 300, rating: 4.8, image: '/hot spanish latte.jpg', description: 'Bold and intense' },
    ],
    'Cold Drinks': [
      { id: 11, name: 'Iced Americano', price: 240, rating: 4.7, image: '/iced americano.jpg', description: 'Bold and smooth' },
      { id: 12, name: 'Iced Caramel Latte', price: 290, rating: 4.5, image: '/iced caramel latte.png', description: 'Creamy milk coffee' },
      { id: 13, name: 'Iced Caramel Machiato', price: 295, rating: 4.8, image: '/iced caramel machiato.png', description: 'Velvety microfoam' },
      { id: 14, name: 'Iced Choco', price: 280, rating: 4.6, image: '/iced choco.jpg', description: 'Pure coffee shot' },
      { id: 15, name: 'Iced Latte', price: 285, rating: 4.7, image: '/iced latte.jpg', description: 'Chocolate coffee blend' },
      { id: 16, name: 'Iced Matcha', price: 300, rating: 4.9, image: '/iced matcha.jpg', description: 'Espresso with ice cream' },
      { id: 17, name: 'Iced Mocha', price: 295, rating: 4.8, image: '/iced mocha.png', description: 'Sweet caramel layers' },
      { id: 18, name: 'Iced Spanish Latte', price: 300, rating: 4.6, image: '/iced spanish latte.png', description: 'Vanilla perfection' },
    ],
  };
  
  const toggleFavorite = (id) => {
    setFavorites(prev => 
      prev.includes(id) ? prev.filter(fav => fav !== id) : [...prev, id]
    );
  };

  const styles = {
    container: {
      minHeight: '100vh',
      backgroundColor: '#f3f4f6',
      paddingBottom: '100px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    },
    header: {
      background: 'linear-gradient(135deg, #fbbf24 0%, #f97316 50%, #ea580c 100%)',
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
      opacity: 0.1,
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
    coffeeIconContainer: {
      backgroundColor: 'rgba(255, 255, 255, 0.25)',
      backdropFilter: 'blur(20px)',
      borderRadius: '50%',
      padding: '16px',
      fontSize: '36px',
      boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)',
      border: '2px solid rgba(255, 255, 255, 0.3)',
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
      margin: '20px 16px',
      position: 'relative',
    },
    searchInput: {
      width: '100%',
      padding: '14px 16px 14px 48px',
      borderRadius: '16px',
      border: 'none',
      backgroundColor: 'white',
      fontSize: '15px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.07)',
      outline: 'none',
      boxSizing: 'border-box',
    },
    searchIcon: {
      position: 'absolute',
      left: '16px',
      top: '50%',
      transform: 'translateY(-50%)',
      color: '#9ca3af',
    },
    grid: {
      padding: '0 16px 16px',
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '16px',
    },
    card: {
      background: 'linear-gradient(135deg, #b45309 0%, #92400e 100%)',
      borderRadius: '20px',
      padding: '12px',
      boxShadow: '0 8px 16px rgba(0, 0, 0, 0.15)',
      transition: 'all 0.3s',
      cursor: 'pointer',
      position: 'relative',
      overflow: 'hidden',
    },
    favoriteButton: {
      position: 'absolute',
      top: '8px',
      right: '8px',
      background: 'rgba(255, 255, 255, 0.9)',
      border: 'none',
      borderRadius: '50%',
      width: '32px',
      height: '32px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      zIndex: 2,
      transition: 'all 0.3s',
      fontSize: '16px',
    },
    rating: {
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
      marginBottom: '8px',
      backgroundColor: 'rgba(0, 0, 0, 0.3)',
      padding: '4px 8px',
      borderRadius: '8px',
      width: 'fit-content',
    },
    ratingText: {
      color: 'white',
      fontSize: '13px',
      fontWeight: '600',
    },
    imageContainer: {
      backgroundColor: 'rgba(146, 64, 14, 0.5)',
      borderRadius: '16px',
      height: '160px',
      marginBottom: '12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      position: 'relative',
      transition: 'all 0.3s ease',
    },
    coffeeImage: {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      transition: 'transform 0.3s ease',
    },
    coffeeName: {
      color: 'white',
      fontWeight: '700',
      marginBottom: '4px',
      fontSize: '15px',
      lineHeight: '1.3',
    },
    coffeeDescription: {
      color: 'rgba(255, 255, 255, 0.8)',
      fontSize: '11px',
      marginBottom: '12px',
      lineHeight: '1.4',
    },
    priceContainer: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: 'auto',
    },
    price: {
      color: 'white',
      fontWeight: 'bold',
      fontSize: '18px',
    },
    addButton: {
      backgroundColor: '#f97316',
      color: 'white',
      border: 'none',
      borderRadius: '12px',
      padding: '8px',
      cursor: 'pointer',
      transition: 'all 0.3s',
      boxShadow: '0 4px 8px rgba(249, 115, 22, 0.3)',
    },
    bottomNav: {
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: 'white',
      borderTop: '1px solid #e5e7eb',
      padding: '12px 24px 16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-around',
      boxShadow: '0 -4px 12px rgba(0, 0, 0, 0.1)',
      borderTopLeftRadius: '24px',
      borderTopRightRadius: '24px',
    },
    navButton: {
      background: 'none',
      border: 'none',
      color: '#9ca3af',
      cursor: 'pointer',
      padding: '8px',
      transition: 'all 0.3s',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '4px',
    },
    navButtonActive: {
      backgroundColor: '#fef3c7',
      color: '#f97316',
      padding: '12px 20px',
      borderRadius: '16px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      border: 'none',
      cursor: 'pointer',
      gap: '4px',
      boxShadow: '0 4px 8px rgba(249, 115, 22, 0.2)',
    },
    navLabel: {
      fontSize: '11px',
      fontWeight: '600',
    },
  };

  // Close menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (showMenu && !event.target.closest('[data-menu-container]')) {
        setShowMenu(false);
      }
    };
    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showMenu]);

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerPattern}></div>
        <div style={styles.headerTop}>
          <div style={{ position: 'relative' }} data-menu-container>
            <button 
              style={styles.iconButton}
              onClick={() => setShowMenu(!showMenu)}
            >
              <svg style={{ width: '24px', height: '24px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            {showMenu && (
              <div 
                data-menu-container
                style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                marginTop: '8px',
                backgroundColor: 'white',
                borderRadius: '16px',
                padding: '8px',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
                zIndex: 1000,
                minWidth: '200px',
                border: '1px solid rgba(0, 0, 0, 0.1)',
              }}>
                <button
                  onClick={() => {
                    setShowMenu(false);
                    if (onStaffDashboard) onStaffDashboard();
                  }}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    textAlign: 'left',
                    border: 'none',
                    background: 'none',
                    cursor: 'pointer',
                    borderRadius: '12px',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#374151',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#fef3c7';
                    e.currentTarget.style.color = '#f97316';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = '#374151';
                  }}
                >
                  <span>👨‍💼</span>
                  <span>Staff Dashboard</span>
                </button>
                
              </div>
            )}
          </div>
          <div style={styles.coffeeIconContainer}>☕</div>
          <button 
            style={{...styles.iconButton, position: 'relative'}}
            onClick={onCart}
          >
            <svg style={{ width: '24px', height: '24px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            {cartItemsCount > 0 && <div style={styles.cartBadge}>{cartItemsCount}</div>}
          </button>
        </div>

        <div style={styles.welcomeSection}>
          <div style={styles.welcomeText}>Good Morning ☀️</div>
          <div style={styles.userName}>Coffee Lover</div>
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
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Search Bar */}
      <div style={styles.searchBar}>
        <svg style={{...styles.searchIcon, width: '20px', height: '20px'}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
              right: '16px',
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
        {(() => {
          // Get items based on active category
          let itemsToDisplay = coffeeItems[activeCategory] || [];

          // Filter based on search query
          const filteredItems = itemsToDisplay.filter(item => 
            item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.description.toLowerCase().includes(searchQuery.toLowerCase())
          );

          if (filteredItems.length === 0) {
            return (
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
            );
          }

          return filteredItems.map((item) => (
          <div 
            key={item.id} 
            style={styles.card}
            onClick={() => onOrder(item)}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-6px) scale(1.02)';
              e.currentTarget.style.boxShadow = '0 16px 32px rgba(0, 0, 0, 0.25)';
              // Add hover effect to image
              const img = e.currentTarget.querySelector('img');
              if (img) {
                img.style.transform = 'scale(1.1)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
              e.currentTarget.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.15)';
              // Reset image transform
              const img = e.currentTarget.querySelector('img');
              if (img) {
                img.style.transform = 'scale(1)';
              }
            }}
          >
            <button 
              style={styles.favoriteButton}
              onClick={(e) => {
                e.stopPropagation();
                toggleFavorite(item.id);
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.15)';
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
              }}
            >
              {favorites.includes(item.id) ? '❤️' : '🤍'}
            </button>

            <div style={styles.rating}>
              <span style={{ fontSize: '14px' }}>⭐</span>
              <span style={styles.ratingText}>{item.rating}</span>
            </div>

            <div 
              style={styles.imageContainer}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(146, 64, 14, 0.7)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(146, 64, 14, 0.5)';
              }}
            >
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
                    emoji.style.fontSize = '48px';
                    parent.appendChild(emoji);
                  }}
                />
              ) : (
                <span style={{ fontSize: '48px' }}>☕</span>
              )}
            </div>

            <h3 style={styles.coffeeName}>{item.name}</h3>
            <p style={styles.coffeeDescription}>{item.description}</p>

            <div style={styles.priceContainer}>
              <span style={styles.price}>₱ {item.price.toLocaleString('en-US')}</span>
              <button 
                style={styles.addButton}
                onClick={(e) => {
                  e.stopPropagation();
                  onOrder(item);
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#ea580c';
                  e.currentTarget.style.transform = 'scale(1.15) rotate(90deg)';
                  e.currentTarget.style.boxShadow = '0 6px 12px rgba(234, 88, 12, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#f97316';
                  e.currentTarget.style.transform = 'scale(1) rotate(0deg)';
                  e.currentTarget.style.boxShadow = '0 4px 8px rgba(249, 115, 22, 0.3)';
                }}
              >
                <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
          </div>
        ));
        })()}
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
        >
          <svg style={{ width: '24px', height: '24px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          <span style={styles.navLabel}>Favorites</span>
        </button>
        <button 
          style={styles.navButton}
          onClick={onHistory}
        >
          <svg style={{ width: '24px', height: '24px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span style={styles.navLabel}>Orders</span>
        </button>
        <button 
          style={styles.navButton}
          onClick={onProfile}
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
import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const CardContext = createContext();

export const useCart = () => {
  const context = useContext(CardContext);
  if (!context) {
    throw new Error('useCart must be used within CardProvider');
  }
  return context;
};

export const CardProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Load cart from localStorage
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCartItems(JSON.parse(savedCart));
    }
  }, []);

  useEffect(() => {
    // Save cart to localStorage
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = async (product, quantity = 1) => {
    const existingItem = cartItems.find(item => item._id === product._id);
    
    if (quantity > product.stock) {
      setError('Out of Stock');
      setTimeout(() => setError(''), 3000);
      return;
    }
    
    if (existingItem) {
      if (existingItem.quantity + quantity > product.stock) {
        setError('Out of Stock');
        setTimeout(() => setError(''), 3000);
        return;
      }
      const updatedCart = cartItems.map(item =>
        item._id === product._id
          ? { ...item, quantity: existingItem.quantity + quantity }
          : item
      );
      setCartItems(updatedCart);
    } else {
      setCartItems([...cartItems, { ...product, quantity }]);
    }
  };

  const removeFromCart = (productId) => {
    const updatedCart = cartItems.filter(item => item._id !== productId);
    setCartItems(updatedCart);
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    const item = cartItems.find(item => item._id === productId);
    if (quantity > item.stock) {
      setError('Out of Stock');
      setTimeout(() => setError(''), 3000);
      return;
    }
    
    const updatedCart = cartItems.map(item =>
      item._id === productId ? { ...item, quantity } : item
    );
    setCartItems(updatedCart);
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const cartItemCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  const value = {
    cartItems,
    cartItemCount,
    isCartOpen,
    setIsCartOpen,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalPrice,
    error
  };

  return (
    <CardContext.Provider value={value}>
      {children}
    </CardContext.Provider>
  );
};


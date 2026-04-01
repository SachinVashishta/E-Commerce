import React, { useState } from 'react';
import axios from 'axios';
import { useCart } from '../context/CardContext';
import { useAuth } from '../context/AuthContext';

const PaymentModal = ({ isOpen, onClose }) => {
  const [loading, setLoading] = useState(false);
  const { cartItems, clearCart, getTotalPrice } = useCart();
  const { user } = useAuth();

const API_URL = import.meta.env.VITE_API_URL;

  const handlePayment = async () => {
    setLoading(true);
    try {
      // Fake Razorpay delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Save order
      const orderData = {
        items: cartItems.map(item => ({
          title: item.title,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
          _id: item._id
        })),
        total: getTotalPrice()
      };
      
      await axios.post(`${API_URL}/orders`, orderData);
      
      alert('🎉 Payment Successful! Order placed.');
      clearCart();
      onClose();
    } catch (error) {
      alert('Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };


  if (!isOpen) return null;

  return (
    <div className="payment-modal-overlay" style={{
      position: 'fixed', 
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.8)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    }}>
      <div style={{
        background: 'white',
        padding: '2rem',
        borderRadius: '15px',
        maxWidth: '400px',
        textAlign: 'center',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
      }}>
        <h2>💳 Secure Payment</h2>
Total: <strong>₹{getTotalPrice().toFixed(2)}</strong>
        <div style={{ margin: '1rem 0' }}>
          <div style={{ fontSize: '2rem', margin: '1rem 0' }}>🔒</div>
          <p>Razorpay - Safe & Secure</p>
        </div>
        {loading ? (
          <div style={{ color: '#667eea' }}>Processing payment...</div>
        ) : (
          <>
            <button 
              onClick={handlePayment}
              style={{ 
                padding: '1rem 2rem', 
                background: '#28a745', 
                color: 'white', 
                border: 'none', 
                borderRadius: '25px',
                fontSize: '1.1rem',
                cursor: 'pointer'
              }}
            >
              Confirm & Pay
            </button>
            <button 
              onClick={onClose}
              style={{ 
                padding: '1rem 2rem', 
                background: '#6c757d', 
                color: 'white', 
                border: 'none', 
                borderRadius: '25px',
                marginLeft: '1rem',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default PaymentModal;


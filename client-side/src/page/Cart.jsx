import React, { useState } from 'react';
import { useCart } from '../context/CardContext';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import PaymentModal from '../components/PaymentModal';
import './Cart.css';

const Cart = () => {
const { cartItems, removeFromCart, updateQuantity, getTotalPrice, clearCart, error: cartError } = useCart();
  const { user } = useAuth();
  const [showPaymentModal, setShowPaymentModal] = useState(false);


  if (cartItems.length === 0) {
    return (
      <div className="cart-empty">
        <h2>Your Cart is Empty</h2>
        <Link to="/">Continue Shopping</Link>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <h1>Shopping Cart</h1>
      <div className="cart-items">
        {cartItems.map(item => (
          <div key={item._id} className="cart-item">
            <img src={item.image} alt={item.name} />
            <div className="item-details">
              <h3>{item.name}</h3>
<p>₹{item.price}</p>
<div className="quantity-control">
                <button onClick={() => updateQuantity(item._id, item.quantity - 1)}>-</button>
                <span>{item.quantity}/{item.stock}</span>
                <button onClick={() => updateQuantity(item._id, item.quantity + 1)} disabled={item.quantity + 1 > item.stock}>+</button>
              </div>
              {cartError && <p className="cart-error" style={{color: 'red'}}>{cartError}</p>}
<div className="item-total">
                ₹{(item.price * item.quantity).toFixed(2)}
              </div>
              <button className="remove-btn" onClick={() => removeFromCart(item._id)}>
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="cart-summary">
        <h3>Total: ₹{getTotalPrice().toFixed(2)}</h3>
        <div className="cart-actions">
          <button className="clear-cart" onClick={clearCart}>Clear Cart</button>
          <button 
            className="checkout-btn" 
            onClick={() => setShowPaymentModal(true)}
            disabled={!user}
          >
            💳 Pay Now - Secure Checkout
          </button>
        </div>
      </div>
      <PaymentModal 
        isOpen={showPaymentModal} 
        onClose={() => setShowPaymentModal(false)} 
      />
    </div>
  );
};



export default Cart;

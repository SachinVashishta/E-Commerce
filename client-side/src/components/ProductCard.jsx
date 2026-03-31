import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CardContext';
import './ProductCard.css';

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const handleAddToCart = async (e) => {
    e.stopPropagation();
    await addToCart(product);
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Electronics': '#FF9900',
      'Clothing': '#00A651',
      'Books': '#FF8F00',
      'default': '#232F3E'
    };
    return colors[category] || colors.default;
  };

  const rating = Math.round(product.rating || 4.5);
  const savings = product.originalPrice ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;

  return (
    <div className="amazon-product-card" onClick={() => navigate(`/product/${product._id}`)}>
      <div className="card-image-section">
        <img src={product.image} alt={product.title} className="card-main-image" />
        {product.stock === 0 && (
          <div className="stock-overlay">Out of Stock</div>
        )}
        <div className="wishlist-heart">♥</div>
      </div>
      
      <div className="card-badge" style={{backgroundColor: getCategoryColor(product.category || 'default')}}>
        {product.category || 'Shop'}
      </div>

      <div className="card-title">
        {product.title}
      </div>

      <div className="card-rating">
        {[...Array(5)].map((_, i) => (
          <span key={i} className={i < rating ? 'star filled' : 'star'}>
            ★
          </span>
        ))}
        <span className="rating-count">({rating})</span>
      </div>

      <div className="card-price-row">
        <span className="deal-price">₹{product.price.toFixed(0)}</span>
        {product.originalPrice && (
          <span className="mrp-price">₹{product.originalPrice.toFixed(0)}</span>
        )}
        {savings > 0 && <span className="savings-badge">{savings}% off</span>}
      </div>

      <div className="card-actions">
        {product.stock > 0 ? (
          <button className="add-cart-btn" onClick={handleAddToCart}>
            Add to Cart
          </button>
        ) : (
          <button className="out-of-stock-btn" disabled>
            Out of Stock
          </button>
        )}
      </div>
    </div>
  );
};

export default ProductCard;


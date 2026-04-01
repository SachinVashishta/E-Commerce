import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CardContext';
import axios from 'axios';
import './ProductDetails.css';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, error: cartError } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [successMsg, setSuccessMsg] = useState('');
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/products/${id}`);
        setProduct(res.data);
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);


  const handleAddToCart = async () => {
    if (product && quantity > 0) {
      await addToCart(product, quantity);
      if (!cartError) {
        setSuccessMsg(`${product.title} (${quantity}) added to cart!`);
        setTimeout(() => setSuccessMsg(''), 3000);
      }
    }
  };

  const rating = Math.round(product?.rating || 4.5);
  const reviewsCount = 128; // hardcoded for demo
  const savings = product?.originalPrice ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;

  if (loading) return <div className="loading amazon-loading">Loading product details...</div>;
  if (!product) return <div className="amazon-not-found">Product not found</div>;

  return (
    <div className="amazon-product-detail">
      <button className="back-btn amazon-back-btn" onClick={() => navigate('/')}>
        ← Back to Products
      </button>
      
      <div className="product-hero">
        <div className="image-gallery">
          <img src={product.image} alt={product.title} className="main-image" />
          <div className="thumbs-container">
            {[0,1,2,3].map((i) => (
              <img key={i} src={product.image} alt={`${product.title} thumb ${i+1}`} className="thumb-image" />
            ))}
          </div>
        </div>
        <div className="product-info-section">
          <h1 className="product-title">{product.title}</h1>
          
          <div className="rating-section">
            <div className="stars">
              {[...Array(5)].map((_, i) => (
                <span key={i} className={i < rating ? 'star filled' : 'star'}>
                  ★
                </span>
              ))}
            </div>
            <span className="rating-text">{rating}</span>
            <span className="review-count">| {reviewsCount} reviews</span>
          </div>

          <div className="price-section">
            <span className="deal-price">₹{product.price.toFixed(0)}</span>
            {product.originalPrice && (
              <>
                <span className="mrp-price">₹{product.originalPrice.toFixed(0)}</span>
                <span className="savings">{savings}% off</span>
              </>
            )}
          </div>

          <div className="stock-info">
            {product.stock > 0 ? (
              <span className="stock-badge">In Stock ({product.stock})</span>
            ) : (
              <span className="stock-badge out-of-stock-badge">Out of Stock</span>
            )}
          </div>

          {cartError && <p className="stock-error" style={{color: 'red', fontWeight: 'bold', margin: '16px 0'}}>{cartError}</p>}
          {successMsg && <p className="success-msg" style={{color: 'green', fontWeight: 'bold', margin: '16px 0'}}>{successMsg}</p>}

          <div className="quantity-section">
            <label className="quantity-label">Quantity: 
              <input 
                type="number" 
                min="1" 
                max={product.stock || 1} 
                value={quantity} 
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="quantity-input"
              />
            </label>
            <button 
              className="add-to-cart-btn"
              onClick={handleAddToCart}
              disabled={product.stock === 0 || quantity > product.stock}
            >
              Add to Cart
            </button>
          </div>

          <p className="product-desc">
            {product.description}
          </p>

          <table className="product-details-table">
            <tbody>
              <tr>
                <th>Brand</th>
                <td>{product.brand || 'Generic'}</td>
              </tr>
              <tr>
                <th>Category</th>
                <td>{product.category}</td>
              </tr>
              <tr>
                <th>Stock</th>
                <td>{product.stock} units left</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;

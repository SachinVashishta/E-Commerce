import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CardContext';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import './ProductDetails.css';

const ProductDetail = () => {
  const {user}=useAuth()
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, error: cartError } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [successMsg, setSuccessMsg] = useState('');
  const [product, setProduct] = useState(null);
const [loading, setLoading] = useState(true);
  // Admin edit states
  const [editForm, setEditForm] = useState({});
  const [adminMsg, setAdminMsg] = useState('');
  const [isEditing, setIsEditing] = useState(false);


const API_URL = import.meta.env.VITE_API_URL;

// Load product data for admin form
useEffect(() => {
  if (product) {
    setEditForm({
      title: product.title,
      description: product.description,
      price: product.price,
      stock: product.stock
    });
  }
}, [product]);

// Fetch product
const fetchProduct = async () => {
  try {
    const res = await axios.get(`${API_URL}/products/${id}`);
    setProduct(res.data);
    setAdminMsg('');
  } catch (error) {
    console.error('Error fetching product:', error);
    setAdminMsg('Error loading product');
  } finally {
    setLoading(false);
  }
};

// Update handler (admin)
const handleUpdate = async () => {
  try {
    const res = await axios.put(`${API_URL}/products/${id}`, editForm);
    setProduct(res.data);
    setAdminMsg('✅ Product updated successfully!');
    setTimeout(() => setAdminMsg(''), 3000);
  } catch (error) {
    setAdminMsg('❌ Update failed: ' + (error.response?.data?.message || error.message));
  }
};

// Delete handler (admin)
const handleDelete = async () => {
  if (window.confirm('Are you sure you want to delete this product?')) {
    try {
      await axios.delete(`${API_URL}/products/${id}`);
      setAdminMsg('🗑️ Product deleted!');
      setTimeout(() => navigate('/'), 1500);
    } catch (error) {
      setAdminMsg('❌ Delete failed: ' + (error.response?.data?.message || error.message));
    }
  }
};

  useEffect(() => {
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
  const reviewsCount = 128; 
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

          {/* Admin Controls - Edit toggle */}
          {user?.role === 'admin' && (
            <div className="admin-section" style={{marginTop: '20px', padding: '20px', border: '1px solid #ddd', borderRadius: '8px', background: '#f9f9f9'}}>
              {!isEditing ? (
                <button 
                  style={{width: '100%', padding: '12px', background: '#007bff', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold'}}
                  onClick={() => setIsEditing(true)}
                >
                  ✏️ Edit Product
                </button>
              ) : (
                <div>
                  <h3 style={{color: '#667eea', marginBottom: '15px'}}>Edit Product</h3>
                  
                  {/* Edit form - editable fields */}
                  <div style={{marginBottom: '15px'}}>
                    <input
                      style={{width: '100%', padding: '8px', marginBottom: '10px', border: '1px solid #ccc', borderRadius: '4px'}}
                      placeholder="Title"
                      value={editForm.title || ''}
                      onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                    />
                    <textarea
                      style={{width: '100%', padding: '8px', marginBottom: '10px', border: '1px solid #ccc', borderRadius: '4px', resize: 'vertical'}}
                      placeholder="Description"
                      value={editForm.description || ''}
                      onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                      rows="3"
                    />
                    <div style={{display: 'flex', gap: '10px'}}>
                      <input
                        style={{flex: 1, padding: '8px', border: '1px solid #ccc', borderRadius: '4px'}}
                        type="number"
                        placeholder="Price"
                        value={editForm.price || ''}
                        onChange={(e) => setEditForm({...editForm, price: parseFloat(e.target.value) || 0})}
                      />
                      <input
                        style={{flex: 1, padding: '8px', border: '1px solid #ccc', borderRadius: '4px'}}
                        type="number"
                        placeholder="Stock"
                        value={editForm.stock || ''}
                        onChange={(e) => setEditForm({...editForm, stock: parseInt(e.target.value) || 0})}
                      />
                      <input
                        style={{flex: 1, padding: '8px', border: '1px solid #ccc', borderRadius: '4px'}}
                        type="url"
                        placeholder="Image URL"
                        value={editForm.image || product.image || ''}
                        onChange={(e) => setEditForm({...editForm, image: e.target.value})}
                      />
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div style={{display: 'flex', gap: '10px'}}>
                    <button 
                      style={{flex: 1, padding: '12px', background: '#28a745', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold'}}
                      onClick={handleUpdate}
                    >
                      💾 Update
                    </button>
                    <button 
                      style={{flex: 1, padding: '12px', background: '#dc3545', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold'}}
                      onClick={handleDelete}
                    >
                      🗑️ Delete
                    </button>
                    <button 
                      style={{flex: 1, padding: '12px', background: '#6c757d', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer'}}
                      onClick={() => setIsEditing(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {adminMsg && (
                <p style={{marginTop: '10px', padding: '10px', borderRadius: '4px', fontWeight: 'bold', textAlign: 'center'}}>
                  {adminMsg.includes('success') || adminMsg.includes('✅') || adminMsg.includes('🗑️') ? '✅ ' + adminMsg : '❌ ' + adminMsg}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};



export default ProductDetail;

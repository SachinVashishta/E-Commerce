import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import './AdminPanel.css';

const AdminPanel = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [queries, setQueries] = useState([]);
  const [newProduct, setNewProduct] = useState({
    title: '',
    brand: '',
    description: '',
    price: '',
    category: 'Electronics',
    image: '',
    stock: 10,
    featured: false
  });
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ message: '', type: '' });
  const categories = ['Electronics', 'Clothing', 'Books', 'Sports', 'Home'];

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchAdminData();
    }
  }, [user]);

  const fetchAdminData = async () => {
    try {
      const token = localStorage.getItem('token');
      const usersRes = await axios.get('http://localhost:5000/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const queriesRes = await axios.get('http://localhost:5000/api/admin/queries', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(usersRes.data);
      setQueries(queriesRes.data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewProduct({
      ...newProduct,
      [name]: type === 'checkbox' ? checked : value
    });
    if (name === 'image' && value) {
      setImagePreview(value);
    }
  };

  const showToast = (message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: '', type: '' }), 4000);
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    setLoading(true);
    const productData = {
      ...newProduct,
      price: parseFloat(newProduct.price) || 0,
      stock: parseInt(newProduct.stock) || 10
    };
    try {
      await axios.post('http://localhost:5000/api/products', productData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      showToast('✅ Product added successfully!', 'success');
      setNewProduct({
        title: '',
        brand: '',
        description: '',
        price: '',
        category: 'Electronics',
        image: '',
        stock: 10,
        featured: false
      });
      setImagePreview('');
      fetchAdminData();
    } catch (error) {
      showToast(`❌ Error: ${error.response?.data?.message || 'Failed to add product'}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  if (user?.role !== 'admin') {
    return (
      <div className="pro-admin-panel">
        <div className="admin-header">
          <h1>🚫 Admin Access Required</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="pro-admin-panel">
      <div className="admin-header">
        <h1>⚙️ Admin Dashboard</h1>
      </div>

      {/* Pro Add Product Form */}
      <div className="pro-add-product-form">
        <h2 style={{ fontSize: '1.8rem', marginBottom: '2rem', color: '#333' }}>➕ Add New Product</h2>
        <form onSubmit={handleAddProduct} className="form-sections">
          <div className="form-section">
            <div className="section-title">📝 Basic Information</div>
            <div className="form-group">
              <label className="form-label">Product Title *</label>
<input className="form-input" name="title" value={newProduct.title} onChange={handleInputChange} placeholder="Enter product title (e.g. iPhone 15 Pro)" required />
            </div>
            <div className="form-group">
              
<input className="form-input" name="brand" value={newProduct.brand} onChange={handleInputChange} placeholder="Enter brand name (e.g. Apple)" />
            </div>
            <div className="form-group">
              
              <select className="form-select" name="category" value={newProduct.category} onChange={handleInputChange} required>
                <option value="">Select Category</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div className="form-checkbox-group">
              <input type="checkbox" id="featured" name="featured" checked={newProduct.featured} onChange={handleInputChange} className="form-checkbox" />
              <label htmlFor="featured" style={{ cursor: 'pointer', fontWeight: 500 }}>⭐ Make Featured Product</label>
            </div>
          </div>

          <div className="form-section">
            <div className="section-title">💰 Pricing</div>
            <div className="form-group">
              
<input className="form-input" name="price" type="number" step="0.01" value={newProduct.price} onChange={handleInputChange} placeholder="999.99" required />
            </div>
            <div className="form-group">
              <label className="form-label">Stock Quantity *</label>
<input className="form-input" name="stock" type="number" value={newProduct.stock} onChange={handleInputChange} placeholder="Enter stock quantity (e.g. 50)" required />
            </div>
          </div>

          <div className="form-section">
            <div className="section-title">📄 Description</div>
            <div className="form-group">
             
              <textarea className="form-textarea" name="description" value={newProduct.description} onChange={handleInputChange} placeholder="Describe the product features..." required />
            </div>
            <div className="form-group">
              <label className="form-label">Image URL *</label>
              <input className="form-input" name="image" value={newProduct.image} onChange={handleInputChange} placeholder="https://example.com/image.jpg" required />
              {imagePreview && (
                <img src={imagePreview} alt="Preview" className="image-preview" />
              )}
            </div>
          </div>
        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? '⏳ Adding...' : '🚀 Launch Product'}
        </button>
        </form>
      </div>

      {toast.message && (
        <div className={`toast ${toast.type}-toast`}>
          {toast.message}
        </div>
      )}

      {/* Users */}
      <div className="pro-users-section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h2>👥 Users ({users.length})</h2>
        </div>
        <div style={{ display: 'grid', gap: '1rem' }}>
          {users.map(u => (
            <div key={u._id} className="user-item">
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '50px', height: '50px', background: '#667eea', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '1.2rem' }}>
                  {u.email[0].toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight: '600' }}>{u.email}</div>
                </div>
              </div>
              <span className={`status-badge ${u.role === 'admin' ? 'status-resolved' : 'status-pending'}`}>
                {u.role.toUpperCase()}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Queries */}
      <div className="pro-queries-section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h2>💬 Queries ({queries.length})</h2>
        </div>
        <div style={{ display: 'grid', gap: '1rem' }}>
          {queries.map(q => (
            <div key={q._id} className="query-item">
              <div>
                <strong>{q.email}:</strong> {q.message.substring(0, 100)}...
              </div>
              <span className={`status-badge ${q.status === 'resolved' ? 'status-resolved' : 'status-pending'}`}>
                {q.status.toUpperCase()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;


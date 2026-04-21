import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CardContext';
import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import Chat from '../components/Chat';

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

const API_URL = import.meta.env.VITE_API_URL;

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const ordersRes = await axios.get(`${API_URL}/api/orders/myorders`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setOrders(ordersRes.data);
      
      const profile = {
        email: user.email,
        role: user.role,
        joined: new Date(user.createdAt || Date.now()).toLocaleDateString(),
        orders: ordersRes.data.length,
        totalSpent: ordersRes.data.reduce((total, order) => total + order.total, 0)
      };
      setProfileData(profile);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };


  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!user) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h2>Please <Link to="/login">login</Link> to view profile</h2>
      </div>
    );
  }

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading profile...</div>;
  }

  return (
    <div className="profile-page" style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1>👤 My Profile</h1>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2>Account Information</h2>
        <button onClick={handleLogout} style={{ 
          padding: '0.75rem 1.5rem', 
          background: 'linear-gradient(135deg, #667eea, #764ba2)', 
          color: 'white', 
          border: 'none', 
          borderRadius: '10px', 
          fontWeight: '600',
          cursor: 'pointer'
        }}>
          🚪 Logout
        </button>
      </div>
      
      {/* Profile Info */}
      <div style={{ background: 'white', padding: '2rem', borderRadius: '15px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', marginBottom: '2rem' }}>
        <div style={{ display: 'grid', gap: '1rem', maxWidth: '400px' }}>
          <div><strong>Email:</strong> {profileData?.email}</div>
          <div><strong>Role:</strong> <span style={{ color: profileData?.role === 'admin' ? '#667eea' : '#28a745' }}>{profileData?.role}</span></div>
          <div><strong>Member Since:</strong> {profileData?.joined}</div>
          <div><strong>Total Orders:</strong> {profileData?.orders}</div>
<div><strong>Total Spent:</strong> ₹{profileData?.totalSpent?.toLocaleString()}</div>
        </div>
      </div>

  {/* Order History */}
  <div style={{ background: 'white', padding: '2rem', borderRadius: '15px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
    <h2>📋 Order History ({orders.length})</h2>
    {orders.length === 0 ? (
      <p style={{ color: '#666' }}>No orders yet. <Link to="/cart" style={{ color: '#667eea' }}>Shop now!</Link></p>
    ) : (
      <div style={{ display: 'grid', gap: '1rem' }}>
        {orders.slice(0, 5).map(order => (
          <div key={order._id} style={{ padding: '1.5rem', background: '#f8f9fa', borderRadius: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <strong>Order #{order._id.slice(-6)}</strong>
              <span>${order.total.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              {order.items.map(item => (
                <div key={item._id} style={{ textAlign: 'center', minWidth: '80px' }}>
                  <img src={item.image} alt={item.title} style={{ width: '40px', height: '40px', borderRadius: '5px', objectFit: 'cover' }} />
                  <small>{item.title.slice(0,15)}...</small>
                  <div>x{item.quantity}</div>
                </div>
              ))}
            </div>
            <small style={{ color: '#666' }}>{new Date(order.createdAt).toLocaleDateString()}</small>
          </div>
        ))}
        {orders.length > 5 && <p style={{ textAlign: 'center', color: '#666' }}>...</p>}
      </div>
    )}
  </div>

  {/* Chat with Admin */}
  <div style={{ background: 'white', padding: '2rem', borderRadius: '15px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', marginTop: '2rem' }}>
    <h2>💬 Chat with Admin</h2>
    <div style={{ height: '400px', overflowY: 'auto', border: '1px solid #eee', padding: '1rem', marginBottom: '1rem', borderRadius: '10px' }}>
      No messages yet. Send one below!
    </div>
    <form style={{ display: 'flex', gap: '1rem' }}>
      <input style={{ flex: 1, padding: '0.75rem', border: '1px solid #ddd', borderRadius: '8px' }} placeholder="Type message to admin..." />
      <button type="submit" style={{ padding: '0.75rem 1.5rem', background: '#667eea', color: 'white', border: 'none', borderRadius: '8px' }}>Send</button>
    </form>
  </div>
</div>
  );
};

export default Profile;


import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CardContext';
import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  // Profile chat states
  const [chatMessages, setChatMessages] = useState([]);
  const [chatText, setChatText] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [adminId, setAdminId] = useState(null);
  const socketRef = useRef(null);
  const userId = user?._id;

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  // Profile chat: Get admin ID
  useEffect(() => {
    if (!userId) return;
    axios.get(`${API_URL}/api/users/admin-id`)
      .then(res => setAdminId(res.data.adminId))
      .catch(err => console.error("Admin ID error", err));
  }, [userId]);

  // Socket connection for profile chat
  useEffect(() => {
    if (!userId) return;
    const socket = io(API_URL, {
      transports: ["websocket", "polling"],
      upgrade: true,
      reconnection: true
    });
    socketRef.current = socket;
    socket.emit("join", { userId });

    socket.on("receiveMessage", (msg) => {
      setChatMessages(prev => [...prev, msg]);
    });

    return () => socket.disconnect();
  }, [userId]);

  // Load profile chat history
  useEffect(() => {
    if (!userId || !adminId) return;
    setChatLoading(true);
    axios.get(`${API_URL}/api/messages/profile/${userId}`)
      .then(res => setChatMessages(res.data || []))
      .catch(err => console.error("Load chat error:", err))
      .finally(() => setChatLoading(false));
  }, [userId, adminId]);

  const sendProfileMessage = async (e) => {
    e.preventDefault();
    if (!chatText.trim() || !userId || !adminId) return;
    const messageData = {
      senderId: userId,
      receiverId: adminId,
      message: chatText.trim()
    };
    socketRef.current.emit("sendMessage", messageData);
    setChatText("");
  };

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

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
    <div className="chat-messages" style={{ height: '300px', overflowY: 'auto', border: '1px solid #eee', padding: '1rem', marginBottom: '1rem', borderRadius: '10px', background: '#f9f9f9' }}>
      {chatLoading ? (
        <div>Loading messages...</div>
      ) : chatMessages.map(msg => (
        <div key={msg._id} className={`message ${msg.senderId === userId ? 'sent' : 'received'}`} style={{ marginBottom: '0.5rem', padding: '0.5rem', borderRadius: '8px', maxWidth: '80%' }}>
          <div>{msg.message}</div>
          <small style={{ opacity: 0.7 }}>{new Date(msg.createdAt).toLocaleTimeString()}</small>
        </div>
      ))}
    </div>
    <form onSubmit={sendProfileMessage} style={{ display: 'flex', gap: '1rem' }}>
      <input 
        style={{ flex: 1, padding: '0.75rem', border: '1px solid #ddd', borderRadius: '8px' }} 
        value={chatText}
        onChange={(e) => setChatText(e.target.value)}
        placeholder="Type message to admin..."
        disabled={!adminId}
      />
      <button type="submit" style={{ padding: '0.75rem 1.5rem', background: '#667eea', color: 'white', border: 'none', borderRadius: '8px' }} disabled={!chatText.trim() || !adminId}>
        Send
      </button>
    </form>
  </div>
</div>
  );
};

export default Profile;


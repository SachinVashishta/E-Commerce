import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { io } from 'socket.io-client';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Chat = ({ targetUserId, partnerEmail, title = 'Chat' }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const socketRef = useRef();
  const messagesEndRef = useRef(null);
  const userId = user?._id;
  const adminId = targetUserId || 'admin-placeholder'; // Will be set dynamically
  const receiverId = user?.role === 'admin' ? targetUserId : adminId;
  const senderId = userId;

  // Get admin ID
  const [adminIdState, setAdminIdState] = useState(null);
  useEffect(() => {
    if (user?.role !== 'admin') {
      axios.get(`${API_URL}/api/auth/admin-id`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      }).then(res => {
        setAdminIdState(res.data.adminId);
      }).catch(err => console.error('Admin ID fetch error', err));
    }
  }, []);

  const currentReceiverId = user?.role === 'admin' ? targetUserId : adminIdState;

  // Load messages
  useEffect(() => {
    if (!currentReceiverId || !userId) return;
    setLoading(true);
    const endpoint = user.role === 'admin' ? `${API_URL}/api/messages/${targetUserId}` : `${API_URL}/api/messages/profile/${userId}`;
    axios.get(endpoint, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    }).then(res => {
      setMessages(res.data || []);
    }).catch(err => console.error('Messages load error', err))
    .finally(() => setLoading(false));
  }, [currentReceiverId, userId, targetUserId]);

  // Socket setup
  useEffect(() => {
    if (!currentReceiverId) return;

    socketRef.current = io(API_URL);
    
    socketRef.current.emit('join', { userId: userId });

    socketRef.current.on('messageSent', (message) => {
      if (message.senderId.toString() === userId) {
        setMessages(prev => [...prev, message]);
      }
    });

    socketRef.current.on('receiveMessage', (message) => {
      setMessages(prev => [...prev, message]);
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, [currentReceiverId, userId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!text.trim() || !currentReceiverId) return;

    socketRef.current.emit('sendMessage', {
      senderId: userId,
      receiverId: currentReceiverId,
      text: text.trim()
    });
    setText('');
  };

  if (loading) return <div className="chat-loading">Loading chat...</div>;

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h3>{title}</h3>
        {partnerEmail && <p>With: {partnerEmail}</p>}
      </div>
      
      <div className="chat-messages">
        {messages.map((msg, idx) => (
          <div key={msg._id || idx} className={`message ${msg.senderId.toString() === userId ? 'sent' : 'received'}`}>
            <div className="message-content">
              <strong>{msg.senderId.email || 'User'}</strong>
              <p>{msg.message}</p>
              <small>{new Date(msg.createdAt).toLocaleTimeString()}</small>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={sendMessage} className="chat-input">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type message..."
          disabled={!currentReceiverId}
        />
        <button type="submit" disabled={!text.trim() || !currentReceiverId}>
          Send
        </button>
      </form>

      <style jsx>{`
        .chat-container { max-width: 600px; margin: 0 auto; height: 70vh; display: flex; flex-direction: column; }
        .chat-header { background: #667eea; color: white; padding: 1rem; text-align: center; }
        .chat-messages { flex: 1; overflow-y: auto; padding: 1rem; background: #f5f5f5; }
        .message { margin-bottom: 1rem; }
        .message.sent { text-align: right; }
        .message .message-content { display: inline-block; max-width: 80%; padding: 0.75rem 1rem; border-radius: 18px; }
        .sent .message-content { background: #667eea; color: white; }
        .received .message-content { background: white; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        .chat-input { display: flex; padding: 1rem; gap: 0.5rem; background: white; border-top: 1px solid #eee; }
        .chat-input input { flex: 1; padding: 0.75rem; border: 1px solid #ddd; border-radius: 20px; }
        .chat-input button { padding: 0.75rem 1.5rem; background: #28a745; color: white; border: none; border-radius: 20px; cursor: pointer; }
        @media (max-width: 768px) { .chat-container { height: 60vh; } }
      `}</style>
    </div>
  );
};

export default Chat;


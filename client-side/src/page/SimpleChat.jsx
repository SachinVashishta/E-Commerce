import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { io } from 'socket.io-client';
import { useSearchParams } from 'react-router-dom';
import '../components/Chat.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const SimpleChat = () => {
  const [searchParams] = useSearchParams();
  const targetUserId = searchParams.get('userId');
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [partnerName, setPartnerName] = useState('Admin');
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const userId = user?._id;
  const isAdmin = user?.role === 'admin';

  const currentReceiverId = isAdmin ? targetUserId : 'admin-placeholder'; // Admin ID from state/backend
  const [adminId, setAdminId] = useState(null);

  // Get admin ID for users
  useEffect(() => {
    if (!isAdmin) {
      axios.get(`${API_URL}/api/auth/admin-id`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      }).then(res => setAdminId(res.data.adminId));
    }
  }, [isAdmin]);

  const finalReceiverId = isAdmin ? targetUserId : adminId;

  // Load messages
  useEffect(() => {
    if (!finalReceiverId) return;
    const endpoint = isAdmin ? `${API_URL}/api/messages/${targetUserId}` : `${API_URL}/api/messages/profile/${userId}`;
    axios.get(endpoint, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
      .then(res => setMessages(res.data.sort((a,b) => new Date(a.createdAt) - new Date(b.createdAt))))
      .catch(console.error);
  }, [finalReceiverId, targetUserId, userId, isAdmin]);

  // Partner name
  useEffect(() => {
    if (isAdmin && targetUserId) {
      axios.get(`${API_URL}/api/users/${targetUserId}`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
        .then(res => setPartnerName(res.data.email))
        .catch(() => setPartnerName('User'));
    }
  }, [targetUserId, isAdmin]);

  // Socket
  useEffect(() => {
    if (!finalReceiverId || !userId) return;

    socketRef.current = io(API_URL, { auth: { token: localStorage.getItem('token') } });
    
    socketRef.current.emit('join', { userId });

    const handleMessageSent = (msg) => {
      if (msg.senderId.toString() === userId.toString()) {
        setMessages(prev => [...prev, msg]);
      }
    };

    const handleReceiveMessage = (msg) => {
      setMessages(prev => [...prev, msg]);
    };

    socketRef.current.on('messageSent', handleMessageSent);
    socketRef.current.on('receiveMessage', handleReceiveMessage);

    return () => {
      socketRef.current?.off('messageSent', handleMessageSent);
      socketRef.current?.off('receiveMessage', handleReceiveMessage);
      socketRef.current?.disconnect();
    };
  }, [finalReceiverId, userId]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !finalReceiverId) return;

    socketRef.current.emit('sendMessage', {
      senderId: userId,
      receiverId: finalReceiverId,
      text: newMessage.trim()
    });
    setNewMessage('');
  };

  return (
    <div className="whatsapp-chat">
      <header className="chat-header">
        <h2>{isAdmin ? partnerName : 'Admin Support'}</h2>
        <span>Online</span>
      </header>

      <div className="messages-container">
        <div className="messages">
          {messages.map((msg) => (
            <div key={msg._id} className={`message ${msg.senderId.toString() === userId.toString() ? 'sent' : 'received'}`}>
              <div className="message-bubble">
                <div className="message-text">{msg.message}</div>
                <div className="message-time">{new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <form onSubmit={sendMessage} className="input-container">
        <div className="input-wrapper">
          <input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="message-input"
            disabled={!finalReceiverId}
          />
          <button type="submit" className="send-btn" disabled={!newMessage.trim() || !finalReceiverId}>
            <svg viewBox="0 0 24 24" width="24" height="24">
              <path fill="currentColor" d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
};

export default SimpleChat;


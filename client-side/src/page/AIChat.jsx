import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const AIChat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const sendAIQuery = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setLoading(true);

    try {
      const res = await axios.post(`${API_URL}/api/messages/ai`, {
        question: input,
        userId: user?._id
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const aiMessage = { role: 'ai', content: res.data.reply };
      setMessages(prev => [...prev, aiMessage]);
    } catch (err) {
      const errorMessage = { role: 'ai', content: 'Sorry, AI is having trouble. Try again!' };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setInput('');
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '700px', margin: '0 auto' }}>
      <h1>🤖 AI Assistant</h1>
      <p>Ask anything about products, orders, or support!</p>
      
      <div style={{ 
        height: '60vh', 
        border: '1px solid #ddd', 
        borderRadius: '10px', 
        overflowY: 'auto', 
        padding: '1rem', 
        background: '#f8f9fa',
        marginBottom: '1rem'
      }}>
        {messages.map((msg, idx) => (
          <div key={idx} style={{ 
            marginBottom: '1rem', 
            padding: '1rem', 
            borderRadius: '10px',
            background: msg.role === 'user' ? '#667eea' : '#e9ecef',
            color: msg.role === 'user' ? 'white' : 'black',
            marginLeft: msg.role === 'user' ? '20%' : '0',
            maxWidth: '80%'
          }}>
            <strong>{msg.role === 'user' ? 'You' : 'AI'}:</strong> {msg.content}
          </div>
        ))}
        {loading && <div>Loading AI response...</div>}
      </div>

      <form onSubmit={sendAIQuery} style={{ display: 'flex', gap: '0.5rem' }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask AI anything..."
          style={{ flex: 1, padding: '0.75rem', borderRadius: '20px', border: '1px solid #ddd' }}
          disabled={loading}
        />
        <button 
          type="submit" 
          disabled={loading || !input.trim()}
          style={{
            padding: '0.75rem 1.5rem',
            background: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '20px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default AIChat;


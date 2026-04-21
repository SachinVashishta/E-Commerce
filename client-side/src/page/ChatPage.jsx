import { useEffect, useState, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { useSearchParams } from "react-router-dom";
import { io } from "socket.io-client";
import axios from "axios";
import '../components/Chat.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function ChatPage() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const targetUserId = searchParams.get('userId');
  const isAdmin = user?.role === 'admin';
  
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [targetUser, setTargetUser] = useState(null);
  const [chattingWith, setChattingWith] = useState('');
  const socketRef = useRef(null);
  const userId = user?._id;
  const receiverId = targetUserId || (user?.role === 'user' ? 'admin-id-from-api' : targetUserId); // Logic for receiver

  // Fetch target user email if admin
  useEffect(() => {
    if (isAdmin && targetUserId) {
      axios.get(`${API_URL}/api/users/${targetUserId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      }).then(res => {
        setTargetUser(res.data);
        setChattingWith(res.data.email);
      }).catch(() => setChattingWith('User'));
    } else if (!isAdmin) {
      setChattingWith('Admin Support');
    }
  }, [targetUserId, isAdmin]);

  // Socket & messages logic (same as Chat.jsx)
  // ... (copy full from Chat.jsx)

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h2>💬 Chat</h2>
        <p>{chattingWith}</p>
      </div>
      {/* Messages & input */}
    </div>
  );
}


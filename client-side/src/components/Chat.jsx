import { useEffect, useState, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { io } from "socket.io-client";
import axios from "axios";
import './Chat.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function Chat() {\n  const { user } = useAuth();\n  const [messages, setMessages] = useState([]);\n  const [text, setText] = useState("");\n  const [loading, setLoading] = useState(false);\n  const [adminId, setAdminId] = useState(null);\n  const [targetUserId, setTargetUserId] = useState(null);\n  const [chattingWith, setChattingWith] = useState('Admin & AI');\n  const [aiLoading, setAiLoading] = useState(false);\n  const socketRef = useRef(null);\n  const userId = user?._id;\n\n  // Parse URL for admin chat with specific user\n  useEffect(() => {\n    const urlParams = new URLSearchParams(window.location.search);\n    const targetId = urlParams.get('userId');\n    if (targetId && user?.role === 'admin') {\n      setTargetUserId(targetId);\n      setChattingWith('User Chat');\n    }\n  }, []);

  // 1. Get admin ID
  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }
    axios.get(`${API_URL}/api/users/admin-id`)
    .then(res => setAdminId(res.data.adminId))
    .catch(err => console.error("Admin ID error", err));
  }, [userId]);

  // 2. Socket connection
  useEffect(() => {
    if (!userId) return;
    const socket = io(API_URL, { transports: ["websocket","polling"],
      upgrade: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 5000,
      timeout: 20000,
     });
    socketRef.current = socket;
    socket.emit("join", { userId });

    socket.on("receiveMessage", (msg) => {
      setMessages(prev => [...prev, msg]);
    });

    return () => socket.disconnect();
  }, [userId]);

  // 3. Load past messages
  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    axios.get(`${API_URL}/api/messages/${userId}`)
    .then(res => setMessages(res.data || []))
    .catch(err => console.error("Load error:", err))
    .finally(() => setLoading(false));
  }, [userId]);

  // 4. Send to admin
  const sendMessage = (e) => {
    e.preventDefault();
    if (!text.trim() || !userId || !adminId) return;

    const messageData = {
      senderId: userId,
      receiverId: adminId,
      message: text.trim()
    };

    socketRef.current.emit("sendMessage", messageData);
    setText("");
  };

  // 5. Ask AI (fixed - no duplicate code)
  const askAI = async () => {
    if (!text.trim() || !userId || !adminId) return;
    setAiLoading(true);
    const userQuestion = text.trim();
    setText("");

    // Show user message immediately
    const userMsg = {
      _id: Date.now(),
      senderId: userId,
      receiverId: adminId,
      message: userQuestion,
      createdAt: new Date()
    };
    setMessages(prev => [...prev, userMsg]);

    try {
      const res = await axios.post(`${API_URL}/api/messages/ai`, {
        question: userQuestion,
        userId: userId
      });

      // Show AI reply
      const aiMsg = {
        _id: Date.now() + 1,
        senderId: adminId,
        receiverId: userId,
        message: res.data.reply,
        createdAt: new Date()
      };
      setMessages(prev => [...prev, aiMsg]);

    } catch (err) {
      console.error("AI error:", err);
      const errorMsg = {
        _id: Date.now() + 2,
        senderId: adminId,
        receiverId: userId,
        message: "AI failed. Try again.",
        createdAt: new Date()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setAiLoading(false);
    }
  };

  if (!user) return <div className="error">Please login</div>;
  if (loading) return <div className="loading">Loading chat...</div>;

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h2>💬 Support Chat</h2>
        <p>Messages with Admin & AI</p>
      </div>

      <div className="chat-messages">
        {messages.map(msg => (
          <div key={msg._id} className={`message ${msg.senderId === userId ? 'sent' : 'received'}`}>
            <div>{msg.message}</div>
            <div className="message-time">
              {new Date(msg.createdAt).toLocaleTimeString()}
            </div>
          </div>
        ))}
        {aiLoading && (
          <div className="message received">
            <div>🤖 AI is thinking...</div>
          </div>
        )}
      </div>

      <form className="chat-input-container" onSubmit={sendMessage}>
        <input 
          className="chat-input" 
          value={text} 
          onChange={e => setText(e.target.value)} 
          placeholder="Type your message..." 
          disabled={!adminId}
        />
        <button type="submit" className="send-btn" disabled={!text.trim() || !adminId}>
          Send
        </button>
        <button type="button" className="send-btn" onClick={askAI} disabled={aiLoading || !adminId}>
          {aiLoading ? '...' : '🤖 AI'}
        </button>
      </form>
    </div>
  );
}


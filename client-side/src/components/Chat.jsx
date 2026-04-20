import { useEffect, useState, useRef, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { io } from "socket.io-client";
import axios from "axios";
import './Chat.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function Chat() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);

  const userId = user?._id || "guest";
  const adminId = "admin";

  // ✅ Local socket connection with cleanup
  useEffect(() => {
    if (!userId) return;

    const socket = io(API_URL, {
      transports: ["websocket", "polling"],
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: 5
    });
    socketRef.current = socket;

    // Join room
    socket.emit("join", { userId });

    // Receive messages
    const handleReceive = (msg) => {
      setMessages((prev) => [...prev, msg]);
      setIsTyping(false);
    };
    socket.on("receiveMessage", handleReceive);
    socket.on("messageSent", handleReceive);

    return () => {
      socket.off("receiveMessage", handleReceive);
      socket.off("messageSent", handleReceive);
      socket.disconnect();
    };
  }, [userId, API_URL]);

  // Scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Load initial messages
  useEffect(() => {
    if (!userId) return;

    setLoading(true);
    axios.get(`${API_URL}/api/messages/${userId}`)
      .then((res) => {
        setMessages(res.data || []);
        setError(null);
      })
      .catch((err) => {
        console.error("Load messages error:", err);
        setError("Failed to load messages");
      })
      .finally(() => setLoading(false));
  }, [userId, API_URL]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!text.trim() || !userId || !socketRef.current) return;

    const messageData = {
      senderId: userId,
      receiverId: adminId,
      text: text.trim()
    };

    socketRef.current.emit("sendMessage", messageData);
    setText("");
    setIsTyping(true);
  };

  if (!user) {
    return <div className="error">Please login to chat</div>;
  }

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h2>💬 AI Support Chat</h2>
        <p>Ask anything about products, orders, or support!</p>
      </div>

      <div className="chat-messages">
        {loading && <div className="loading">Loading messages...</div>}
        {error && <div className="error">{error}</div>}
        
        {isTyping && (
          <div className="message received">
            <div>🤖 AI is typing...</div>
          </div>
        )}
        
        {messages.map((msg, i) => (
          <div
            key={msg._id || i}
            className={`message ${msg.senderId === userId ? 'sent' : 'received'}`}
          >
            <div>{msg.text}</div>
            <div className="message-time">
              {new Date(msg.createdAt || Date.now()).toLocaleTimeString()}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={sendMessage} className="chat-input-container">
        <textarea
          className="chat-input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type your question... (Enter to send)"
          rows="1"
          disabled={loading}
          maxLength={500}
        />
        <button
          type="submit"
          className="send-btn"
          disabled={!text.trim() || loading}
        >
          ➤
        </button>
      </form>
    </div>
  );
}


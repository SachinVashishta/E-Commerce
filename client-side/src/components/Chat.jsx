import { useEffect, useState, useRef, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import io from "socket.io-client";
import axios from "axios";
import './Chat.css';

const API_URL = import.meta.env.VITE_API_URL 
const socket = io(API_URL);

export default function Chat() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const ADMIN_ID = "admin"; // Hardcoded admin ID

  const userId = user?._id || "guest";
  const adminId = ADMIN_ID;

  // Scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Join room
  useEffect(() => {
    if (userId) {
      socket.emit("join", { userId });
    }
  }, [userId]);

  // Load messages
  useEffect(() => {
    if (userId && adminId) {
      setLoading(true);
      axios.get(`${API_URL}/api/messages/${userId}/${adminId}`)
        .then((res) => {
          setMessages(res.data || []);
          setError(null);
        })
        .catch((err) => {
          console.error("Load messages error:", err);
          setError("Failed to load messages");
        })
        .finally(() => setLoading(false));
    }
  }, [userId, adminId, API_URL]);

  // Receive message
  useEffect(() => {
  const handleReceive = (msg) => {
    setMessages((prev) => [...prev, msg]);
    setIsTyping(false);
  };
    socket.on("receiveMessage", handleReceive);
    socket.on("messageSent", handleReceive);

    return () => {
      socket.off("receiveMessage", handleReceive);
      socket.off("messageSent", handleReceive);
    };
  }, []);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!text.trim() || !userId) return;

    const messageData = {
      senderId: userId,
      receiverId: adminId,
      text: text.trim(),
    };

    socket.emit("sendMessage", messageData);
    setText("");
    setIsTyping(true);
  };

  if (!user) {
    return <div className="error">Please login to chat</div>;
  }

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h2>💬 Support Chat</h2>
        <p>with Admin</p>
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
          placeholder="Type your message... (Enter to send)"
          rows="1"
          disabled={loading}
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

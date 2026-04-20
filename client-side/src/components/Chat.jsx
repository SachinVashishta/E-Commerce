import { useEffect, useState, useRef, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { io } from "socket.io-client";
import axios from "axios";
import './Chat.css';

const API_URL = import.meta.env.VITE_API_URL ;

export default function Chat() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [adminId, setAdminId] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const socketRef = useRef(null);
  const userId = user?._id;

  // 1. Admin ki ObjectId laao
  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }
    axios.get(`${API_URL}/api/users/admin-id`)
    .then(res => setAdminId(res.data.adminId))
    .catch(err => console.error("Admin ID error", err));
  }, [userId]);

  // 2. Socket connect
  useEffect(() => {
    if (!userId) return;
    const socket = io(API_URL, { transports: ["websocket"] });
    socketRef.current = socket;
    socket.emit("join", { userId });

    socket.on("receiveMessage", (msg) => {
      setMessages(prev => [...prev, msg]);
    });

    return () => socket.disconnect();
  }, [userId]);

  // 3. Purane messages load
  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    axios.get(`${API_URL}/api/messages/${userId}`)
    .then(res => setMessages(res.data || []))
    .catch(err => console.error("Load error:", err))
    .finally(() => setLoading(false));
  }, [userId]);

  // 4. Admin ko message bhejo
  const sendMessage = (e) => {
    e.preventDefault();
    if (!text.trim() || !userId || !adminId) return;

    const messageData = {
      senderId: userId,
      receiverId: adminId, // ✅ Asli ObjectId
      message: text.trim() // ✅ 'message' key
    };

    socketRef.current.emit("sendMessage", messageData);
    setText("");
  };

  // 5. AI se pucho
  const askAI = async () => {
    if (!text.trim() || !userId) return;
    setAiLoading(true);

    try {
      await axios.post(`${API_URL}/api/messages/ai`, {
        question: text.trim(),
        userId: userId
      });
      // AI ka reply socket se aa jayega kyunki backend me save ho raha
      setText("");
    } catch (err) {
      console.error("AI error:", err);
    } finally {
      setAiLoading(false);
    }
  };

  if (!user) return <div>Please login</div>;
  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <div>
        {messages.map(msg => (
          <div key={msg._id}>
            <b>{msg.senderId === userId ? 'You' : 'Support'}:</b> {msg.message}
          </div>
        ))}
        {aiLoading && <div>AI is thinking...</div>}
      </div>
      <form onSubmit={sendMessage}>
        <input value={text} onChange={e => setText(e.target.value)} placeholder="Type..." />
        <button type="submit">Send</button>
        <button type="button" onClick={askAI} disabled={aiLoading}>
          {aiLoading ? '...' : 'Ask AI'}
        </button>
      </form>
    </div>
  );
}


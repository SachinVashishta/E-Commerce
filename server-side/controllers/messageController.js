const Message = require('../models/Message');
const User = require('../models/User');
const { generateAIResponse } = require('./aiController');

// GET MESSAGES - user ↔ admin
const getMessages = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const admin = await User.findOne({ role: "admin" });
    if (!admin) return res.status(200).json([]);

    const messages = await Message.find({
      $or: [
        { senderId: userId, receiverId: admin._id },
        { senderId: admin._id, receiverId: userId }
      ]
    }).sort({ createdAt: 1 }).limit(100);

    res.status(200).json(messages);
  } catch (error) {
    console.error("❌ Get messages error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// AI RESPONSE
const getAIResponse = async (req, res) => {
  try {
    const { question, userId } = req.body;

    if (!question) {
      return res.status(400).json({ message: "Question required" });
    }

    const reply = await generateAIResponse(question);

    // AI ka reply DB me save karo
    const admin = await User.findOne({ role: "admin" });
    if (admin && userId) {
      await Message.create({
        senderId: admin._id,
        receiverId: userId,
        message: reply
      });
    }

    res.status(200).json({ reply });
  } catch (error) {
    console.error("❌ AI error:", error);
    res.status(500).json({ message: "AI failed" });
  }
};

// SOCKET KE LIYE SAVE FUNCTION
const saveMessage = async (data) => {
  try {
    const { senderId, receiverId, message } = data;
    const newMessage = await Message.create({ senderId, receiverId, message });
    return newMessage;
  } catch (error) {
    console.error("Save message error:", error);
    return null;
  }
};

module.exports = { getMessages, getAIResponse, saveMessage };

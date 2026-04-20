const Message = require('../models/Message');
const User = require('../models/User');
const { generateAIResponse } = require('./aiController');

// ✅ Get messages (user ↔ admin)
const getMessages = async (req, res) => {
  try {
    const { userId } = req.params;

    const admin = await User.findOne({ role: "admin" });

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    const messages = await Message.find({
      $or: [
        { senderId: userId, receiverId: admin._id },
        { senderId: admin._id, receiverId: userId }
      ]
    })
    .sort({ createdAt: 1 })
    .limit(50);

    res.json(messages);

  } catch (error) {
    console.error("❌ Get messages error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ AI response
const getAIResponse = async (req, res) => {
  try {
    const { question } = req.body;

    if (!question) {
      return res.status(400).json({ message: "Question required" });
    }

    const reply = await generateAIResponse(question);
    res.json({ reply });

  } catch (error) {
    console.error("❌ AI error:", error);
    res.status(500).json({ message: "AI failed" });
  }
};

module.exports = { getMessages, getAIResponse };

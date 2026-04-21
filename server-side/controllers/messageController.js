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
    })
    .populate('senderId', 'email role')
    .populate('receiverId', 'email role')
    .sort({ createdAt: 1 })
    .limit(100);

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

// SOCKET SAVE
const saveMessage = async (data) => {
  try {
    const { senderId, receiverId, message, text } = data;
    const newMessage = await Message.create({ 
      senderId, 
      receiverId, 
      message: message || text 
    });
    return newMessage;
  } catch (error) {
    console.error("Save message error:", error);
    return null;
  }
};

// ADMIN RECENT CHATS
const getRecentMessages = async (req, res) => {
  try {
    const admin = await User.findOne({ role: 'admin' });
    if (!admin) return res.status(404).json({ message: 'Admin not found' });

    const recent = await Message.aggregate([
      { $match: { receiverId: admin._id } },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: '$senderId',
          lastMessage: { $first: '$message' },
          lastTime: { $first: '$createdAt' },
          count: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
      { $sort: { lastTime: -1 } },
      { $limit: 10 }
    ]);

    res.json(recent);
  } catch (error) {
    console.error('Recent chats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getMessages, getAIResponse, saveMessage, getRecentMessages };

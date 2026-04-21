const Message = require('../models/Message');
const User = require('../models/User');
const { generateAIResponse } = require('./aiController');

// GET MESSAGES - user ↔ admin
const getMessages = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const admin = await User.findOne({ role: "admin" });
    if (!admin) return res.status(200).json([]);

    const messages = await Message.find({\n      $or: [\n        { senderId: userId, receiverId: admin._id },\n        { senderId: admin._id, receiverId: userId }\n      ]\n    })\n    .populate('senderId', 'email role')\n    .populate('receiverId', 'email role')\n    .sort({ createdAt: 1 })\n    .limit(100);

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
const saveMessage = async (data) => {\n  try {\n    const { senderId, receiverId, message, text } = data;\n    const newMessage = await Message.create({ \n      senderId, \n      receiverId, \n      message: message || text \n    });\n    return newMessage;\n  } catch (error) {\n    console.error("Save message error:", error);\n    return null;\n  }\n};

// Admin recent chats (last message per user)\nconst getRecentMessages = async (req, res) => {\n  try {\n    const admin = await User.findOne({ role: 'admin' });\n    if (!admin) return res.status(404).json({ message: 'Admin not found' });\n\n    const recent = await Message.aggregate([\n      {\n        $match: {\n          receiverId: admin._id\n        }\n      },\n      {\n        $sort: { createdAt: -1 }\n      },\n      {\n        $group: {\n          _id: '$senderId',\n          lastMessage: { $first: '$message' },\n          lastTime: { $first: '$createdAt' },\n          count: { $sum: 1 }\n        }\n      },\n      {\n        $lookup: {\n          from: 'users',\n          localField: '_id',\n          foreignField: '_id',\n          as: 'user'\n        }\n      },\n      { $unwind: '$user' },\n      { $sort: { lastTime: -1 } },\n      { $limit: 10 }\n    ]);\n\n    res.json(recent);\n  } catch (error) {\n    console.error('Recent chats error:', error);\n    res.status(500).json({ message: 'Server error' });\n  }\n};\n\nmodule.exports = { getMessages, getAIResponse, saveMessage, getRecentMessages };

const Message = require('../models/Message');

// Get messages between user and admin
const getMessages = async (req, res) => {
  try {
    const { userId, adminId } = req.params;
    
    const messages = await Message.find({
      $or: [
        { senderId: userId, receiverId: adminId },
        { senderId: adminId, receiverId: userId }
      ]
    })
    .sort({ createdAt: 1 })
    .populate('senderId', 'name email')
    .populate('receiverId', 'name email')
    .limit(50);

    res.json(messages);
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const { generateAIResponse } = require('./aiController');

// Get AI response endpoint
const getAIResponse = async (req, res) => {
  try {
    const { question } = req.body;
    if (!question) return res.status(400).json({ message: 'Question required' });
    
    const aiReply = await generateAIResponse(question);
    res.json({ reply: aiReply });
  } catch (error) {
    console.error('AI response error:', error);
    res.status(500).json({ message: 'AI service unavailable' });
  }
};

module.exports = { getMessages, getAIResponse };

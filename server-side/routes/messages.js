const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');

// Get messages between specific user and admin
router.get('/:userId/:adminId', messageController.getMessages);

// POST /api/messages/ai - Direct AI response
router.post('/ai', messageController.getAIResponse);

module.exports = router;

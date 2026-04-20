
const express = require('express');
const { getMessages, getAIResponse } = require('../controllers/messageController');
const router = express.Router();

router.get('/:userId', getMessages);  // GET /api/messages/66fe...
router.post('/ai', getAIResponse);    // POST /api/messages/ai

module.exports = router;
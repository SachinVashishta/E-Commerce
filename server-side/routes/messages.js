const express = require('express');
const router = express.Router();
const { getMessages, getAIResponse } = require('../controllers/messageController');

// ✅ Only userId needed
router.get('/:userId', getMessages);

// ✅ AI route
router.post('/ai', getAIResponse);

module.exports = router;

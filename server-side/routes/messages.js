const express = require('express');
const router = express.Router();
const { getMessages, getAIResponse } = require('../controllers/messageController');

// ✅ Fixed: Single param /:userId (matches client call)
router.get('/:userId', (req, res) => getMessages(req, res, "admin"));

// ✅ AI route (unused by main chat, but keep)
router.post('/ai', getAIResponse);

module.exports = router;


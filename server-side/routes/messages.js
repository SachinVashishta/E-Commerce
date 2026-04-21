
const express = require('express');
const { getMessages, getAIResponse } = require('../controllers/messageController');
const router = express.Router();

router.get('/:userId', getMessages);  // GET /api/messages/66fe...
router.post('/ai', getAIResponse);    // POST /api/messages/ai\nrouter.get('/recent', getRecentMessages);   // GET /api/messages/recent\n\nmodule.exports = router;

module.exports = router
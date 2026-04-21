const express = require('express');
const { getMessages, getAIResponse, getRecentMessages, getProfileMessages, getAdminQueries } = require('../controllers/messageController');
const router = express.Router();

router.get('/:userId', getMessages);  // User chat history
router.get('/profile/:userId', getProfileMessages);  // Profile chat
router.post('/ai', getAIResponse);    
router.get('/recent', getRecentMessages);   
router.get('/admin/queries', getAdminQueries);  // Admin user queries

module.exports = router;

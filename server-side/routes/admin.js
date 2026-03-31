const express = require('express');
const { isAdmin } = require('../middleware/auth');
const User = require('../models/User');
const Query = require('../models/Query');
const router = express.Router();

router.get('/users', isAdmin, async (req, res) => {
  const users = await User.find().select('-password');
  res.json(users);
});

router.get('/queries', isAdmin, async (req, res) => {
  const queries = await Query.find().sort({ createdAt: -1 });
  res.json(queries);
});

module.exports = router;

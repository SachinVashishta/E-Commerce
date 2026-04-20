const express = require('express');
const User = require('../models/User');
const router = express.Router();

// Frontend ko admin ki ID dene ke liye
router.get('/admin-id', async (req, res) => {
  try {
    const admin = await User.findOne({ role: 'admin' });
    if (!admin) return res.status(404).json({ message: "Admin not found" });
    res.json({ adminId: admin._id });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
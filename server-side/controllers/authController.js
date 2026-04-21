const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  try {
    const { email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 12);
    const user = new User({  email, password: hashedPassword });
    await user.save();
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'simplekey', { expiresIn: '7d' });
    res.json({ token, user: { id: user._id,  email, role: user.role , createdAt: user.createdAt,} });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const {  email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'simplekey', { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, email, role: user.role ,  createdAt: user.createdAt, } });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getAdminId = async (req, res) => {
  try {
    const admin = await User.findOne({ role: "admin" });
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }
    res.json({ adminId: admin._id });
  } catch (error) {
    console.error("Admin ID error:", error);
    res.status(500).json({ message: "Server error" });
  }
};



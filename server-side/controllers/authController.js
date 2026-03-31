const User = require('../models/User');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  const { email, password } = req.body;
  const user = new User({ email, password });
  await user.save();
  const token = jwt.sign({ userId: user._id }, 'simplekey', { expiresIn: '7d' });
  res.json({ token, user: { id: user._id, email, role: user.role } });
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email, password });
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });
  const token = jwt.sign({ userId: user._id }, 'simplekey', { expiresIn: '7d' });
  res.json({ token, user: { id: user._id, email, role: user.role } });
};


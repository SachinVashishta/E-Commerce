const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = {
  protect: async (req, res, next) => {
    try {
      const token = req.header('Authorization')?.replace('Bearer ', '');
      if (!token) return res.status(401).json({ message: 'No token' });
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'simplekey');
      req.user = await User.findById(decoded.userId).select('-password');
      if (!req.user) return res.status(401).json({ message: 'User not found' });
      next();
    } catch (error) {
      res.status(401).json({ message: 'Invalid token' });
    }
  },
  
  isAdmin: async (req, res, next) => {
    try {
      const token = req.header('Authorization')?.replace('Bearer ', '');
const decoded = jwt.verify(token, process.env.JWT_SECRET || 'simplekey');
      const user = await User.findById(decoded.userId).select('-password');
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: 'Admin access required' });
      }
      req.user = user;
      next();
    } catch (error) {
      res.status(401).json({ message: 'Invalid token' });
    }
  }
};


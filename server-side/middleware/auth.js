const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = {
  protect: async (req, res, next) => {
    try {
      const token = req.header('Authorization')?.replace('Bearer ', '');
      const decoded = jwt.verify(token, 'simplekey');
      req.user = await User.findById(decoded.userId).select('-password');
      next();
    } catch (error) {
      res.status(401).json({ message: 'Invalid token' });
    }
  },
  isAdmin: async (req, res, next) => {
    try {
      const token = req.header('Authorization')?.replace('Bearer ', '');
      const decoded = jwt.verify(token, 'simplekey');
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


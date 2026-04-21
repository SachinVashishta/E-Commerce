const express = require('express');
const authController = require('../controllers/authController');
const protect = require('../middleware/auth');

const router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/profile', protect.protect, (req, res) => {
  res.json(req.user);
});

router.get('/admin-id', protect.protect, authController.getAdminId);


module.exports = router;


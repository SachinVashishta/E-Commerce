const express = require('express');
const { protect } = require('../middleware/auth');
const orderController = require('../Controllers/orderController');
const router = express.Router();

router.post('/', protect, orderController.createOrder);
router.get('/myorders', protect, orderController.getUserOrders);
router.get('/', protect, orderController.getAllOrders); // Admin only in future

module.exports = router;


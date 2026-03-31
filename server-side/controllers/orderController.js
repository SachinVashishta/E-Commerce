const Order = require('../models/Order');
const User = require('../models/User');

exports.createOrder = async (req, res) => {
  try {
    const { items, total } = req.body;
    const userId = req.user._id;
    
    const order = new Order({
      userId,
      items,
      total,
      status: 'paid'
    });
    
    await order.save();
    
    // Clear user cart (future feature)
    
    res.status(201).json({ 
      message: 'Order created successfully!', 
      orderId: order._id 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id })
      .populate('items.productId', 'title price image')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('userId', 'email')
      .populate('items.productId', 'title price')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


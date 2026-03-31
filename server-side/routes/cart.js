const express = require('express');
const Cart = require('../models/Cart');
const { protect } = require('../middleware/auth');
const router = express.Router();

router.get('/', protect, async (req, res) => {
  const cart = await Cart.findOne({ userId: req.user._id }).populate('products.productId');
  res.json(cart || { products: [], total: 0 });
});

router.post('/', protect, async (req, res) => {
  const { productId, quantity } = req.body;
  let cart = await Cart.findOne({ userId: req.user._id });
  if (!cart) cart = new Cart({ userId: req.user._id, products: [], total: 0 });
  
  const itemIndex = cart.products.findIndex(p => p.productId.toString() === productId);
  if (itemIndex > -1) {
    cart.products[itemIndex].quantity += quantity;
  } else {
    cart.products.push({ productId, quantity });
  }
  cart.total = cart.products.reduce((sum, p) => sum + p.quantity * 100, 0); // dummy price
  
  await cart.save();
  res.json(cart);
});

router.delete('/:productId', protect, async (req, res) => {
  const cart = await Cart.findOne({ userId: req.user._id });
  if (cart) {
    cart.products = cart.products.filter(p => p.productId.toString() !== req.params.productId);
    cart.total = cart.products.reduce((sum, p) => sum + p.quantity * 100, 0);
    await cart.save();
  }
  res.json(cart || { products: [], total: 0 });
});

module.exports = router;

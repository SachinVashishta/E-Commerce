const express = require('express');
const productController = require('../controllers/productController');
const { isAdmin } = require('../middleware/auth');
const router = express.Router();

router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);
router.post('/',  productController.createProduct);  // Admin only via frontend check

module.exports = router;

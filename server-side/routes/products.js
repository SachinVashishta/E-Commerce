const express = require('express');
const productController = require('../controllers/productController');
const { isAdmin } = require('../middleware/auth');
const router = express.Router();

router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);
router.post('/', isAdmin, productController.createProduct);  // Admin only

// Admin: Update product
router.put('/:id', isAdmin, productController.updateProduct);
// Admin: Delete product
router.delete('/:id', isAdmin, productController.deleteProduct);

module.exports = router;

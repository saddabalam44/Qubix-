const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { protect, admin } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');


router.get('/', protect, productController.getProducts);
router.post('/', protect, admin, upload.single('image'), productController.addProduct);
router.put('/:id', protect, admin, upload.single('image'), productController.updateProduct);
router.delete('/:id', protect, admin, productController.deleteProduct);

module.exports = router;


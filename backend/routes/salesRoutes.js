const express = require('express');
const router = express.Router();
const salesController = require('../controllers/salesController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/', protect, admin, salesController.getSales);
router.delete('/', protect, admin, salesController.deleteSales);
router.delete('/:id', protect, admin, salesController.deleteSaleById);

module.exports = router;


const express = require('express');
const router = express.Router();
const billingController = require('../controllers/billingController');
const { protect } = require('../middleware/authMiddleware');

router.post('/checkout', protect, billingController.processCheckout);

module.exports = router;

const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const { 
    registerUser, 
    loginUser, 
    registerSupplier,
    addShopkeeper, 
    getUsers, 
    deleteShopkeeper, 
    getPendingSuppliers, 
    approveSupplier 
} = require('../controllers/authController');

router.post('/register', registerUser);
router.post('/login', loginUser);

// Admin Routes
router.post('/add-shopkeeper', protect, admin, addShopkeeper);
router.get('/users', protect, admin, getUsers);
router.delete('/:id', protect, admin, deleteShopkeeper);

// Supplier Approval Workflow
router.post('/register-supplier', registerSupplier);
router.get('/pending-suppliers', protect, admin, getPendingSuppliers);
router.put('/approve-supplier/:id', protect, admin, approveSupplier);

module.exports = router;

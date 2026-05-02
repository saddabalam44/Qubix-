const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const { 
    registerUser, 
    loginUser, 
    registerSupplier,
    addShopkeeper, 
    addSupplier,
    getUsers, 
    deleteShopkeeper, 
    getPendingSuppliers, 
    approveSupplier 
} = require('../controllers/authController');

router.post('/register', registerUser);
router.post('/login', loginUser);


router.post('/add-shopkeeper', protect, admin, addShopkeeper);
router.post('/add-supplier', protect, admin, addSupplier);
router.get('/users', protect, admin, getUsers);
router.delete('/:id', protect, admin, deleteShopkeeper);


router.post('/register-supplier', registerSupplier);
router.get('/pending-suppliers', protect, admin, getPendingSuppliers);
router.put('/approve-supplier/:id', protect, admin, approveSupplier);

module.exports = router;

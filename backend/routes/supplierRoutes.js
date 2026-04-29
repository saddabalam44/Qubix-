const express = require('express');
const router = express.Router();
const { 
    getSupplierProducts, 
    restockProduct, 
    createDemand, 
    approveDemand, 
    processStagedPayment, 
    updateDeliveryStatus,
    getNotifications, 
    markNotificationRead,
    getSupplierStats,
    getSupplierOrders, 
    getAdminPurchaseOrders,
    clearAllOrders,
    clearNotifications
} = require('../controllers/supplierController');
const { protect, admin, supplier } = require('../middleware/authMiddleware');

router.get('/products', protect, getSupplierProducts);
router.post('/demand', protect, admin, createDemand);
router.put('/demand/:id/approve', protect, supplier, approveDemand);
router.post('/purchase/pay-stage', protect, admin, processStagedPayment);
router.put('/order/:id/delivery', protect, supplier, updateDeliveryStatus);
router.get('/notifications', protect, getNotifications);
router.put('/notifications/:id/read', protect, markNotificationRead);
router.delete('/notifications', protect, clearNotifications);
router.get('/stats', protect, getSupplierStats);
router.get('/orders', protect, getSupplierOrders);
router.get('/admin/orders', protect, admin, getAdminPurchaseOrders);
router.delete('/admin/orders', protect, admin, clearAllOrders);

module.exports = router;

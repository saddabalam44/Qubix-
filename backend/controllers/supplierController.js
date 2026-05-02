const PurchaseOrder = require('../models/PurchaseOrder');
const Product = require('../models/Product');
const Notification = require('../models/Notification');



const createDemand = async (req, res) => {
    try {
        const { productId, quantity } = req.body;
        const product = await Product.findById(productId);
        if (!product) return res.status(404).json({ message: 'Product not found' });

        const pricePerUnit = product.wholesalePrice || product.price;
        const subTotal = pricePerUnit * quantity;
        const gstAmount = (subTotal * (product.gstPercentage || 18)) / 100;
        const totalAmount = subTotal + gstAmount;

        const demand = await PurchaseOrder.create({
            adminId: req.user._id,
            supplierId: product.supplierId,
            productId: product._id,
            productName: product.name,
            quantity,
            pricePerUnit,
            subTotal,
            gstPercentage: product.gstPercentage || 18,
            gstAmount,
            totalAmount,
            balanceAmount: totalAmount,
            status: 'Demand'
        });

        await Notification.create({
            recipient: product.supplierId,
            sender: req.user._id,
            type: 'Demand',
            message: `Admin has requested ${quantity} units of ${product.name}. Please approve and request advance.`,
            relatedId: demand._id,
            onModel: 'PurchaseOrder'
        });

        res.status(201).json(demand);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};



const approveDemand = async (req, res) => {
    try {
        const order = await PurchaseOrder.findById(req.params.id);
        if (!order) return res.status(404).json({ message: 'Order not found' });


        if (order.supplierId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized: You are not the assigned supplier for this order' });
        }

        order.status = 'Awaiting Advance';
        await order.save();

        await Notification.create({
            recipient: order.adminId,
            sender: req.user._id,
            type: 'Approval',
            message: `Supplier has approved your demand for ${order.productName}. Please pay 30% advance (₹${(order.totalAmount * 0.3).toLocaleString()}) to start processing.`,
            relatedId: order._id,
            onModel: 'PurchaseOrder'
        });

        res.json({ message: 'Demand approved, 30% advance requested', order });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};



const processStagedPayment = async (req, res) => {
    try {
        const { orderId, razorpayPaymentId, isCash } = req.body;
        const order = await PurchaseOrder.findById(orderId);
        if (!order) return res.status(404).json({ message: 'Order not found' });

        let amountToPay = 0;
        let nextStatus = order.status;
        let stageName = "";

        if (order.status === 'Awaiting Advance') {
            amountToPay = order.totalAmount * 0.3;
            nextStatus = 'Processing';
            stageName = "30% Advance";
        } else if (order.status === 'Delivered') {
            amountToPay = order.totalAmount * 0.4;
            nextStatus = 'Partially Paid';
            stageName = "40% Mid-Payment";

            const dueDate = new Date();
            dueDate.setMonth(dueDate.getMonth() + 1);
            order.dueDate = dueDate;
        } else if (order.status === 'Partially Paid') {
            amountToPay = order.balanceAmount;
            nextStatus = 'Completed';
            stageName = "Final 30% Payment";
        } else {
            return res.status(400).json({ message: `Payment not required for current status: ${order.status}` });
        }

        order.paidAmount += amountToPay;
        order.balanceAmount -= amountToPay;
        order.status = nextStatus;
        if (isCash) {
            order.razorpayPaymentId = `CASH_${stageName}_${Date.now()}`;
        } else {
            order.razorpayPaymentId = razorpayPaymentId;
        }
        await order.save();

        await Notification.create({
            recipient: order.supplierId,
            sender: req.user._id,
            type: 'Payment',
            message: `Admin has paid ${stageName} (₹${amountToPay.toLocaleString()}) for order #${order._id.toString().slice(-6).toUpperCase()}. Status: ${nextStatus}.`,
            relatedId: order._id,
            onModel: 'PurchaseOrder'
        });

        res.json({ message: `${stageName} processed successfully`, order });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};



const updateDeliveryStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const order = await PurchaseOrder.findById(req.params.id);
        if (!order) return res.status(404).json({ message: 'Order not found' });


        if (order.supplierId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized: You are not the assigned supplier for this order' });
        }

        order.status = status;


        if (status === 'Delivered') {
            const product = await Product.findById(order.productId);
            if (product) {
                product.stock += order.quantity;
                await product.save();
            }

            await Notification.create({
                recipient: order.adminId,
                sender: req.user._id,
                type: 'Alert',
                message: `Your order for ${order.productName} has been DELIVERED. Inventory updated automatically. Please proceed to pay the next 40%.`,
                relatedId: order._id,
                onModel: 'PurchaseOrder'
            });
        } else {
            await Notification.create({
                recipient: order.adminId,
                sender: req.user._id,
                type: 'Alert',
                message: `Your order for ${order.productName} is now ${status.toUpperCase()}.`,
                relatedId: order._id,
                onModel: 'PurchaseOrder'
            });
        }

        await order.save();
        res.json({ message: `Status updated to ${status}`, order });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getSupplierProducts = async (req, res) => {
    try {
        const products = await Product.find({ supplierId: req.user._id });
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};



const getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ recipient: req.user._id })
            .sort({ createdAt: -1 })
            .limit(20);
        res.json(notifications);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

const markNotificationRead = async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);
        if (notification) {
            notification.isRead = true;
            await notification.save();
        }
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

const getSupplierStats = async (req, res) => {
    try {
        const supplierId = req.user._id;
        const [totalProducts, orders] = await Promise.all([
            Product.countDocuments({ supplierId }),
            PurchaseOrder.find({ supplierId })
        ]);

        const stats = {
            totalProducts,
            pendingOrders: orders.filter(o => ['Demand', 'Awaiting Advance', 'Processing', 'In Transit'].includes(o.status)).length,
            completedOrders: orders.filter(o => o.status === 'Completed').length,
            totalEarnings: orders.filter(o => ['Partially Paid', 'Completed'].includes(o.status)).reduce((sum, o) => sum + o.paidAmount, 0),
            pendingBalance: orders.reduce((sum, o) => sum + o.balanceAmount, 0)
        };

        res.json(stats);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

const getSupplierOrders = async (req, res) => {
    try {
        const orders = await PurchaseOrder.find({ supplierId: req.user._id }).sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

const getAdminPurchaseOrders = async (req, res) => {
    try {
        const orders = await PurchaseOrder.find({ adminId: req.user._id })
            .populate('supplierId', 'username companyName')
            .sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

const clearAllOrders = async (req, res) => {
    try {
        await PurchaseOrder.deleteMany({ adminId: req.user._id });
        res.json({ message: 'Replenishment Pipeline cleared' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

const clearNotifications = async (req, res) => {
    try {
        await Notification.deleteMany({ recipient: req.user._id });
        res.json({ message: 'Notifications cleared' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    createDemand,
    approveDemand,
    processStagedPayment,
    updateDeliveryStatus,
    getSupplierProducts,
    getNotifications,
    markNotificationRead,
    getSupplierStats,
    getSupplierOrders,
    getAdminPurchaseOrders,
    clearAllOrders,
    clearNotifications
};

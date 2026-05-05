const mongoose = require('mongoose');

const purchaseOrderSchema = new mongoose.Schema({
    adminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    supplierId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    productName: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    pricePerUnit: {
        type: Number,
        required: true,
        min: 0
    },
    subTotal: {
        type: Number,
        required: true,
        min: 0
    },
    gstPercentage: {
        type: Number,
        required: true,
        default: 18,
        min: 0
    },
    gstAmount: {
        type: Number,
        required: true,
        min: 0
    },
    totalAmount: {
        type: Number,
        required: true,
        min: 0
    },
    paidAmount: {
        type: Number,
        default: 0
    },
    balanceAmount: {
        type: Number,
        default: 0
    },
    dueDate: {
        type: Date
    },
    razorpayOrderId: {
        type: String
    },
    razorpayPaymentId: {
        type: String
    },
    status: {
        type: String,
        enum: ['Demand', 'Awaiting Advance', 'Processing', 'In Transit', 'Delivered', 'Partially Paid', 'Completed', 'Cancelled'],
        default: 'Demand'
    },
    stockUpdated: {
        type: Boolean,
        default: false
    },
    date: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

module.exports = mongoose.model('PurchaseOrder', purchaseOrderSchema);

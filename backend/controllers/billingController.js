const Sale = require('../models/Sale');
const Product = require('../models/Product');

exports.processCheckout = async (req, res) => {
    const { items, totalPrice, subTotal, taxAmount, customerName } = req.body;

    try {
        for (let item of items) {
            const product = await Product.findById(item.productId);
            if (!product) {
                return res.status(404).json({ message: `Product ${item.name} not found.` });
            }
            if (product.stock < item.quantity) {
                return res.status(400).json({ message: `Not enough stock for ${product.name}. Available: ${product.stock}` });
            }

            product.stock -= item.quantity;
            await product.save();
        }

        if (!req.user || !req.user._id) {
            return res.status(401).json({ message: 'Checkout: User context (req.user) is missing' });
        }

        const newSale = new Sale({
            items,
            subTotal: subTotal || totalPrice,
            taxAmount: taxAmount || 0,
            totalPrice,
            customerName: customerName || 'Walk-in Customer',
            user: req.user._id
        });

        const savedSale = await newSale.save();

        res.status(201).json({ message: 'Payment successful, stock updated', sale: savedSale });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


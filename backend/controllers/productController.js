const Product = require('../models/Product');


exports.getProducts = async (req, res) => {
    try {
        const products = await Product.find().sort({ createdAt: -1 });
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


exports.addProduct = async (req, res) => {
    try {
        const productData = { ...req.body };
        if (productData.supplierId === '') {
            delete productData.supplierId;
        }
        if (req.file) {
            productData.image = `/uploads/${req.file.filename}`;
        }
        const newProduct = new Product(productData);
        const savedProduct = await newProduct.save();
        res.status(201).json(savedProduct);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};


exports.updateProduct = async (req, res) => {
    try {
        const productData = { ...req.body };
        if (productData.supplierId === '') {
            productData.supplierId = null;
        }
        if (req.file) {
            productData.image = `/uploads/${req.file.filename}`;
        }
        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
            productData,
            { new: true, runValidators: true }
        );
        if (!updatedProduct) return res.status(404).json({ message: 'Product not found' });
        res.json(updatedProduct);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};


exports.deleteProduct = async (req, res) => {
    try {
        const deletedProduct = await Product.findByIdAndDelete(req.params.id);
        if (!deletedProduct) return res.status(404).json({ message: 'Product not found' });
        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

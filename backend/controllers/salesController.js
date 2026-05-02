const Sale = require('../models/Sale');


exports.getSales = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'User not authenticated' });
        }

        let query = {};

        if (req.user.role !== 'admin') {
            query.user = req.user._id;
        }

        const sales = await Sale.find(query).populate('user', 'username').sort({ date: -1 });
        res.json(sales);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


exports.deleteSales = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Only administrators can clear sales history' });
        }

        const { before } = req.query;
        let query = {};
        
        if (before) {
            query.date = { $lt: new Date(before) };
        }

        const result = await Sale.deleteMany(query);
        res.json({ message: `Successfully deleted ${result.deletedCount} sales records.`, deletedCount: result.deletedCount });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


exports.deleteSaleById = async (req, res) => {
    try {
        const sale = await Sale.findById(req.params.id);

        if (!sale) {
            return res.status(404).json({ message: 'Sale record not found' });
        }


        if (req.user.role !== 'admin' && sale.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to delete this record' });
        }

        await sale.deleteOne();
        res.json({ message: 'Sale record deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {

            token = req.headers.authorization.split(' ')[1];


            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'qubix_secret_key_123');


            req.user = await User.findById(decoded.id).select('-password');

            if (!req.user) {
                return res.status(401).json({ message: 'Auth: User document missing in database' });
            }

            return next();
        } catch (error) {
            console.error(error);
            return res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }
};


const admin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'Not authorized as an admin' });
    }
};


const supplier = (req, res, next) => {
    if (req.user && req.user.role === 'supplier') {
        next();
    } else {
        res.status(403).json({ message: 'Not authorized as a supplier' });
    }
};

module.exports = { protect, admin, supplier };

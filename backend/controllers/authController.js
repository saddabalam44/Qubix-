const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'qubix_secret_key_123', {
        expiresIn: '30d',
    });
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
    try {
        const { username, email, password, role } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ message: 'Please add all fields' });
        }

        const userExists = await User.findOne({ $or: [{ email }, { username }] });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const status = role === 'supplier' ? 'pending' : 'active';

        const user = await User.create({
            username,
            email,
            password,
            role: role || 'shopkeeper',
            status
        });

        if (user) {
            if (status === 'pending') {
                res.status(201).json({
                    message: 'Registration successful. Waiting for Admin approval.',
                    status: 'pending'
                });
            } else {
                res.status(201).json({
                    _id: user.id,
                    username: user.username,
                    email: user.email,
                    role: user.role,
                    token: generateToken(user._id),
                });
            }
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Register a supplier (Pending status, no password required yet)
const registerSupplier = async (req, res) => {
    try {
        const { username, email, companyName } = req.body;

        if (!username || !email) {
            return res.status(400).json({ message: 'Please add all required fields' });
        }

        const userExists = await User.findOne({ $or: [{ email }, { username }] });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Create user with a dummy password since it will be auto-generated on approval
        const user = await User.create({
            username,
            email,
            password: `PENDING_${Date.now()}`, 
            role: 'supplier',
            companyName: companyName || '',
            status: 'pending'
        });

        res.status(201).json({
            message: 'Application submitted successfully. We will notify you once approved.',
            status: 'pending'
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (user && (await user.matchPassword(password))) {
            if (user.status === 'pending') {
                return res.status(401).json({ message: 'Account pending approval by Admin' });
            }
            if (user.status === 'rejected') {
                return res.status(401).json({ message: 'Account application rejected' });
            }

            res.json({
                _id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
                token: generateToken(user._id),
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Add a shopkeeper (Admin only)
const addShopkeeper = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const userExists = await User.findOne({ $or: [{ email }, { username }] });
        if (userExists) return res.status(400).json({ message: 'User already exists' });

        const user = await User.create({
            username,
            email,
            password,
            role: 'shopkeeper'
        });

        res.status(201).json({
            _id: user.id,
            username: user.username,
            email: user.email,
            role: user.role
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all users (supports filtering by role)
const getUsers = async (req, res) => {
    try {
        const { role } = req.query;
        const query = role ? { role } : {};
        const users = await User.find(query).select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete shopkeeper
const deleteShopkeeper = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (user) {
            await user.deleteOne();
            res.json({ message: 'User removed' });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get pending suppliers for approval
const getPendingSuppliers = async (req, res) => {
    try {
        const suppliers = await User.find({ role: 'supplier', status: 'pending' }).select('-password');
        res.json(suppliers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Approve supplier and generate password
const approveSupplier = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const generatedPassword = `QUBIX_${Math.floor(1000 + Math.random() * 9000)}`;
        
        user.status = 'active';
        user.password = generatedPassword; 
        await user.save();

        // Send email with credentials using nodemailer
        const nodemailer = require('nodemailer');
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: 'Your Qubix Supplier Account is Approved!',
            text: `Hello ${user.username},\n\nYour supplier account has been approved by the Admin.\n\nHere are your login credentials:\nEmail: ${user.email}\nPassword: ${generatedPassword}\n\nPlease log in and change your password as soon as possible.\n\nRegards,\nQubix Team`
        };

        try {
            await transporter.sendMail(mailOptions);
            console.log(`Email sent successfully to ${user.email}`);
        } catch (emailError) {
            console.error("Failed to send email:", emailError);
            // We still want to return success for the approval even if email fails
        }

        res.json({ 
            message: 'Supplier approved successfully! An email has been sent to them.', 
            sharedPassword: generatedPassword,
            email: user.email
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    registerUser,
    loginUser,
    registerSupplier,
    addShopkeeper,
    getUsers,
    deleteShopkeeper,
    getPendingSuppliers,
    approveSupplier
};

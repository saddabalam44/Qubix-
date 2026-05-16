const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');


const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'qubix_secret_key_123', {
        expiresIn: '30d',
    });
};




// Create new shopkeeper or admin account
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


// Register supplier with pending status
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




// Verify user and return JWT token
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


// Admin adds a shopkeeper and sends welcome email
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


        console.log(`Attempting to send welcome email to ${email}...`);
        const nodemailer = require('nodemailer');
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: 'Welcome to Qubix - Your Shopkeeper Account',
            text: `Hello ${username},\n\nAn admin has created a shopkeeper account for you.\n\nHere are your login credentials:\nEmail: ${email}\nPassword: ${password}\n\nPlease login at ${process.env.FRONTEND_URL || 'http://localhost:5173'}/login\n\nRegards,\nQubix Team`
        };

        try {
            const info = await transporter.sendMail(mailOptions);
            console.log('Welcome email sent successfully:', info.response);
        } catch (emailError) {
            console.error("Failed to send welcome email:", emailError.message);
        }

        res.status(201).json({
            _id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
            message: 'Shopkeeper added successfully and email sent.'
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// Admin adds a supplier manually
const addSupplier = async (req, res) => {
    try {
        const { username, email, password, companyName } = req.body;
        const userExists = await User.findOne({ $or: [{ email }, { username }] });
        if (userExists) return res.status(400).json({ message: 'User already exists' });

        const user = await User.create({
            username,
            email,
            password,
            role: 'supplier',
            companyName: companyName || '',
            status: 'active'
        });


        console.log(`Attempting to send welcome email to supplier ${email}...`);
        const nodemailer = require('nodemailer');
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: 'Welcome to Qubix - Your Supplier Account',
            text: `Hello ${username},\n\nAn admin has created a supplier account for you.\n\nHere are your login credentials:\nEmail: ${email}\nPassword: ${password}\n\nPlease login at ${process.env.FRONTEND_URL || 'http://localhost:5173'}/login\n\nRegards,\nQubix Team`
        };

        try {
            const info = await transporter.sendMail(mailOptions);
            console.log('Welcome email sent successfully to supplier:', info.response);
        } catch (emailError) {
            console.error("Failed to send welcome email to supplier:", emailError.message);
        }

        res.status(201).json({
            _id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
            message: 'Supplier added successfully and email sent.'
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


const getUsers = async (req, res) => {
    try {
        const { role, status } = req.query;
        let query = {};
        if (role) query.role = role;
        if (status) query.status = status;

        const users = await User.find(query).select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


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


const getPendingSuppliers = async (req, res) => {
    try {
        const suppliers = await User.find({ role: 'supplier', status: 'pending' }).select('-password');
        res.json(suppliers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


const approveSupplier = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const generatedPassword = `QUBIX_${Math.floor(1000 + Math.random() * 9000)}`;

        user.status = 'active';
        user.password = generatedPassword;
        await user.save();


        const nodemailer = require('nodemailer');
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: 'Your Qubix Supplier Account is Approved!',
            text: `Hello ${user.username},\n\nYour supplier account has been approved by the Admin.\n\nHere are your login credentials:\nEmail: ${user.email}\nPassword: ${generatedPassword}\n\nPlease log in at ${process.env.FRONTEND_URL || 'http://localhost:5173'}/login and change your password as soon as possible.\n\nRegards,\nQubix Team`
        };

        try {
            await transporter.sendMail(mailOptions);
            console.log(`Email sent successfully to ${user.email}`);
        } catch (emailError) {
            console.error("Failed to send email:", emailError);

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
    addSupplier,
    getUsers,
    deleteShopkeeper,
    getPendingSuppliers,
    approveSupplier
};

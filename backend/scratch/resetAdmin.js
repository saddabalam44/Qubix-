const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
require('dotenv').config();

const resetAdminPassword = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to Database...');

        const admin = await User.findOne({ role: 'admin' });
        if (!admin) {
            console.log('Admin user not found!');
            process.exit(1);
        }

        admin.password = 'admin@123';
        await admin.save();
        
        console.log(`Password for admin (${admin.email}) has been reset to: admin@123`);
        process.exit(0);
    } catch (error) {
        console.error('Error resetting password:', error);
        process.exit(1);
    }
};

resetAdminPassword();

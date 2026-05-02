const mongoose = require('mongoose');
const User = require('./models/User');
const dns = require('dns');
require('dotenv').config();

dns.setServers(['8.8.8.8', '1.1.1.1']);

const seedAdmin = async () => {
  try {
    const mongoUri = process.env.MONGO_URI.includes('<db_username>')
      ? 'mongodb://127.0.0.1:27017/qubix'
      : process.env.MONGO_URI;

    await mongoose.connect(mongoUri);
    console.log('MongoDB Connected for seeding...');

    let adminUser = await User.findOne({ role: 'admin' });
    
    if (!adminUser) {
      await User.create({
        username: 'admin',
        email: 'admin@gmail.com',
        password: 'Admin@123',
        role: 'admin'
      });
      console.log('Default admin seeded successfully!');
    } else {
      adminUser.username = 'admin';
      adminUser.email = 'admin@gmail.com';
      adminUser.password = 'Admin@123';
      await adminUser.save();
      console.log('Admin credentials updated/reset successfully!');
    }

    mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error('Error seeding admin:', err);
    process.exit(1);
  }
};

seedAdmin();

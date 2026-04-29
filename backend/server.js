const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const productRoutes = require('./routes/productRoutes');
const billingRoutes = require('./routes/billingRoutes');
const salesRoutes = require('./routes/salesRoutes');
const authRoutes = require('./routes/authRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const supplierRoutes = require('./routes/supplierRoutes');
const User = require('./models/User'); // Required for admin seeding
const path = require('path'); // Required for static uploads folder

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/products', productRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/supplier', supplierRoutes);

// Static folder for product images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Use local mongo if the Atlas string still contains placeholders
const mongoUri = process.env.MONGO_URI.includes('<db_username>')
  ? 'mongodb://127.0.0.1:27017/qubix'
  : process.env.MONGO_URI;

// Database Connection
mongoose.connect(mongoUri)
  .then(async () => {
    console.log('MongoDB Connected');
    // Seed default admin if none exists
    try {

      let adminUser = await User.findOne({ role: 'admin' });
      if (!adminUser) {
        await User.create({
          username: 'admin',
          email: 'admin@gmail.com',
          password: 'admin123', // Will be hashed by pre-save hook
          role: 'admin'
        });
        console.log('Default admin seeded: admin@gmail.com / admin123');
      } else if (adminUser.email !== 'admin@gmail.com') {
        // Update old admin to new credentials
        adminUser.email = 'admin@gmail.com';
        adminUser.password = 'admin123';
        await adminUser.save();
        console.log('Admin updated to: admin@gmail.com / admin123');
      } else {
        // Force password reset to admin123 just in case
        adminUser.password = 'admin123';
        await adminUser.save();
        console.log('Admin password explicitly set to admin123 for admin@gmail.com');
      }
    } catch (err) {
      console.error('Error seeding admin:', err);
    }
  })
  .catch(err => console.error('MongoDB Connection Error:', err));

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Free the port or set a different PORT in .env.`);
    process.exit(1);
  }
  throw err;
});

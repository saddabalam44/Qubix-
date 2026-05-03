const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const dns = require('dns');
require('dotenv').config();

// Custom DNS to resolve MongoDB Atlas SRV issues

// DNS setup for MongoDB Atlas connection
dns.setServers(['8.8.8.8', '1.1.1.1']);

const productRoutes = require('./routes/productRoutes');
const billingRoutes = require('./routes/billingRoutes');
const salesRoutes = require('./routes/salesRoutes');
const authRoutes = require('./routes/authRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const supplierRoutes = require('./routes/supplierRoutes');
const User = require('./models/User');

// Initialize Express App

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
app.use(express.json());

// API Endpoints

// API Routes

app.use('/api/products', productRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/supplier', supplierRoutes);

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// MongoDB Connection Setup




// MongoDB Connection logic
const mongoUri = process.env.MONGO_URI.includes('<db_username>')
  ? 'mongodb://127.0.0.1:27017/qubix'
  : process.env.MONGO_URI;

mongoose.connect(mongoUri)
  .then(() => {
    console.log('MongoDB Connected');
  })
  .catch(err => console.error('MongoDB Connection Error:', err));

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use.`);
    process.exit(1);
  }
  throw err;
});


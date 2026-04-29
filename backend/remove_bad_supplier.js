const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const mongoUri = process.env.MONGO_URI.includes('<db_username>')
  ? 'mongodb://127.0.0.1:27017/qubix'
  : process.env.MONGO_URI;

mongoose.connect(mongoUri)
  .then(async () => {
      console.log('MongoDB Connected');
      const result = await User.deleteMany({ username: 'swati@dinenow.comSupplyCo' });
      console.log('Deleted bad supplier entry:', result);
      mongoose.disconnect();
  })
  .catch(err => {
      console.error('Error:', err);
      process.exit(1);
  });

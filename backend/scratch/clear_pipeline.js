const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const clearPipeline = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');
        
        // We use the raw collection name to avoid needing the model file
        const result = await mongoose.connection.collection('purchaseorders').deleteMany({});
        console.log(`Deleted ${result.deletedCount} orders. Pipeline cleared.`);
        
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
};

clearPipeline();

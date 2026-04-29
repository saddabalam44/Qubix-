const axios = require('axios');

async function testShopkeeperAdd() {
    try {
        const tokenRes = await axios.post('http://localhost:5000/api/auth/login', {
            email: 'admin@gmail.com',
            password: 'admin123'
        });
        const token = tokenRes.data.token;

        // 1. Fetch all users to find if this one exists
        const usersRes = await axios.get('http://localhost:5000/api/auth/users', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const existingInfo = usersRes.data.find(u => u.email === 'saddabalam71@gmail.com');
        if (existingInfo) {
            console.log("User found. Deleting old user first...");
            await axios.delete(`http://localhost:5000/api/auth/${existingInfo._id}`, {
                 headers: { 'Authorization': `Bearer ${token}` }
            });
        }

        // 2. Admin adds the requested shopkeeper
        console.log("Attempting to add shopkeeper 'saddab alam'...");
        const res = await axios.post('http://localhost:5000/api/auth/add-shopkeeper', {
            username: 'saddab alam',
            email: 'saddabalam71@gmail.com',
            password: '12345'
        }, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        console.log('Success! API responded with:', res.data);
        console.log('An email should have been dispatched correctly.');
    } catch (e) {
        console.error('Error adding shopkeeper:', e.response ? e.response.data : e.message);
    }
}

testShopkeeperAdd();

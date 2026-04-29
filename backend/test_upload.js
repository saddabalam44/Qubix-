const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const path = require('path');

async function testUpload() {
    try {
        const tokenRes = await axios.post('http://localhost:5000/api/auth/login', {
            email: 'admin@gmail.com',
            password: 'admin123'
        });
        const token = tokenRes.data.token;

        const form = new FormData();
        form.append('name', 'Test Product');
        form.append('price', '100');
        form.append('stock', '10');
        form.append('lowStockThreshold', '2');
        
        // create a dummy file
        fs.writeFileSync('dummy.jpg', 'fake image content');
        form.append('image', fs.createReadStream('dummy.jpg'));

        try {
            const res = await axios.post('http://localhost:5000/api/products', form, {
                headers: {
                    ...form.getHeaders(),
                    'Authorization': `Bearer ${token}`
                }
            });
            console.log('Success:', res.data);
        } catch (postErr) {
            console.error('Post Error Response:', postErr.response ? postErr.response.data : postErr.message);
        }

    } catch (e) {
        console.error('Login error:', e.message);
    }
}

testUpload();

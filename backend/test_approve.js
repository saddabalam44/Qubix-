const axios = require('axios');

async function testApprove() {
    try {
        // 1. Login as admin
        const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
            email: 'admin@gmail.com',
            password: 'admin123'
        });
        const token = loginRes.data.token;
        console.log('Logged in, got token.');

        // 2. Get pending suppliers
        const pendingRes = await axios.get('http://localhost:5000/api/auth/pending-suppliers', {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        const suppliers = pendingRes.data;
        if (suppliers.length === 0) {
            console.log('No pending suppliers to test with.');
            return;
        }

        const supplierToApprove = suppliers[0];
        console.log(`Approving supplier: ${supplierToApprove.username} (${supplierToApprove._id})`);

        // 3. Approve supplier
        const approveRes = await axios.put(`http://localhost:5000/api/auth/supplier-status/${supplierToApprove._id}`, 
        { status: 'active' }, 
        {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log('Approve response:', approveRes.status, approveRes.data);

    } catch (err) {
        if (err.response) {
            console.error('Request failed with status:', err.response.status);
            console.error('Data:', err.response.data);
        } else {
            console.error('Error:', err.message);
        }
    }
}

testApprove();

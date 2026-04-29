const axios = require('axios');

async function testRegister() {
    try {
        const res = await axios.post('http://localhost:5000/api/auth/register-supplier', {
            username: 'testuser123',
            email: 'test12345@gmail.com',
            companyName: 'Test Company'
        });
        console.log('Success:', res.status, res.data);
    } catch (err) {
        if (err.response) {
            console.error('Error status:', err.response.status);
            console.error('Error data:', err.response.data);
        } else {
            console.error('Network Error / Server failed to respond:', err.message);
        }
    }
}
testRegister();

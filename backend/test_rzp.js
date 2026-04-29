const Razorpay = require('razorpay');

const razorpay = new Razorpay({
    key_id: 'rzp_test_SZ3nPRfCb0Nmy6',
    key_secret: 'tyhX7r4GTNmzdyeETgoe2XNX',
});

const options = {
    amount: 50000, 
    currency: "INR",
    receipt: `receipt_${Date.now()}`,
};

razorpay.orders.create(options)
    .then(order => console.log('Order:', order))
    .catch(err => console.error('Error:', err));


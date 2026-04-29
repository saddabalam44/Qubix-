require('dotenv').config();
const nodemailer = require('nodemailer');

async function testEmail() {
    console.log("Testing with User:", process.env.EMAIL_USER);
    console.log("Testing with Pass length:", process.env.EMAIL_PASS ? process.env.EMAIL_PASS.length : 0);

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: process.env.EMAIL_USER, // send to self
        subject: 'Test Email from Node',
        text: 'This is a test email to verify credentials.'
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log("Mail sent successfully!");
    } catch (e) {
        console.error("Mail failed:", e);
    }
}

testEmail();

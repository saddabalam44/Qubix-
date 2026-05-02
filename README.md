# Qubix - An Advance Billing System

Qubix is a state-of-the-art billing and inventory management solution designed for modern retail environments. It provides a seamless interface for managing products, tracking inventory levels, handling supplier relations, and processing customer transactions with integrated digital payments.

## 🚀 Key Features

### 📦 Inventory Management
- **SKU Tracking**: Manage a global catalog of products with detailed SKU records.
- **Low Stock Alerts**: Real-time monitoring with automated visual cues for low-stock items.
- **Replenishment Pipeline**: Streamlined workflow to request stock from suppliers when levels are critical.

### 💳 Advanced Billing System
- **Digital Cart**: Intuitive cart management for fast checkouts.
- **Integrated Payments**: Support for Razorpay digital payments and traditional cash transactions.
- **Automated Tax Calculation**: Built-in GST calculation for accurate billing.
- **PDF Invoicing**: Instant professional receipt generation for customers.

### 🤝 Supplier Ecosystem
- **Staged Payments**: Professional 30-40-30 payment structure (Advance, Mid-Payment, Final).
- **Merchant Management**: Add, approve, and manage supplier profiles.
- **Supply Notifications**: Real-time alerts for demand requests and delivery status updates.

### 🛡️ Security & Roles
- **Multi-Role Access**: Dedicated dashboards for Admins, Shopkeepers, and Suppliers.
- **JWT Authentication**: Secure session management using JSON Web Tokens.
- **Automated Onboarding**: Welcome emails with credentials for new staff and partners.

## 🛠️ Tech Stack

- **Frontend**: React.js, Vite, Lucide-React, CSS3 (Vanilla)
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Mongoose)
- **Email**: Nodemailer (Gmail SMTP)
- **Payments**: Razorpay API
- **Documents**: jsPDF

## ⚙️ Installation

### 1. Prerequisites
- Node.js (v16+)
- MongoDB (Local or Atlas)
- Razorpay API Keys

### 2. Clone the Repository
```bash
git clone https://github.com/saddabalam44/Qubix-An-Advance-Billing-System.git
cd Qubix-An-Advance-Billing-System
```

### 3. Backend Configuration
Navigate to the `backend` folder and create a `.env` file:
```env
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret_key
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_gmail_app_password
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
```
Install dependencies and seed the admin:
```bash
cd backend
npm install
npm run seed
npm run dev
```

### 4. Frontend Configuration
Navigate to the `frontend` folder:
```bash
cd ../frontend
npm install
npm run dev
```

## 📂 Project Structure

```text
├── backend/
│   ├── controllers/      # Logic for routes
│   ├── models/           # Mongoose schemas
│   ├── routes/           # API endpoints
│   ├── middleware/       # Auth and Upload logic
│   └── uploads/          # Local storage for product images
└── frontend/
    ├── src/
    │   ├── pages/        # Main dashboard and feature views
    │   ├── components/   # Reusable UI elements
    │   ├── utils/        # PDF and helper functions
    │   └── assets/       # Styles and static files
```

## 📄 License
This project is licensed under the MIT License.

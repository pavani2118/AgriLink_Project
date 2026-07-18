
```
<div align="center">

# 🌱 AgriLink

## Connecting Farmers and Buyers Seamlessly

A full-stack mobile marketplace that connects local farmers, vendors, and buyers through a digital platform. AgriLink enables users to purchase fresh agricultural products directly from vendors while providing farmers with tools to manage products, orders, and customer interactions efficiently.

[![React Native](https://img.shields.io/badge/React%20Native-Mobile%20App-61DAFB?style=for-the-badge&logo=react)](https://reactnative.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-Backend-339933?style=for-the-badge&logo=node.js)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Database-47A248?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/)
[![Socket.io](https://img.shields.io/badge/Socket.io-Realtime-010101?style=for-the-badge&logo=socket.io)](https://socket.io/)

</div>

---

# 📖 About The Project

**AgriLink** is a full-stack mobile application developed to bridge the gap between farmers and customers by providing a direct marketplace for fresh agricultural products.

The platform allows buyers to discover, purchase, and track agricultural products while enabling farmers and vendors to manage their products, inventory, orders, and customer communication.

The system focuses on reducing dependency on intermediaries, supporting local farmers, minimizing food waste through surplus product selling, and creating a convenient digital marketplace.

---

# 🎯 Objectives

- Provide a direct connection between farmers and buyers.
- Enable farmers to sell agricultural products digitally.
- Improve product visibility and customer accessibility.
- Provide real-time communication between users.
- Support efficient order and inventory management.

---

# ✨ Key Features

## 🛒 Buyer Features

- User registration and secure login
- Browse agricultural products
- Search and filter products
- Add products to cart
- Place orders
- Secure checkout process
- Track order status
- Chat with vendors in real time
- Rate and review products/vendors
- Receive notifications


## 🌾 Vendor Features

- Vendor account management
- Add, update, and remove products
- Manage product inventory
- Apply discounts for surplus products
- Accept or reject customer orders
- Track sales activities
- Communicate with buyers through real-time chat


## ⚙️ System Features

- JWT-based authentication
- Role-based access control
- Real-time messaging using Socket.io
- Push notifications
- Secure payment integration
- Responsive mobile interface
- Database-driven architecture

---

# 🏗️ System Architecture

```

```
            Mobile Application
             (React Native)
                   |
                   |
            REST API Requests
                   |
                   |
          Node.js + Express API
                   |
    --------------------------------
    |                              |
MongoDB Database              Socket.io
    |                              |
```

Data Management             Real-time Chat

```

---

# 🛠️ Technology Stack

## Frontend

- React Native
- React Navigation
- Axios
- AsyncStorage
- Socket.io Client


## Backend

- Node.js
- Express.js
- REST APIs
- Socket.io
- JWT Authentication
- bcrypt


## Database

- MongoDB
- Mongoose ODM


## Other Tools

- Git
- GitHub
- Postman
- Stripe Payment Gateway

---

# 📂 Project Structure

```

AgriLink/

│
├── frontend/
│   ├── screens/
│   ├── components/
│   ├── navigation/
│   ├── services/
│   └── App.js
│
├── backend/
│   ├── models/
│   ├── routes/
│   ├── controllers/
│   ├── middleware/
│   └── server.js
│
└── README.md

````

---

# 🔐 Security Features

- Password encryption using bcrypt
- JWT authentication
- Protected API routes
- User role validation
- Input validation
- Secure environment configuration

---

# 🚀 Installation Guide

## Prerequisites

Install:

- Node.js
- MongoDB
- React Native development environment


## Clone Repository

```bash
git clone https://github.com/yourusername/agrilink.git

cd agrilink
````

---

## Backend Setup

```bash
cd backend

npm install
```

Create `.env` file:

```env
PORT=5000

MONGODB_URI=your_mongodb_connection

JWT_SECRET=your_secret_key

STRIPE_SECRET_KEY=your_payment_key
```

Run backend:

```bash
npm start
```

---

## Mobile Application Setup

```bash
cd frontend

npm install
```

Run application:

```bash
npx react-native run-android
```

---

# 📡 API Modules

## Authentication

* User Registration
* User Login
* Profile Management

## Products

* Create Products
* Update Products
* Delete Products
* Browse Products

## Orders

* Create Orders
* Manage Orders
* Update Order Status

## Communication

* Real-time Chat
* Notifications

---

# 👩‍💻 My Contributions

**Role: Backend Developer**

Responsibilities:

* Designed and developed backend REST APIs.
* Implemented authentication and authorization.
* Designed MongoDB database models.
* Developed product and order management APIs.
* Integrated Socket.io for real-time communication.
* Implemented backend validation and security features.
* Tested APIs using Postman.
* Collaborated with team members using Git and GitHub.


---

# 🔮 Future Improvements

* AI-based crop price prediction
* Delivery partner integration
* Advanced analytics dashboard
* Weather-based farming recommendations
* Online farming support services

---

# 👥 Team

Developed by:

**IT Undergraduate Students Group 7**

University of Vavuniya

---

# 📄 License

This project is licensed under the MIT License.

---

<div align="center">

🌱 **AgriLink — Connecting Farmers and Buyers Seamlessly**

Built with ❤️ using React Native, Node.js, and MongoDB

</div>
```

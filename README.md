<div align="center">

# 🌱 AgriLink

### Connecting Farmers and Buyers Seamlessly

A full-stack mobile marketplace that connects farmers, vendors, and buyers through a single digital platform — enabling customers to purchase fresh agricultural products directly from local vendors, while giving farmers the tools to manage products, orders, and customer relationships efficiently.

[![React Native](https://img.shields.io/badge/React%20Native-Mobile%20App-61DAFB?style=flat-square&logo=react)](https://reactnative.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-Backend-339933?style=flat-square&logo=node.js)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express.js-REST%20API-000000?style=flat-square&logo=express)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Database-47A248?style=flat-square&logo=mongodb)](https://www.mongodb.com/)
[![Socket.io](https://img.shields.io/badge/Socket.io-Realtime-010101?style=flat-square&logo=socket.io)](https://socket.io/)
[![Stripe](https://img.shields.io/badge/Stripe-Payments-635BFF?style=flat-square&logo=stripe)](https://stripe.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)

[About](#-about-the-project) •
[Features](#-key-features) •
[Tech Stack](#-technology-stack) •
[Architecture](#️-system-architecture) •
[Installation](#-installation-guide) •
[Modules](#-main-modules) •
[Contributions](#-my-contributions) •
[Team](#-team)

</div>

---

## 📖 About The Project

**AgriLink** was developed to create a direct connection between farmers and customers by providing an online marketplace for fresh vegetables, fruits, and surplus agricultural produce — cutting out unnecessary middlemen and reducing food waste along the way.

The platform supports two distinct user roles, each with a tailored experience:

<table>
<tr>
<td width="50%" valign="top">

### 🛒 Buyers
- Browse agricultural products
- Search and filter items
- Add products to cart
- Place and track orders
- Chat with vendors in real time
- Give ratings and reviews

</td>
<td width="50%" valign="top">

### 🌾 Vendors
- Manage product listings
- Update inventory in real time
- Handle and fulfill customer orders
- List surplus products at a discount
- Communicate directly with buyers

</td>
</tr>
</table>

---

## ✨ Key Features

### Buyer Features
- ✅ Secure user registration and login
- ✅ Product browsing and search
- ✅ Shopping cart management
- ✅ Secure checkout
- ✅ Order tracking
- ✅ Real-time chat with vendors
- ✅ Product ratings and reviews
- ✅ Push notifications

### Vendor Features
- ✅ Vendor profile management
- ✅ Add, update, and delete products
- ✅ Inventory management
- ✅ Order management
- ✅ Discount and surplus stock management
- ✅ Real-time communication with buyers

### System Features
- ✅ JWT-based authentication
- ✅ Role-based access control (Buyer / Vendor)
- ✅ Real-time messaging via Socket.io
- ✅ Secure payment integration
- ✅ Responsive mobile interface

---

## 🛠 Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React Native, React Navigation, Axios, AsyncStorage, Socket.io Client |
| **Backend** | Node.js, Express.js, REST APIs, Socket.io, JWT Authentication, bcrypt |
| **Database** | MongoDB, Mongoose ODM |
| **Payments** | Stripe Payment Gateway |
| **Tools** | Git, GitHub, Postman |

---

## 🏗️ System Architecture

```
                React Native Mobile Application
                              │
                              │  REST API Requests
                              ▼
                Node.js + Express.js Backend
                              │
                ┌─────────────┴─────────────┐
                ▼                           ▼
          MongoDB Database          Socket.io (Real-Time Chat
      (Users, Products, Orders)      & Live Notifications)
```

---

## 📂 Project Structure

```
AgriLink/
│
├── frontend/                  # React Native mobile application
│   ├── screens/                # App screens (Home, Cart, Chat, Orders, etc.)
│   ├── components/             # Reusable UI components
│   ├── navigation/              # Navigation configuration
│   └── App.js                  # App entry point
│
├── backend/                   # Node.js + Express REST API
│   ├── models/                  # Mongoose database schemas
│   ├── routes/                   # API route definitions
│   ├── controllers/               # Business logic
│   ├── middleware/                 # Auth & validation middleware
│   └── server.js                  # Server entry point
│
└── README.md
```

---

## 🚀 Installation Guide

### Prerequisites
- [Node.js](https://nodejs.org/) v14+
- [MongoDB](https://www.mongodb.com/) (local or [Atlas](https://www.mongodb.com/cloud/atlas))
- [React Native environment](https://reactnative.dev/docs/environment-setup)

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/agrilink.git
cd agrilink
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file inside `/backend`:

```env
PORT=5000
MONGODB_URI=your_database_connection
JWT_SECRET=your_secret_key
STRIPE_SECRET_KEY=your_payment_key
```

Run the backend server:

```bash
npm start
```

### 3. Frontend Setup

```bash
cd frontend
npm install
```

Run the application:

```bash
npx react-native run-android
# or
npx react-native run-ios
```

---

## 📡 Main Modules

<details>
<summary><b>🔐 Authentication</b></summary>
<br>

- User registration
- Login system
- JWT authentication
- Profile management

</details>

<details>
<summary><b>🛍️ Product Management</b></summary>
<br>

- Add products
- Update products
- Delete products
- Search and filter products

</details>

<details>
<summary><b>📦 Order Management</b></summary>
<br>

- Place orders
- Manage and update orders
- Track order status in real time

</details>

<details>
<summary><b>💬 Communication</b></summary>
<br>

- Real-time chat between buyers and vendors
- Instant notifications
- Order status updates

</details>

---

## 👩‍💻 My Contributions

**Role:** Backend Developer

- Developed REST APIs using Node.js and Express.js
- Designed MongoDB database models and schema relationships
- Implemented JWT-based authentication and authorization
- Developed product and order management APIs
- Integrated Socket.io for real-time buyer–vendor communication
- Implemented request validation and backend security measures
- Tested APIs using Postman
- Collaborated with the team using Git and GitHub

---

## 🔐 Security Features

- 🔒 Password encryption using bcrypt
- 🔒 JWT-based authentication
- 🔒 Protected API routes
- 🔒 Role-based authorization
- 🔒 Secure environment variables
- 🔒 Input validation on all endpoints

---

## 🔮 Future Improvements

- [ ] AI-based crop price prediction
- [ ] Delivery partner integration
- [ ] Advanced analytics dashboard
- [ ] Weather-based farming recommendations
- [ ] Smart farming solutions

---

## 👥 Team

Developed by:

**IT Undergraduate Students**
University of Vavuniya

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

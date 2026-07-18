<div align="center">

# 🌱 AgriLink

### Connecting Farmers and Buyers Seamlessly

A modern mobile marketplace that connects buyers directly with local farmers and vendors — fresh vegetables, fruits, and surplus produce at unbeatable prices, with real-time chat, live order tracking, and secure payments.

[![React Native](https://img.shields.io/badge/React%20Native-0.72-61DAFB?style=flat-square&logo=react)](https://reactnative.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-14%2B-339933?style=flat-square&logo=node.js)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Database-47A248?style=flat-square&logo=mongodb)](https://www.mongodb.com/)
[![Socket.io](https://img.shields.io/badge/Socket.io-Realtime-010101?style=flat-square&logo=socket.io)](https://socket.io/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](CONTRIBUTING.md)

[Features](#-features) •
[Screenshots](#-screenshots) •
[Tech Stack](#-tech-stack) •
[Getting Started](#-getting-started) •
[API Reference](#-api-reference) •
[Contributing](#-contributing)

</div>

---

## 📖 About

**AgriLink** is a full-stack mobile marketplace built with **React Native** and **Node.js** that lets buyers purchase fresh produce directly from vendors, while giving vendors an easy way to list, manage, and sell their goods — including surplus stock at discounted prices to reduce food waste.

Built for two types of users:
- 🛒 **Buyers** — browse, chat, order, track delivery, and rate vendors
- 🏪 **Vendors** — list products, manage orders in real time, and grow their business

## ✨ Features

<table>
<tr>
<td width="50%">

### 🛍️ For Buyers
- Browse fresh produce by category
- Search & filter products
- Add to cart with live pricing
- Real-time chat with vendors
- Secure checkout & payments
- Live order & delivery tracking
- Rate & review vendors
- Push notifications

</td>
<td width="50%">

### 🏪 For Vendors
- Vendor dashboard & analytics
- Add / edit / delete products
- Manage inventory & discounts
- Accept or reject orders
- Real-time chat with buyers
- Automatic order notifications
- Profile & business management

</td>
</tr>
</table>

### 🎨 Experience
- 🌗 **Dark & Light mode** with smooth theming
- 💬 **Real-time chat** powered by Socket.io
- 🔔 **Instant notifications** for both buyers and vendors

## 🛠 Tech Stack

**Frontend**
- [React Native](https://reactnative.dev/) — cross-platform mobile framework
- [React Navigation](https://reactnavigation.org/) — routing & navigation
- [Socket.io Client](https://socket.io/) — real-time communication
- [Axios](https://axios-http.com/) — HTTP client
- [AsyncStorage](https://react-native-async-storage.github.io/async-storage/) — local persistence

**Backend**
- [Node.js](https://nodejs.org/) + [Express](https://expressjs.com/) — REST API
- [MongoDB](https://www.mongodb.com/) + [Mongoose](https://mongoosejs.com/) — database & ODM
- [Socket.io](https://socket.io/) — real-time server
- [JWT](https://jwt.io/) + [bcrypt](https://www.npmjs.com/package/bcryptjs) — authentication & security
- [Stripe](https://stripe.com/) — payment processing

## 📂 Project Structure

```
agrilink-app/
├── frontend/               # React Native mobile app
│   ├── App.js              # Navigation, theming, context providers
│   ├── screens/            # All app screens (Home, Cart, Chat, etc.)
│   ├── utils/               # API client & Socket.io service
│   └── package.json
│
├── backend/                # Node.js + Express API
│   ├── server.js           # Entry point + Socket.io setup
│   ├── models/              # Mongoose schemas
│   ├── routes/               # API route handlers
│   ├── middleware/           # Auth middleware
│   └── package.json
│
└── docs/                   # Additional documentation
```

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed:

| Tool | Version |
|------|---------|
| [Node.js](https://nodejs.org/) | v14 or higher |
| [MongoDB](https://www.mongodb.com/try/download/community) | Local or [Atlas](https://www.mongodb.com/cloud/atlas) |
| [React Native environment](https://reactnative.dev/docs/environment-setup) | Latest |

### Installation

**1. Clone the repository**
```bash
git clone https://github.com/your-username/agrilink-app.git
cd agrilink-app
```

**2. Set up the backend**
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
npm run dev
```

**3. Set up the frontend**
```bash
cd ../frontend
npm install

# iOS only
cd ios && pod install && cd ..

npx react-native run-ios      # for iOS
npx react-native run-android  # for Android
```

> 📘 For a full walkthrough, see [`INSTALLATION.md`](INSTALLATION.md) or the 5-minute [`QUICKSTART.md`](QUICKSTART.md).

### Environment Variables

Create a `.env` file inside `/backend`:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/agrilink
JWT_SECRET=your_jwt_secret_key
STRIPE_SECRET_KEY=your_stripe_secret_key
CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

## 📡 API Reference

<details>
<summary><b>Authentication</b></summary>

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/register` | Register a new buyer or vendor |
| `POST` | `/api/auth/login` | Log in and receive a JWT |
| `GET` | `/api/auth/profile` | Get the authenticated user's profile |
| `PUT` | `/api/auth/profile` | Update profile details |

</details>

<details>
<summary><b>Products</b></summary>

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/products` | List all products (supports filters) |
| `GET` | `/api/products/:id` | Get a single product |
| `POST` | `/api/products` | Create a product *(vendor only)* |
| `PUT` | `/api/products/:id` | Update a product *(vendor only)* |
| `DELETE` | `/api/products/:id` | Remove a product *(vendor only)* |

</details>

<details>
<summary><b>Orders</b></summary>

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/orders` | Place a new order |
| `GET` | `/api/orders` | Get orders for the current user |
| `GET` | `/api/orders/:id` | Get order details |
| `PUT` | `/api/orders/:id/status` | Update order status *(vendor only)* |
| `PUT` | `/api/orders/:id/rate` | Rate a completed order *(buyer only)* |

</details>

<details>
<summary><b>Chat & Notifications</b></summary>

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/chat` | Get all conversations |
| `GET` | `/api/chat/:id` | Get messages in a conversation |
| `POST` | `/api/chat` | Start or fetch a conversation |
| `GET` | `/api/notifications` | Get notifications |
| `PUT` | `/api/notifications/:id/read` | Mark a notification as read |

</details>

### Socket.io Events

| Event | Direction | Description |
|-------|-----------|--------------|
| `join` | Client → Server | Join a user-specific room |
| `sendMessage` | Client → Server | Send a chat message |
| `receiveMessage` | Server → Client | Receive a new chat message |
| `orderUpdate` | Client → Server | Update order status |
| `orderStatusUpdate` | Server → Client | Notify of order status change |
| `notification` | Server → Client | Push a real-time notification |

<div align="center">

Built with ❤️ for fresh produce enthusiasts

**🌱 AgriLink — Connecting Farmers and Buyers Seamlessly 🌱**

</div>

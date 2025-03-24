# Flash Sale Management And Fraud Detection System

A high-performance, real-time flash sale management system built with Node.js, Express, MongoDB, and WebSocket technology, leveraging Clean Architecture, SOLID principles, Domain-Driven Design (DDD) and Test-Driven Development (TDD) methodologies.

# Overview

This project implements a real-time flash sale system that allows users to purchase products during limited-time sale events. The system ensures accurate inventory management, real-time stock updates, background cron job running, redis distributed lock mechanism and robust security measures to prevent fraud and over-purchasing. It also includes a leaderboard API to track successful purchases and a WebSocket-based real-time update system for stock changes.

## Table of Contents

- [Key Features](#key-features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
  - [Starting the Server](#starting-the-server)
  - [API Endpoints](#api-endpoints)
- [Documentation](#documentation)
  - [API Documentation](#api-documentation)
- [WebSocket Testing Guide](#webSocket-testing-guide)
- [Technical Implementation](#technical-implementation)
- [Nice-to-Have Features (Planned)](#nice-to-have-features-planned)
- [Development Challenges](#development-challenges)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

# Key-Features

1 \*\* Real-Time Flash Sale Simulation:

- Products are available for purchase with a limited stock (e.g., 200 units).
- Real-time updates of remaining stock using WebSocket.
- Time-restricted sales with predefined start and end times.
- Inventory resets for multiple sale events within a month.

2 \*\* Leaderboard API:

- Fetch a list of users who successfully purchased the product, sorted by purchase time.
- Efficient querying even under high database loads.
- Advanced Error Handling & System Robustness:
- racefully reject purchases when stock runs out.
- Prevent users from bypassing sale timing restrictions.

3 \*\* Security Measures:

- Prevent fraudulent transactions.
- Limit the number of units a user can purchase per transaction.
- Authentication for API access.

Bonus Enhancements:

- Redis Caching: Improve query performance at scale.
- Concurrency Control: Handle race conditions using distributed locking.
- Mongoose Atomicity: Ensure accurate stock decrements using atomic operations.
- Fraud Detection: Implement rate limiting and IP-based restrictions.

# Prerequisites

- Node.js: Ensure you have Node.js installed (version 14.x or higher recommended)
- WebSocket Client: For testing real-time updates (e.g., Postman or a custom client).
- TypeScript: Knowledge of TypeScript.
- MongoDB: A running MongoDB instance for data storage.
- Redis: A running Redis instance for caching and distributed locking.

# Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/IgnatiusFrancis/Flash-Sale-System.git

   ```

# Install dependencies:

npm install

# Configuration

Create a .env file in the root directory and configure the following environment variables:

```env
# MongoDB Configuration
MONGO_URL=mongodb://user:pass@localhost:27017/db

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD="provide if you are using cloud"
REDIS_LOCK_KEY="your redis lock key which could be anything"

# Server Configuration
PORT="5050"

# JWT Configuration
SECRET_KEY="your_jwt_secret_key"

```

# Usage

## Starting the Server

To start the API server, run the following command:

```bash
# Development mode (auto-restarts on file changes)
$ npm run dev

# Production mode
$ npm run prod

```

# Documentation

## API Documentation

Postman Collection: Link to Postman Collection [API Documentation](https://www.postman.com/planetary-trinity-671710/flashsale/overview)

## integration Tests

Located in the test folder with separate directories for each module:

```bash
# This runs all the tests in test folder
npm run test:e2e

```

## **Testing Guide for Flash Sale System**

This guide will walk you through testing the application as both an **admin** and a **customer**. Follow these steps to simulate real-world scenarios and ensure all features work as expected.

### **Step 1: Create Users**

#### **1.1 Create an Admin Account**

- Use the `localhost:5050/api/signup` endpoint to create an admin account.
- Include the `role` field with the value `admin`.

**Request**:

```bash
POST /signup
Content-Type: application/json

{
  "name": "Admin User",
  "email": "admin@example.com",
  "password": "admin123",
  "role": "admin"
}
```

**Response**:

```json
{
  "id": "67c63fc7c0d12fec440ba617",
  "name": "Admin User",
  "email": "admin@example.com",
  "role": "admin"
}
```

#### **1.2 Create Customer Accounts**

- Use the `localhost:5050/api/signup` endpoint to create customer accounts.
- Omit the `role` field (defaults to `customer`).

**Request**:

```bash
POST /signup
Content-Type: application/json

{
  "name": "Customer 1",
  "email": "customer1@example.com",
  "password": "customer123"
}
```

**Response**:

```json
{
  "id": "67c63fc7c0d12fec440ba618",
  "name": "Customer 1",
  "email": "customer1@example.com",
  "role": "customer"
}
```

Repeat this step to create 2-3 customer accounts.

---

### **Step 2: Authenticate Users**

- Use the `localhost:5050/api/signin` endpoint to authenticate users and obtain a JWT token.

**Request**:

```bash
POST localhost:5050/api/signin
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "admin123"
}
```

**Response**:

```json
{
  "user": {
    "name": "abc",
    "email": "abc@gmail.com",
    "role": "admin"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9"
}
```

Save the token for subsequent requests.

---

### **Step 3: Admin Creates a Product**

- Only admins can create products. Use the `/create-product` endpoint.

**Request**:

```bash
POST /create-product
Content-Type: application/json
Authorization: Bearer <admin_token>

{
  "name": "Smartphone",
  "description": "Latest model with 128GB storage",
  "price": 599.99
}
```

**Response**:

```json
{
  "id": "67c63fc7c0d12fec440ba619",
  "name": "Smartphone",
  "description": "Latest model with 128GB storage",
  "price": 599.99
}
```

---

### **Step 4: Admin Creates a Flash Sale**

- Only admins can create flash sales. Use the `/flash-sale` endpoint.

**Request**:

```bash
POST /create-flash-sale
Content-Type: application/json
Authorization: Bearer <admin_token>

{
  "productId": "67c63fc7c0d12fec440ba619",
  "startTime": "2025-03-04T12:00:00Z",
  "endTime": "2025-03-04T14:00:00Z",
  "discount": 20
}
```

**Response**:

```json
{
  "id": "67c63fc7c0d12fec440ba620",
  "productId": "67c63fc7c0d12fec440ba619",
  "startTime": "2025-03-04T12:00:00Z",
  "endTime": "2025-03-04T14:00:00Z",
  "discount": 20,
  "status": "pending"
}
```

---

### **Step 5: Customers Connect to WebSocket**

- Customers must connect to the WebSocket server to receive real-time updates.
- Use a WebSocket client (e.g., Postman or WebSocket King).

**WebSocket URL**:

```
ws://localhost:5050
```

**Headers**:

- Add the JWT token for authentication:
  ```json
  {
    "Authorization": "Bearer <customer_token>"
  }
  ```

---

### **Step 6: Join a Flash Sale Room**

- After connecting to the WebSocket, customers must join a specific flash sale room to receive updates.

**Event**:

```json
{
  "event": "joinFlashSale",
  "data": {
    "flashSaleId": "67c63fc7c0d12fec440ba620"
  }
}
```

---

### **Step 7: Listen for Real-Time Updates**

- Customers should listen for the following events:

#### **7.1 `stockUpdate`**

- Provides real-time updates on available stock.

**Example**:

```json
{
  "event": "stockUpdate",
  "data": {
    "flashSaleId": "67c63fc7c0d12fec440ba620",
    "availableUnits": 199
  }
}
```

#### **7.2 `flashSaleStarted`**

- Notifies customers when the flash sale starts.

**Example**:

```json
{
  "event": "flashSaleStarted",
  "data": {
    "flashSaleId": "67c63fc7c0d12fec440ba620"
  }
}
```

#### **7.3 `flashSaleEnded`**

- Notifies customers when the flash sale ends.

**Example**:

```json
{
  "event": "flashSaleEnded",
  "data": {
    "flashSaleId": "67c63fc7c0d12fec440ba620",
    "reason": "sold-out" // or "time-ended"
  }
}
```

#### **7.4 `error`**

- Handles errors (e.g., invalid token, unauthorized access).

**Example**:

```json
{
  "event": "error",
  "data": {
    "message": "Unauthorized access",
    "code": "UNAUTHORIZED"
  }
}
```

---

### **Step 8: Customers Purchase Products**

- Customers can purchase products during the flash sale.

**Request**:

```bash
POST /purchase-product
Content-Type: application/json
Authorization: Bearer <customer_token>

{
  "flashSaleId": "67c63fc7c0d12fec440ba620",
  "quantity": 1
}
```

**Response**:

```json
{
  "id": "67c63fc7c0d12fec440ba621",
  "userId": "67c63fc7c0d12fec440ba618",
  "flashSaleId": "67c63fc7c0d12fec440ba620",
  "quantity": 1,
  "purchasedAt": "2025-03-04T12:05:00Z"
}
```

---

### **Step 9: Admin Views Leaderboard**

- Only admins can view the leaderboard.

**Request**:

```bash
GET /leaderboard?flashSaleId=67c63fc7c0d12fec440ba620
Authorization: Bearer <admin_token>
```

**Response**:

```json
[
  {
    "rank": 1,
    "name": "customer1",
    "email": "customer1@gmail.com",
    "totalPurchases": 29,
    "userId": "67c640adc0d12fec4"
  },
  {
    "rank": 1,
    "name": "customer2",
    "email": "customer2@gmail.com",
    "totalPurchases": 29,
    "userId": "67c640adc0d12fec4"
  }
]
```

---

### **Step 10: Leave a Flash Sale Room**

- Customers can leave a flash sale room when they no longer want updates.

**Event**:

```json
{
  "event": "leaveFlashSale",
  "data": {
    "flashSaleId": "67c63fc7c0d12fec440ba620"
  }
}
```

---

### **Summary of WebSocket Events**

| Event              | Description                                 |
| ------------------ | ------------------------------------------- |
| `joinFlashSale`    | Join a specific flash sale room.            |
| `leaveFlashSale`   | Leave a specific flash sale room.           |
| `stockUpdate`      | Real-time updates on available stock.       |
| `flashSaleStarted` | Notification when the flash sale starts.    |
| `flashSaleEnded`   | Notification when the flash sale ends.      |
| `error`            | Handles errors (e.g., unauthorized access). |

---

## Nice-to-Have Features (Planned)

1.  Docker Integration:
    . Containerization for easy deployment
    . Docker Compose for service orchestration
    . Scaling Solutions:

2.  Redis implementation for caching
    . Websocket horizontal scaling to handle distributed systems
    . Retry mechanism

<!-- ## Development Challenges

1.  Time Management:
    . Fraud Detection system testing
    . Following solid principles

2.  Technical Challenges:
    . Implementing real-time WebSocket communication
    . Ensuring proper state management across the system -->

## Contributing

To contribute to this project, please follow these guidelines:

- Fork the repository.
- Create a feature branch (git checkout -b feature/your-feature).
- Commit your changes (git commit -m 'Add new feature').
- Push to the branch (git push origin feature/your-feature).
- Open a pull request.

## Contact

For any inquiries, please reach out to:

- **Name: Ignatius Francis**
- **Email: obiignatiusfrancis@outlook.com**
- **GitHub: IgnatiusFrancis**

```

```

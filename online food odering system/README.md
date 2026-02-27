# 🍕 Online Food Ordering System

A modern, professional food ordering web application built with Node.js, Express, MySQL, and Bootstrap 5. Inspired by popular food delivery platforms like Foodpanda and Uber Eats.

![Node.js](https://img.shields.io/badge/Node.js-v18+-green)
![Express](https://img.shields.io/badge/Express-v4.21-blue)
![Bootstrap](https://img.shields.io/badge/Bootstrap-v5.3-purple)
![MySQL](https://img.shields.io/badge/MySQL-v8.0-orange)

---
outputs
![WhatsApp Image 2026-02-26 at 7 33 26 PM](https://github.com/user-attachments/assets/b81408a9-ad85-4beb-98f4-54f0fd032529)


![WhatsApp Image 2026-02-26 at 7 34 15 PM](https://github.com/user-attachments/assets/341e3e26-40e0-4354-b860-41f932329bbd)

![WhatsApp Image 2026-02-26 at 8 42 30 PM](https://github.com/user-attachments/assets/23b67b70-bc1d-400e-b652-e43f1433baae)



## 📋 Table of Contents

- [Features](#features)
- [Technologies Used](#technologies-used)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Configuration](#configuration)
- [Database Setup](#database-setup)
- [Running the Application](#running-the-application)
- [Seeding Sample Data](#seeding-sample-data)
- [Usage](#usage)
- [Screenshots](#screenshots)
- [API Endpoints](#api-endpoints)
- [Contributing](#contributing)
- [License](#license)

---

## ✨ Features

### 🏠 Home Page
- **Hero Section** with animated food images
- **Real-time Statistics** (Total menu items, orders, delivery time)
- **Category Browser** with 6 food categories
- **Featured Menu Items** showcase
- **How It Works** section with 3-step process
- **Promotional Banner** with call-to-action

### 🍔 Menu Management
- **CRUD Operations** (Create, Read, Update, Delete)
- **Category-based Filtering**
- **Responsive Card Layout**
- **Image Support** for menu items
- **Availability Toggle**
- **Price Management**

### 📦 Order Management
- **Order Creation** with customer details
- **Order Status Tracking** (Pending, Confirmed, Preparing, Out for Delivery, Delivered)
- **Order History** with detailed view
- **Customer Information** management

### 🎨 UI/UX Features
- **Fully Responsive Design** (Mobile, Tablet, Desktop)
- **Modern Glassmorphism Effects**
- **Smooth Animations** and transitions
- **Bootstrap 5 Components**
- **Bootstrap Icons** integration
- **Professional Color Scheme** with gradients
- **Dark Theme** with purple/pink accents

---

## 🛠️ Technologies Used

### Backend
- **Node.js** (v18+) - JavaScript runtime
- **Express.js** (v4.21) - Web application framework
- **Sequelize** (v6.37) - ORM for MySQL
- **MySQL2** (v3.11) - MySQL database driver
- **dotenv** (v16.4) - Environment variable management

### Frontend
- **EJS** (v3.1) - Templating engine
- **Bootstrap 5.3** - CSS framework
- **Bootstrap Icons** (v1.11) - Icon library
- **Custom CSS** - Additional styling with gradients and animations

### Middleware & Utilities
- **body-parser** - Parse incoming request bodies
- **method-override** - Support PUT and DELETE methods
- **morgan** - HTTP request logger
- **express-ejs-layouts** - Layout support for EJS

---

## 📁 Project Structure

```
online-food-ordering-system/
│
├── config/
│   ├── database.js          # Database configuration
│   └── .env                  # Environment variables (not in repo)
│
├── models/
│   ├── MenuItem.js           # MenuItem model (Sequelize)
│   └── Order.js              # Order model (Sequelize)
│
├── routes/
│   ├── menuItems.js          # Menu item routes
│   └── orders.js             # Order routes
│
├── views/
│   ├── layout.ejs            # Main layout template
│   ├── index.ejs             # Home page
│   ├── 404.ejs               # Error page
│   ├── menu-items/           # Menu item views
│   │   ├── index.ejs         # List all items
│   │   ├── show.ejs          # View single item
│   │   ├── new.ejs           # Create new item
│   │   └── edit.ejs          # Edit item
│   └── orders/               # Order views
│       ├── index.ejs         # List all orders
│       ├── show.ejs          # View single order
│       ├── new.ejs           # Create new order
│       └── edit.ejs          # Edit order
│
├── public/
│   └── css/
│       └── styles.css        # Custom CSS styles
│
├── seeders/
│   ├── seedMenuItems.js      # Seed menu items
│   ├── seedOrders.js         # Seed orders
│   └── README.md             # Seeder documentation
│
├── app.js                    # Main application file
├── package.json              # Dependencies and scripts
├── .env.example              # Example environment variables
└── README.md                 # This file
```

---

## 🚀 Installation

### Prerequisites
- **Node.js** (v18 or higher)
- **MySQL** (v8.0 or higher)
- **npm** or **yarn**

### Step 1: Clone the Repository
```bash
git clone https://github.com/yourusername/online-food-ordering-system.git
cd online-food-ordering-system
```

### Step 2: Install Dependencies
```bash
npm install
```

---

## ⚙️ Configuration

### Step 1: Create Environment File
Copy the example environment file:
```bash
cp .env.example config/.env
```

### Step 2: Configure Database
Edit `config/.env` with your MySQL credentials:

```env
DB_NAME=food_ordering_db
DB_USER=root
DB_PASSWORD=your_password
DB_HOST=127.0.0.1
PORT=3000
```

---

## 🗄️ Database Setup

### Step 1: Create Database
Open MySQL and create the database:

```sql
CREATE DATABASE food_ordering_db;
```

### Step 2: Run the Application
The application will automatically create tables on first run:

```bash
npm start
```

Sequelize will sync models and create the following tables:
- `MenuItems` - Stores menu item information
- `Orders` - Stores order information
- `OrderItems` - Junction table for order-menu item relationship

---

## 🏃 Running the Application

### Development Mode (with auto-restart)
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The application will be available at:
```
http://localhost:3000
```

---

## 🌱 Seeding Sample Data

To populate your database with sample data for testing:

### Seed Menu Items (20 items)
```bash
npm run seed:menu
```

This adds:
- 4 Pizza items
- 3 Burger items
- 2 Salad items
- 3 Pasta items
- 2 Appetizers
- 2 Sides
- 2 Desserts
- 3 Beverages

### Seed Orders (8 orders)
```bash
npm run seed:orders
```

### Seed Everything
```bash
npm run seed:all
```

**Note:** Seeders will not run if data already exists. To re-seed, delete existing data first.

---

## 📖 Usage

### Home Page
- Visit `http://localhost:3000`
- Browse featured menu items
- View categories
- See real-time statistics

### Menu Items
- **View All**: Navigate to `/menu-items`
- **Add New**: Click "Add New Item" button
- **Edit**: Click edit icon on any item card
- **Delete**: Click delete icon and confirm
- **View Details**: Click on item card

### Orders
- **View All**: Navigate to `/orders`
- **Create New**: Click "New Order" button
- **Edit**: Click edit icon in actions column
- **Delete**: Click delete icon and confirm
- **View Details**: Click on order ID

---


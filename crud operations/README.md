# Database CRUD Operations
# Database Comparison Project

This project demonstrates the output comparison of three different database systems:

- MongoDB
- MySQL
- SQLite

---

## 📌 Objective

To perform basic database operations and compare the outputs of:
- MongoDB (NoSQL)
- MySQL (Relational Database)
- SQLite (Lightweight Relational Database)

---

## 🗄️ Databases Used

### 1. MongoDB
- NoSQL database
- Document-based storage
- Flexible schema

### 2. MySQL
- Relational Database Management System
- Uses structured tables
- SQL-based queries

### 3. SQLite
- Serverless relational database
- Lightweight and file-based
- No separate server required

---

## ⚙️ Operations Performed

- Database creation
- Table / Collection creation
- Data insertion
- Data retrieval
- Output display

---

## 📸 Output Screenshots

### MongoDB Output
![MongoDB Output](./mongodb_output.jpg)

### MySQL Output
![MySQL Output](./mysql_output.jpg)

### SQLite Output
![SQLite Output](./sqlite_output.jpg)

---

## ▶️ How to Run

### MongoDB
1. Start MongoDB server
2. Run MongoDB queries

### MySQL
1. Start MySQL server
2. Execute SQL queries

### SQLite
1. Open SQLite
2. Run SQLite commands

---

## 🆚 Comparison

| Feature        | MongoDB | MySQL | SQLite |
|---------------|----------|--------|--------|
| Type          | NoSQL    | Relational | Relational |
| Schema        | Flexible | Fixed | Fixed |
| Server Needed | Yes | Yes | No |
| Storage Type  | Document | Table | File |

---

## 👨‍💻 Author

Your Name  
Database Management System Project

---

## 📌 Conclusion

This project helps understand the practical differences between MongoDB, MySQL, and SQLite by comparing their outputs and behavior.


Is repository mein alag-alag databases ke saath CRUD (Create, Read, Update, Delete) operations ke examples hain.

## Projects

### 1. MongoDB CRUD
MongoDB database ke saath CRUD operations ka implementation.

**Technologies:**
- Express.js
- Mongoose
- MongoDB
- CORS & Body-parser

**Location:** `mongodb_crud/`

**Run karne ke liye:**
```bash
cd mongodb_crud
npm install
npm start
```

---

### 2. MySQL CRUD
MySQL database ke saath CRUD operations ka implementation.

**Technologies:**
- Express.js
- MySQL2
- CORS & Body-parser

**Location:** `mysql_crud/`

**Run karne ke liye:**
```bash
cd mysql_crud
npm install
npm start
```

---

### 3. SQLite CRUD
SQLite database ke saath CRUD operations ka implementation.

**Technologies:**
- Express.js
- SQLite3
- CORS & Body-parser

**Location:** `sqlite_crud/`

**Run karne ke liye:**
```bash
cd sqlite_crud
npm install
npm start
```

---

## Features

- ✅ Create - Naya data add karna
- ✅ Read - Data ko retrieve karna
- ✅ Update - Existing data ko modify karna
- ✅ Delete - Data ko remove karna

## Requirements

- Node.js (v14 ya usse upar)
- npm ya yarn
- MongoDB (mongodb_crud ke liye)
- MySQL (mysql_crud ke liye)

## Project Structure

```
.
├── mongodb_crud/       # MongoDB implementation
├── mysql_crud/         # MySQL implementation
├── sqlite_crud/        # SQLite implementation
└── README.md          # Ye file
```

## Usage

Har project ka apna `public/index.html` file hai jisme frontend interface hai. Server start karne ke baad browser mein `http://localhost:3000` (ya jo bhi port configure ho) open karein.

## License

ISC

# Database CRUD Operations

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

# 🎓 University Management REST API
## Complete Project Guide — Based on Lecture Notes

---

## 📁 Project Structure

```
university-api/
├── server.js                  ← Entry point
├── package.json
├── config/
│   └── dataStore.js           ← In-memory database
├── middleware/
│   └── authMiddleware.js      ← JWT Auth + XSS sanitizer
├── controllers/
│   ├── authController.js      ← Register + Login
│   ├── studentController.js   ← Student CRUD
│   ├── courseController.js    ← Course CRUD
│   └── teacherController.js   ← Teacher CRUD
└── routes/
    ├── authRoutes.js
    ├── studentRoutes.js
    ├── courseRoutes.js
    └── teacherRoutes.js
```

---

## 🚀 Step 1: Install & Run

```bash
# Navigate into project folder
cd university-api

# Install all dependencies
npm install

# Start server
npm start
# → Server running on http://localhost:5000
```

---

## 🔐 Step 2: Authentication (JWT)

### Register a New User
**POST** `http://localhost:5000/api/auth/register`

```json
{
  "name": "Admin User",
  "email": "admin@uni.com",
  "password": "admin123",
  "role": "admin"
}
```

**Response (201 Created):**
```json
{
  "message": "User registered successfully!",
  "user": { "id": 2, "name": "Admin User", "email": "admin@uni.com", "role": "admin" }
}
```

---

### Login
**POST** `http://localhost:5000/api/auth/login`

```json
{
  "email": "admin@uni.com",
  "password": "admin123"
}
```

**Response (200 OK):**
```json
{
  "message": "Login successful!",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { "id": 2, "role": "admin" }
}
```

> ✅ **Copy this token!** You'll send it in every protected request as:
> `Authorization: Bearer <your_token_here>`

---

### Get Current User (Protected)
**GET** `http://localhost:5000/api/auth/me`

Header:
```
Authorization: Bearer <token>
```

---

## 👨‍🎓 Step 3: Students CRUD

> All student routes require `Authorization: Bearer <token>` header.
> POST, PUT, DELETE require **admin** role.

### GET All Students
**GET** `http://localhost:5000/api/students`

**GET with Filter:**
`http://localhost:5000/api/students?department=CS`

**Response:**
```json
{
  "total": 3,
  "students": [
    { "id": 1, "name": "Ali Khan", "email": "ali@uni.com", "department": "CS", "roll": "CS-001" }
  ]
}
```

---

### GET Student by ID
**GET** `http://localhost:5000/api/students/1`

---

### CREATE Student (Admin Only)
**POST** `http://localhost:5000/api/students`

Body:
```json
{
  "name": "Zara Malik",
  "email": "zara@uni.com",
  "department": "SE",
  "roll": "SE-002"
}
```

**Response (201 Created):**
```json
{
  "message": "Student created successfully.",
  "student": { "id": 4, "name": "Zara Malik", ... }
}
```

---

### UPDATE Student (Admin Only)
**PUT** `http://localhost:5000/api/students/4`

Body:
```json
{
  "name": "Zara Ahmed",
  "department": "CS"
}
```

---

### DELETE Student (Admin Only)
**DELETE** `http://localhost:5000/api/students/4`

**Response:**
```json
{ "message": "Student deleted successfully." }
```

---

## 📚 Step 4: Courses CRUD

### GET All Courses (with Pagination)
`http://localhost:5000/api/courses?page=1&limit=2`

### CREATE Course
**POST** `http://localhost:5000/api/courses`
```json
{
  "title": "Artificial Intelligence",
  "code": "CS-401",
  "credits": 3,
  "teacherId": 1
}
```

### UPDATE Course
**PUT** `http://localhost:5000/api/courses/1`
```json
{ "title": "Advanced Web Development" }
```

### DELETE Course
**DELETE** `http://localhost:5000/api/courses/1`

---

## 👨‍🏫 Step 5: Teachers CRUD

### GET All Teachers
**GET** `http://localhost:5000/api/teachers`

### CREATE Teacher
**POST** `http://localhost:5000/api/teachers`
```json
{
  "name": "Dr. Kamran",
  "email": "kamran@uni.com",
  "department": "CS",
  "subject": "Artificial Intelligence"
}
```

### UPDATE Teacher
**PUT** `http://localhost:5000/api/teachers/1`

### DELETE Teacher
**DELETE** `http://localhost:5000/api/teachers/1`

---

## 🛡️ Step 6: Security Features Explained

### 1. CORS (Cross-Origin Resource Sharing)
```js
// Only these origins can call our API
app.use(cors({
  origin: ['http://localhost:3000', 'https://yourdomain.com']
}));
```

### 2. DDoS Protection (Rate Limiting)
```js
// Max 100 requests per 15 minutes per IP
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
```

### 3. XSS Prevention (Input Sanitizer)
```js
// Converts < > " ' / to safe HTML entities
value.replace(/</g, '&lt;').replace(/>/g, '&gt;')
```

### 4. JWT Token Flow
```
1. User sends email + password
2. Server verifies → generates JWT (Header.Payload.Signature)
3. Client stores token (localStorage or memory)
4. Client sends token in every request: Authorization: Bearer <token>
5. Server verifies token → grants or denies access
```

### 5. Authorization (Role-Based)
```js
// Only admins can create/update/delete
router.post('/', authorize('admin'), createStudent);

// Both admin and student can read
router.get('/', getAllStudents);
```

---

## 📊 HTTP Status Codes Used

| Code | Meaning               | When Used                        |
|------|-----------------------|----------------------------------|
| 200  | OK                    | Successful GET, PUT, DELETE      |
| 201  | Created               | Successful POST                  |
| 400  | Bad Request           | Missing required fields          |
| 401  | Unauthorized          | No token / wrong credentials     |
| 403  | Forbidden             | Valid token but wrong role       |
| 404  | Not Found             | Resource doesn't exist           |
| 409  | Conflict              | Duplicate email                  |
| 429  | Too Many Requests     | Rate limit hit (DDoS protection) |
| 500  | Internal Server Error | Unexpected server crash          |

---

## 📋 All API Endpoints Summary

| Method | Endpoint                  | Access       | Description           |
|--------|---------------------------|-------------|------------------------|
| POST   | /api/auth/register        | Public       | Register user          |
| POST   | /api/auth/login           | Public       | Login + get JWT        |
| GET    | /api/auth/me              | Authenticated| Get logged-in user     |
| GET    | /api/students             | Authenticated| Get all students       |
| GET    | /api/students/:id         | Authenticated| Get student by ID      |
| POST   | /api/students             | Admin only   | Create student         |
| PUT    | /api/students/:id         | Admin only   | Update student         |
| DELETE | /api/students/:id         | Admin only   | Delete student         |
| GET    | /api/courses              | Authenticated| Get all courses        |
| GET    | /api/courses/:id          | Authenticated| Get course by ID       |
| POST   | /api/courses              | Admin only   | Create course          |
| PUT    | /api/courses/:id          | Admin only   | Update course          |
| DELETE | /api/courses/:id          | Admin only   | Delete course          |
| GET    | /api/teachers             | Authenticated| Get all teachers       |
| GET    | /api/teachers/:id         | Authenticated| Get teacher by ID      |
| POST   | /api/teachers             | Admin only   | Create teacher         |
| PUT    | /api/teachers/:id         | Admin only   | Update teacher         |
| DELETE | /api/teachers/:id         | Admin only   | Delete teacher         |

---

## 🔮 Homework Extensions (from Lecture Notes)

1. **Connect to MongoDB** using Mongoose
2. **Add Input Validation** using `express-validator`
3. **Refresh Tokens** for longer sessions
4. **Deploy** to Render or Railway (free hosting)
5. **Add email verification** on registration

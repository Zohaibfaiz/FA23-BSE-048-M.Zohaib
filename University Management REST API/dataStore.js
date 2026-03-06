// =============================================
// config/dataStore.js
// In-memory "database" (replace with MongoDB later)
// =============================================

// Users (for authentication)
let users = [
  {
    id: 1,
    name: 'Admin User',
    email: 'admin@university.com',
    password: '$2a$10$MErrFiqHm4KeaZc0N0crN.buv4KxX5zYdzbkP6NGpYCsY.PjuzwC', // bcrypt hash of "admin123"
    role: 'admin'
  }
];

// Students
let students = [
  { id: 1, name: 'Ali Khan',   email: 'ali@uni.com',  department: 'CS',   roll: 'CS-001' },
  { id: 2, name: 'Sara Ahmed', email: 'sara@uni.com', department: 'IT',   roll: 'IT-001' },
  { id: 3, name: 'Umar Farooq',email: 'umar@uni.com', department: 'SE',   roll: 'SE-001' }
];

// Courses
let courses = [
  { id: 1, title: 'Web Development',   code: 'CS-301', credits: 3, teacherId: 1 },
  { id: 2, title: 'Database Systems',  code: 'CS-302', credits: 3, teacherId: 2 },
  { id: 3, title: 'Operating Systems', code: 'CS-303', credits: 3, teacherId: 1 }
];

// Teachers
let teachers = [
  { id: 1, name: 'Dr. Bilal', email: 'bilal@uni.com', department: 'CS', subject: 'Web Dev' },
  { id: 2, name: 'Dr. Hina',  email: 'hina@uni.com',  department: 'IT', subject: 'Databases' }
];

module.exports = { users, students, courses, teachers };

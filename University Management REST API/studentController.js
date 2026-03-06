// =============================================
// controllers/studentController.js
// Full CRUD for Students Resource
// =============================================

const db = require('./dataStore');

// ─────────────────────────────────────────────
// GET ALL STUDENTS
// GET /api/students
// Access: All authenticated users
// ─────────────────────────────────────────────
const getAllStudents = (req, res) => {
  // Support query filter: /api/students?department=CS
  const { department } = req.query;
  let result = db.students;

  if (department) {
    result = result.filter(s => s.department.toLowerCase() === department.toLowerCase());
  }

  res.status(200).json({
    total: result.length,
    students: result
  });
};

// ─────────────────────────────────────────────
// GET STUDENT BY ID
// GET /api/students/:id
// ─────────────────────────────────────────────
const getStudentById = (req, res) => {
  const id = parseInt(req.params.id);
  const student = db.students.find(s => s.id === id);

  if (!student) {
    return res.status(404).json({ error: `Student with ID ${id} not found.` });
  }

  res.status(200).json(student);
};

// ─────────────────────────────────────────────
// CREATE STUDENT
// POST /api/students
// Access: Admin only
// ─────────────────────────────────────────────
const createStudent = (req, res) => {
  const { name, email, department, roll } = req.body;

  // Validate required fields
  if (!name || !email || !department || !roll) {
    return res.status(400).json({
      error: 'All fields required: name, email, department, roll'
    });
  }

  // Check duplicate email
  const exists = db.students.find(s => s.email === email);
  if (exists) {
    return res.status(409).json({ error: 'A student with this email already exists.' });
  }

  const newStudent = {
    id: db.students.length + 1,
    name,
    email,
    department,
    roll
  };

  db.students.push(newStudent);
  res.status(201).json({
    message: 'Student created successfully.',
    student: newStudent
  });
};

// ─────────────────────────────────────────────
// UPDATE STUDENT
// PUT /api/students/:id
// Access: Admin only
// ─────────────────────────────────────────────
const updateStudent = (req, res) => {
  const id = parseInt(req.params.id);
  const index = db.students.findIndex(s => s.id === id);

  if (index === -1) {
    return res.status(404).json({ error: `Student with ID ${id} not found.` });
  }

  const { name, email, department, roll } = req.body;

  // Update only provided fields (partial update support)
  db.students[index] = {
    ...db.students[index],
    name:       name       || db.students[index].name,
    email:      email      || db.students[index].email,
    department: department || db.students[index].department,
    roll:       roll       || db.students[index].roll
  };

  res.status(200).json({
    message: 'Student updated successfully.',
    student: db.students[index]
  });
};

// ─────────────────────────────────────────────
// DELETE STUDENT
// DELETE /api/students/:id
// Access: Admin only
// ─────────────────────────────────────────────
const deleteStudent = (req, res) => {
  const id = parseInt(req.params.id);
  const index = db.students.findIndex(s => s.id === id);

  if (index === -1) {
    return res.status(404).json({ error: `Student with ID ${id} not found.` });
  }

  const deleted = db.students.splice(index, 1);
  res.status(200).json({
    message: 'Student deleted successfully.',
    deleted: deleted[0]
  });
};

module.exports = { getAllStudents, getStudentById, createStudent, updateStudent, deleteStudent };

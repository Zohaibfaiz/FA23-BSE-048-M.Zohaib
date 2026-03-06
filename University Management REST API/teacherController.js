// =============================================
// controllers/teacherController.js
// Full CRUD for Teachers Resource
// =============================================

const db = require('./dataStore');

const getAllTeachers = (req, res) => {
  res.status(200).json({ total: db.teachers.length, teachers: db.teachers });
};

const getTeacherById = (req, res) => {
  const teacher = db.teachers.find(t => t.id === parseInt(req.params.id));
  if (!teacher) return res.status(404).json({ error: 'Teacher not found.' });
  res.status(200).json(teacher);
};

const createTeacher = (req, res) => {
  const { name, email, department, subject } = req.body;
  if (!name || !email || !department || !subject) {
    return res.status(400).json({ error: 'All fields required: name, email, department, subject' });
  }
  const newTeacher = { id: db.teachers.length + 1, name, email, department, subject };
  db.teachers.push(newTeacher);
  res.status(201).json({ message: 'Teacher created.', teacher: newTeacher });
};

const updateTeacher = (req, res) => {
  const index = db.teachers.findIndex(t => t.id === parseInt(req.params.id));
  if (index === -1) return res.status(404).json({ error: 'Teacher not found.' });
  db.teachers[index] = { ...db.teachers[index], ...req.body, id: db.teachers[index].id };
  res.status(200).json({ message: 'Teacher updated.', teacher: db.teachers[index] });
};

const deleteTeacher = (req, res) => {
  const index = db.teachers.findIndex(t => t.id === parseInt(req.params.id));
  if (index === -1) return res.status(404).json({ error: 'Teacher not found.' });
  const deleted = db.teachers.splice(index, 1);
  res.status(200).json({ message: 'Teacher deleted.', deleted: deleted[0] });
};

module.exports = { getAllTeachers, getTeacherById, createTeacher, updateTeacher, deleteTeacher };

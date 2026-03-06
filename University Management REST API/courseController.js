// =============================================
// controllers/courseController.js
// Full CRUD for Courses Resource
// =============================================

const db = require('./dataStore');

const getAllCourses = (req, res) => {
  // Support pagination: /api/courses?page=1&limit=2
  const page  = parseInt(req.query.page)  || 1;
  const limit = parseInt(req.query.limit) || 10;
  const start = (page - 1) * limit;
  const end   = start + limit;
  const paginated = db.courses.slice(start, end);

  res.status(200).json({
    total: db.courses.length,
    page,
    limit,
    courses: paginated
  });
};

const getCourseById = (req, res) => {
  const course = db.courses.find(c => c.id === parseInt(req.params.id));
  if (!course) return res.status(404).json({ error: 'Course not found.' });
  res.status(200).json(course);
};

const createCourse = (req, res) => {
  const { title, code, credits, teacherId } = req.body;
  if (!title || !code || !credits) {
    return res.status(400).json({ error: 'title, code, and credits are required.' });
  }
  const newCourse = {
    id: db.courses.length + 1,
    title, code,
    credits: parseInt(credits),
    teacherId: teacherId || null
  };
  db.courses.push(newCourse);
  res.status(201).json({ message: 'Course created.', course: newCourse });
};

const updateCourse = (req, res) => {
  const index = db.courses.findIndex(c => c.id === parseInt(req.params.id));
  if (index === -1) return res.status(404).json({ error: 'Course not found.' });

  db.courses[index] = { ...db.courses[index], ...req.body, id: db.courses[index].id };
  res.status(200).json({ message: 'Course updated.', course: db.courses[index] });
};

const deleteCourse = (req, res) => {
  const index = db.courses.findIndex(c => c.id === parseInt(req.params.id));
  if (index === -1) return res.status(404).json({ error: 'Course not found.' });

  const deleted = db.courses.splice(index, 1);
  res.status(200).json({ message: 'Course deleted.', deleted: deleted[0] });
};

module.exports = { getAllCourses, getCourseById, createCourse, updateCourse, deleteCourse };

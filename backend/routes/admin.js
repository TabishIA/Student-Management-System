const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcryptjs');

const authMiddleware = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });
  require('jsonwebtoken').verify(token, 'secret_key', (err, decoded) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    req.user = decoded;
    next();
  });
};

router.post('/classes', authMiddleware, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Access denied' });
  const { year, division, school_id } = req.body;
  db.query(
    'INSERT INTO classes (year, division, school_id) VALUES (?, ?, ?)',
    [year, division, school_id],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Class added', class_id: results.insertId });
    }
  );
});

router.post('/students', authMiddleware, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Access denied' });
  const { registration_number, name, password, year, division, roll_number, school_id } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 10);
  db.query(
    'INSERT INTO users (registration_number, name, role, password, year, division, roll_number, school_id) VALUES (?, ?, "student", ?, ?, ?, ?, ?)',
    [registration_number, name, hashedPassword, year, division, roll_number, school_id],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      const studentId = results.insertId;
      db.query(
        'INSERT INTO student_classes (student_id, class_id, school_id) SELECT ?, id, ? FROM classes WHERE year = ? AND division = ? AND school_id = ?',
        [studentId, school_id, year, division, school_id],
        (err) => {
          if (err) return res.status(500).json({ error: err.message });
          res.json({ message: 'Student added', student_id: studentId });
        }
      );
    }
  );
});

router.post('/staff', authMiddleware, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Access denied' });
  const { staff_id, name, password, role, school_id } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 10);
  db.query(
    'INSERT INTO users (staff_id, name, role, password, school_id) VALUES (?, ?, ?, ?, ?)',
    [staff_id, name, role, hashedPassword, school_id],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Staff added' });
    }
  );
});

router.post('/batches', authMiddleware, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Access denied' });
  const { class_id, batch_name, school_id } = req.body;
  db.query(
    'INSERT INTO batches (class_id, batch_name, school_id) VALUES (?, ?, ?)',
    [class_id, batch_name, school_id],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Batch added', batch_id: results.insertId });
    }
  );
});

router.post('/student-batches', authMiddleware, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Access denied' });
  const { student_id, batch_id, school_id } = req.body;
  db.query(
    'INSERT INTO student_batches (student_id, batch_id, school_id) VALUES (?, ?, ?)',
    [student_id, batch_id, school_id],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Student assigned to batch' });
    }
  );
});

router.post('/subjects', authMiddleware, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Access denied' });
  const { name, class_id, school_id } = req.body;
  db.query(
    'INSERT INTO subjects (name, class_id, school_id) VALUES (?, ?, ?)',
    [name, class_id, school_id],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Subject added', subject_id: results.insertId });
    }
  );
});

router.post('/class-subjects-teachers', authMiddleware, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Access denied' });
  const { class_id, subject_id, teacher_id, school_id } = req.body;
  db.query(
    'INSERT INTO class_subjects_teachers (class_id, subject_id, teacher_id, school_id) VALUES (?, ?, ?, ?)',
    [class_id, subject_id, teacher_id, school_id],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Teacher assigned to subject' });
    }
  );
});

router.get('/classes', authMiddleware, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Access denied' });
  db.query(
    'SELECT c.*, JSON_ARRAYAGG(JSON_OBJECT("id", b.id, "batch_name", b.batch_name)) as batches FROM classes c LEFT JOIN batches b ON c.id = b.class_id WHERE c.school_id = ? GROUP BY c.id',
    [req.user.school_id],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      // No need to parse, mysql2 returns batches as an object already
      res.json(results);
    }
  );
});

router.get('/students', authMiddleware, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Access denied' });
  db.query('SELECT * FROM users WHERE role = "student" AND school_id = ?', [req.user.school_id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

router.get('/teachers', authMiddleware, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Access denied' });
  db.query('SELECT * FROM users WHERE role = "teacher" AND school_id = ?', [req.user.school_id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

router.get('/subjects/:classId', authMiddleware, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Access denied' });
  const { classId } = req.params;
  db.query('SELECT * FROM subjects WHERE class_id = ? AND school_id = ?', [classId, req.user.school_id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

router.get('/student/roll/:rollNumber', authMiddleware, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Access denied' });
  const { rollNumber } = req.params;
  db.query(
    'SELECT u.id, u.name, u.roll_number, c.year, c.division FROM users u LEFT JOIN student_classes sc ON u.id = sc.student_id LEFT JOIN classes c ON sc.class_id = c.id WHERE u.roll_number = ? AND u.school_id = ?',
    [rollNumber, req.user.school_id],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      if (results.length === 0) return res.status(404).json({ message: 'Student not found' });
      res.json(results[0]);
    }
  );
});

module.exports = router;
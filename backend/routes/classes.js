const express = require('express');
const router = express.Router();
const db = require('../db');

const authMiddleware = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });
  require('jsonwebtoken').verify(token, 'secret_key', (err, decoded) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    req.user = decoded;
    next();
  });
};

// Teacher Routes
router.get('/classes', authMiddleware, (req, res) => {
  if (req.user.role !== 'teacher') return res.status(403).json({ message: 'Access denied' });
  db.query(
    'SELECT DISTINCT c.* FROM classes c JOIN class_subjects_teachers cst ON c.id = cst.class_id WHERE cst.teacher_id = ? AND c.school_id = ?',
    [req.user.id, req.user.school_id],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(results);
    }
  );
});

router.get('/subjects/:classId', authMiddleware, (req, res) => {
  const { classId } = req.params;
  db.query(
    'SELECT s.* FROM subjects s JOIN class_subjects_teachers cst ON s.id = cst.subject_id WHERE cst.class_id = ? AND cst.teacher_id = ? AND s.school_id = ?',
    [classId, req.user.id, req.user.school_id],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(results);
    }
  );
});

router.get('/students/:classId', authMiddleware, (req, res) => {
  const { classId } = req.params;
  db.query(
    'SELECT u.id, u.registration_number, u.name, u.roll_number, b.batch_name FROM users u JOIN student_classes sc ON u.id = sc.student_id LEFT JOIN student_batches sb ON u.id = sb.student_id LEFT JOIN batches b ON sb.batch_id = b.id WHERE sc.class_id = ? AND sc.school_id = ?',
    [classId, req.user.school_id],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(results);
    }
  );
});

router.post('/attendance', authMiddleware, (req, res) => {
  if (req.user.role !== 'teacher') return res.status(403).json({ message: 'Access denied' });
  const { subject_id, date, attendance } = req.body;
  const queries = attendance.map(a => 
    new Promise((resolve, reject) => {
      db.query(
        'INSERT INTO attendance (student_id, subject_id, date, is_present, school_id) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE is_present = ?',
        [a.student_id, subject_id, date, a.is_present, req.user.school_id, a.is_present],
        (err) => (err ? reject(err) : resolve())
      );
    })
  );
  Promise.all(queries)
    .then(() => res.json({ message: 'Attendance recorded' }))
    .catch(err => res.status(500).json({ error: err.message }));
});

router.post('/marks', authMiddleware, (req, res) => {
  if (req.user.role !== 'teacher') return res.status(403).json({ message: 'Access denied' });
  const { subject_id, marks } = req.body;
  const queries = marks.map(m => 
    new Promise((resolve, reject) => {
      db.query(
        'INSERT INTO marks (student_id, subject_id, marks, school_id) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE marks = ?',
        [m.student_id, subject_id, m.marks, req.user.school_id, m.marks],
        (err) => (err ? reject(err) : resolve())
      );
    })
  );
  Promise.all(queries)
    .then(() => res.json({ message: 'Marks recorded' }))
    .catch(err => res.status(500).json({ error: err.message }));
});

router.get('/assignments/:classId', authMiddleware, (req, res) => {
  const { classId } = req.params;
  db.query(
    'SELECT a.* FROM assignments a JOIN subjects s ON a.subject_id = s.id JOIN class_subjects_teachers cst ON s.id = cst.subject_id WHERE cst.class_id = ? AND cst.teacher_id = ? AND a.school_id = ?',
    [classId, req.user.id, req.user.school_id],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(results);
    }
  );
});

router.post('/assignments', authMiddleware, (req, res) => {
  if (req.user.role !== 'teacher') return res.status(403).json({ message: 'Access denied' });
  const { subject_id, title, description, due_date } = req.body;
  db.query(
    'INSERT INTO assignments (subject_id, title, description, due_date, created_by, school_id) VALUES (?, ?, ?, ?, ?, ?)',
    [subject_id, title, description, due_date, req.user.id, req.user.school_id],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Assignment created' });
    }
  );
});

router.get('/announcements', authMiddleware, (req, res) => {
  if (req.user.role !== 'teacher') return res.status(403).json({ message: 'Access denied' });
  db.query(
    'SELECT * FROM announcements WHERE school_id = ? ORDER BY created_at DESC',
    [req.user.school_id],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(results);
    }
  );
});

router.post('/announcements', authMiddleware, (req, res) => {
  if (req.user.role !== 'teacher') return res.status(403).json({ message: 'Access denied' });
  const { title, content } = req.body;
  db.query(
    'INSERT INTO announcements (title, content, created_by, school_id, created_at) VALUES (?, ?, ?, ?, NOW())',
    [title, content, req.user.id, req.user.school_id],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Announcement posted' });
    }
  );
});

router.delete('/announcements/:announcementId', authMiddleware, (req, res) => {
  if (req.user.role !== 'teacher') return res.status(403).json({ message: 'Access denied' });
  const { announcementId } = req.params;
  db.query(
    'DELETE FROM announcements WHERE id = ? AND created_by = ? AND school_id = ?',
    [announcementId, req.user.id, req.user.school_id],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Announcement deleted' });
    }
  );
});

// Student Routes
router.get('/student/classes', authMiddleware, (req, res) => {
  if (req.user.role !== 'student') return res.status(403).json({ message: 'Access denied' });
  db.query(
    'SELECT c.* FROM classes c JOIN student_classes sc ON c.id = sc.class_id WHERE sc.student_id = ? AND c.school_id = ?',
    [req.user.id, req.user.school_id],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(results);
    }
  );
});

router.get('/student/attendance/:studentId', authMiddleware, (req, res) => {
  if (req.user.role !== 'student') return res.status(403).json({ message: 'Access denied' });
  db.query(
    'SELECT a.*, s.name as subject_name FROM attendance a JOIN subjects s ON a.subject_id = s.id WHERE a.student_id = ? AND a.school_id = ?',
    [req.user.id, req.user.school_id],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(results);
    }
  );
});

router.get('/student/marks/:studentId', authMiddleware, (req, res) => {
  if (req.user.role !== 'student') return res.status(403).json({ message: 'Access denied' });
  db.query(
    'SELECT m.*, s.name as subject_name FROM marks m JOIN subjects s ON m.subject_id = s.id WHERE m.student_id = ? AND m.school_id = ?',
    [req.user.id, req.user.school_id],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(results);
    }
  );
});

router.get('/student/assignments', authMiddleware, (req, res) => {
  if (req.user.role !== 'student') return res.status(403).json({ message: 'Access denied' });
  db.query(
    'SELECT a.* FROM assignments a JOIN subjects s ON a.subject_id = s.id JOIN student_classes sc ON s.class_id = sc.class_id WHERE sc.student_id = ? AND a.school_id = ?',
    [req.user.id, req.user.school_id],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(results);
    }
  );
});

router.post('/assignments/submit', authMiddleware, (req, res) => {
  if (req.user.role !== 'student') return res.status(403).json({ message: 'Access denied' });
  const { assignment_id, file_path } = req.body;
  db.query(
    'INSERT INTO assignment_submissions (assignment_id, student_id, file_path, submitted_at, school_id) VALUES (?, ?, ?, NOW(), ?) ON DUPLICATE KEY UPDATE file_path = ?, submitted_at = NOW()',
    [assignment_id, req.user.id, file_path, req.user.school_id, file_path],
    (err) => {
      if (err) {
        console.error('Submission error:', err); // Log the error
        return res.status(500).json({ error: err.message });
      }
      res.json({ message: 'Assignment submitted' });
    }
  );
});

router.get('/student/profile/:studentId', authMiddleware, (req, res) => {
  if (req.user.role !== 'student') return res.status(403).json({ message: 'Access denied' });
  db.query(
    'SELECT u.email, u.mobile_number, u.parent_contact, u.name, u.registration_number AS registration_id, u.roll_number, ' +
    'c.year, c.division, b.batch_name ' +
    'FROM users u ' +
    'LEFT JOIN student_classes sc ON u.id = sc.student_id ' +
    'LEFT JOIN classes c ON sc.class_id = c.id ' +
    'LEFT JOIN student_batches sb ON u.id = sb.student_id ' +
    'LEFT JOIN batches b ON sb.batch_id = b.id ' +
    'WHERE u.id = ? AND u.school_id = ?',
    [req.user.id, req.user.school_id],
    (err, results) => {
      if (err) {
        console.error('Profile fetch error:', err); // Log the error
        return res.status(500).json({ error: err.message });
      }
      const profile = results[0] || {
        email: '',
        mobile_number: '',
        parent_contact: '',
        name: '',
        registration_id: '',
        roll_number: '',
        year: '',
        division: '',
        batch_name: '',
      };
      profile.class = profile.year && profile.division ? `${profile.year}-${profile.division}` : '';
      delete profile.year;
      delete profile.division;
      res.json(profile);
    }
  );
});

router.put('/student/profile/:studentId', authMiddleware, (req, res) => {
  if (req.user.role !== 'student') return res.status(403).json({ message: 'Access denied' });
  const { email, mobile_number, parent_contact, parent_email } = req.body;
  db.query(
    'UPDATE users SET email = ?, mobile_number = ?, parent_contact = ? WHERE id = ? AND school_id = ?',
    [email, mobile_number, parent_contact, parent_email, req.user.id, req.user.school_id],
    (err) => {
      if (err) {
        console.error('Profile update error:', err); // Log the error
        return res.status(500).json({ error: err.message });
      }
      res.json({ message: 'Profile updated' });
    }
  );
});

router.get('/student/announcements', authMiddleware, (req, res) => {
  if (req.user.role !== 'student') return res.status(403).json({ message: 'Access denied' });
  db.query(
    'SELECT * FROM announcements WHERE school_id = ? ORDER BY created_at DESC',
    [req.user.school_id],
    (err, results) => {
      if (err) {
        console.error('Announcements fetch error:', err); // Log the error
        return res.status(500).json({ error: err.message });
      }
      res.json(results);
    }
  );
});

module.exports = router;
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');

router.post('/login', (req, res) => {
  const { id, password } = req.body;
  console.log('Login request received:', { id, password });
  db.query(
    'SELECT * FROM users WHERE (staff_id = ? OR registration_number = ?)',
    [id, id],
    (err, results) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ message: 'Server error' });
      }
      if (results.length === 0) {
        console.log('No user found for ID:', id);
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      const user = results[0];
      console.log('User found:', { id: user.staff_id || user.registration_number, storedPassword: user.password });
      const passwordMatch = bcrypt.compareSync(password, user.password);
      console.log('Password match:', passwordMatch);
      if (!passwordMatch) {
        console.log('Password mismatch for user:', id);
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      const token = jwt.sign(
        { id: user.id, role: user.role, school_id: user.school_id, name: user.name },
        'secret_key',
        { expiresIn: '1h' }
      );
      console.log('Login successful, sending token:', token);
      res.json({ token, role: user.role });
    }
  );
});

module.exports = { router };
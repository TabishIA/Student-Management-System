const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'your-password',
  database: 'your-database'
});

db.connect(err => {
  if (err) throw err;
  console.log('MySQL Connected');
});

app.use('/api/auth', require('./routes/auth').router);
app.use('/api/admin', require('./routes/admin'));
app.use('/api', require('./routes/classes'));

app.listen(5000, () => console.log('Server running on port 5000'));
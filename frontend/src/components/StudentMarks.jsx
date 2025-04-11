import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import '../styles/StudentMarks.css'; // Custom styling

const StudentMarks = () => {
  const [marks, setMarks] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMarksData();
  }, []);

  const fetchMarksData = async () => {
    const token = localStorage.getItem('token');
    const studentId = JSON.parse(atob(token.split('.')[1])).id; // Extract student ID from token
    const config = { headers: { Authorization: `Bearer ${token}` } };
    try {
      const res = await axios.get(`http://localhost:5000/api/student/marks/${studentId}`, config);
      setMarks(res.data || []);
    } catch (err) {
      console.error('Fetch marks error:', err.response?.data || err.message);
      setError('Failed to fetch marks data.');
    }
  };

  // Group marks by subject
  const marksBySubject = marks.reduce((acc, mark) => {
    if (!acc[mark.subject_name]) acc[mark.subject_name] = [];
    acc[mark.subject_name].push(mark.marks);
    return acc;
  }, {});

  return (
    <div className="dashboard-container">
      <h2>Marks History</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <div className="card">
        <h3>Marks by Subject</h3>
        <table className="marks-table">
          <thead>
            <tr>
              <th>Subject</th>
              <th>Marks</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(marksBySubject).map(([subject, marksList]) => (
              <tr key={subject}>
                <td>{subject}</td>
                <td>{marksList.join(', ')}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <Link to="/student-dashboard" className="custom-link">Back to Dashboard</Link>
      </div>
    </div>
  );
};

export default StudentMarks;
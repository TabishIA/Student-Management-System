import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import '../styles/global.css'; // Import global.css

const TeacherDashboard = () => {
  const [classes, setClasses] = useState([]);
  const [selectedClassStudents, setSelectedClassStudents] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const token = localStorage.getItem('token');
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const [classRes, announceRes] = await Promise.all([
        axios.get('http://localhost:5000/api/classes', config), // Updated endpoint
        axios.get('http://localhost:5000/api/announcements', config), // Updated endpoint
      ]);
      setClasses(classRes.data || []);
      setAnnouncements(announceRes.data || []);
    } catch (err) {
      console.error('Fetch error:', err.response?.data || err.message);
      setError('Failed to fetch data. Check server or database.');
    }
  };

  const fetchStudents = async (classId) => {
    const token = localStorage.getItem('token');
    try {
      const res = await axios.get(`http://localhost:5000/api/students/${classId}`, { headers: { Authorization: `Bearer ${token}` } }); // Updated endpoint
      setSelectedClassStudents(res.data || []);
    } catch (err) {
      console.error('Fetch students error:', err.response?.data || err.message);
      setSelectedClassStudents([]);
      setError('Failed to fetch students.');
    }
  };

  return (
    <div className="dashboard-container">
      <h2>Teacher Dashboard</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <div className="card-grid">
        <div className="card">
          <h3>Classes</h3>
          <p>View your classes</p>
          {classes.length > 0 && (
            <ul>
              {classes.map((cls) => (
                <li key={cls.id} onClick={() => fetchStudents(cls.id)} style={{ cursor: 'pointer', color: '#3498db', padding: '10px 0' }}>
                  {cls.year}-{cls.division} <span>(Click to view students)</span>
                </li>
              ))}
            </ul>
          )}
          {selectedClassStudents.length > 0 && (
            <div>
              <h4>Students</h4>
              <ul>
                {selectedClassStudents.map((student) => (
                  <li key={student.id}>{student.name} (Roll: {student.roll_number})</li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <div className="card">
          <h3>Attendance</h3>
          <p>Record student attendance</p>
          <Link to="/teacher-attendance" className="custom-link">Go to Attendance</Link>
        </div>
        <div className="card">
          <h3>Marks</h3>
          <p>Enter and manage student marks</p>
          <Link to="/teacher-marks" className="custom-link">Go to Marks</Link>
        </div>
        <div className="card">
          <h3>Assignments</h3>
          <p>Create and manage assignments</p>
          <Link to="/teacher-assignments" className="custom-link">Go to Assignments</Link>
        </div>
        <div className="card">
          <h3>Announcements</h3>
          <p>View and manage announcements</p>
          <ul>
            {announcements.length > 0 ? (
              announcements.map((ann) => (
                <li key={ann.id}>{ann.title}: {ann.content} ({new Date(ann.created_at).toLocaleString()})</li>
              ))
            ) : (
              <li>No announcements available</li>
            )}
          </ul>
          <Link to="/announcements" className="custom-link">Manage Announcements</Link>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
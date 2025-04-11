import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import '../styles/StudentDashboard.css';

const StudentDashboard = () => {
  const [classes, setClasses] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [marks, setMarks] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [error, setError] = useState(null);
  const [batch, setBatch] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    const token = localStorage.getItem('token');
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const decoded = JSON.parse(atob(token.split('.')[1]));
    const studentId = decoded.id;

    try {
      // Fetch classes
      const classRes = await axios.get('http://localhost:5000/api/student/classes', config);
      setClasses(classRes.data || []);

      // Fetch attendance
      const attendanceRes = await axios.get(`http://localhost:5000/api/student/attendance/${studentId}`, config);
      setAttendance(attendanceRes.data || []);

      // Fetch marks
      const marksRes = await axios.get(`http://localhost:5000/api/student/marks/${studentId}`, config);
      setMarks(marksRes.data || []);

      // Fetch assignments
      const assignmentsRes = await axios.get('http://localhost:5000/api/student/assignments', config);
      setAssignments(assignmentsRes.data || []);

      // Fetch announcements
      const announceRes = await axios.get('http://localhost:5000/api/student/announcements', config);
      setAnnouncements(announceRes.data || []);

      // Fetch batch (from profile)
      const profileRes = await axios.get(`http://localhost:5000/api/student/profile/${studentId}`, config);
      setBatch(profileRes.data.batch || 'N/A');
    } catch (err) {
      console.error('Fetch dashboard error:', err.response?.data || err.message);
      setError('Failed to fetch dashboard data. Check server or network.');
    }
  };

  return (
    <div className="dashboard-container">
      <h2>Student Dashboard</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <div className="card-grid">
        <div className="card">
          <h3>Class & Batch</h3>
          <p>Class: {classes.length > 0 ? `${classes[0].year}-${classes[0].division}` : 'N/A'}</p>
          <p>Batch: {batch}</p>
          <Link to="/student-profile" className="custom-link">View Profile</Link>
        </div>
        <div className="card">
          <h3>Attendance</h3>
          <p>Total Records: {attendance.length}</p>
          <ul>
            {attendance.slice(0, 3).map((att, index) => (
              <li key={index}>{att.subject_name}: {att.is_present ? 'Present' : 'Absent'} ({att.date})</li>
            ))}
          </ul>
          <Link to="/student-attendance" className="custom-link">View All</Link>
        </div>
        <div className="card">
          <h3>Marks</h3>
          <p>Total Records: {marks.length}</p>
          <ul>
            {marks.slice(0, 3).map((mark, index) => (
              <li key={index}>{mark.subject_name}: {mark.marks || 'N/A'}</li>
            ))}
          </ul>
          <Link to="/student-marks" className="custom-link">View All</Link>
        </div>
        <div className="card">
          <h3>Assignments</h3>
          <p>Total: {assignments.length}</p>
          <ul>
            {assignments.slice(0, 3).map((assignment) => (
              <li key={assignment.id}>{assignment.title} (Due: {new Date(assignment.due_date).toLocaleDateString()})</li>
            ))}
          </ul>
          <Link to="/student-assignments" className="custom-link">Manage Assignments</Link>
        </div>
        <div className="card">
          <h3>Announcements</h3>
          <ul>
            {announcements.slice(0, 3).map((ann) => (
              <li key={ann.id}>{ann.title}: {ann.content} ({new Date(ann.created_at).toLocaleString()})</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
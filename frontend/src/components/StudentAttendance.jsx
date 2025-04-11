import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import '../styles/StudentAttendance.css'; // Custom styling

const StudentAttendance = () => {
  const [attendance, setAttendance] = useState([]);
  const [totalAttendance, setTotalAttendance] = useState(0);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAttendanceData();
  }, []);

  const fetchAttendanceData = async () => {
    const token = localStorage.getItem('token');
    const studentId = JSON.parse(atob(token.split('.')[1])).id; // Extract student ID from token
    const config = { headers: { Authorization: `Bearer ${token}` } };
    try {
      const res = await axios.get(`http://localhost:5000/api/student/attendance/${studentId}`, config);
      const attendanceData = res.data || [];
      setAttendance(attendanceData);

      // Calculate total attendance (count of present days)
      const totalPresent = attendanceData.filter(a => a.is_present).length;
      const totalRecords = attendanceData.length;
      setTotalAttendance(totalRecords > 0 ? (totalPresent / totalRecords) * 100 : 0);
    } catch (err) {
      console.error('Fetch attendance error:', err.response?.data || err.message);
      setError('Failed to fetch attendance data.');
    }
  };

  // Group attendance by subject
  const attendanceBySubject = attendance.reduce((acc, att) => {
    if (!acc[att.subject_name]) acc[att.subject_name] = { present: 0, total: 0 };
    acc[att.subject_name].total += 1;
    if (att.is_present) acc[att.subject_name].present += 1;
    return acc;
  }, {});

  return (
    <div className="dashboard-container">
      <h2>Attendance History</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <div className="card">
        <h3>Overall Attendance</h3>
        <p>Total Attendance: {totalAttendance.toFixed(2)}% ({attendance.filter(a => a.is_present).length} out of {attendance.length} days)</p>
        <h3>Attendance by Subject</h3>
        <table className="attendance-table">
          <thead>
            <tr>
              <th>Subject</th>
              <th>Present</th>
              <th>Total</th>
              <th>Percentage</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(attendanceBySubject).map(([subject, data]) => (
              <tr key={subject}>
                <td>{subject}</td>
                <td>{data.present}</td>
                <td>{data.total}</td>
                <td>{((data.present / data.total) * 100).toFixed(2)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
        <Link to="/student-dashboard" className="custom-link">Back to Dashboard</Link>
      </div>
    </div>
  );
};

export default StudentAttendance;
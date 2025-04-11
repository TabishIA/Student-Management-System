import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import '../styles/StudentAssignments.css';

const StudentAssignments = () => {
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState({});
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    const token = localStorage.getItem('token');
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const res = await axios.get('http://localhost:5000/api/student/assignments', config);
      setAssignments(res.data || []);
      setSubmissions(
        res.data.reduce((acc, assignment) => ({
          ...acc,
          [assignment.id]: { file: null }, // Use file object instead of file_path
        }), {})
      );
    } catch (err) {
      console.error('Fetch assignments error:', err.response?.data || err.message);
      setError('Failed to fetch assignments.');
    }
  };

  const handleFileChange = (assignmentId, e) => {
    setSubmissions((prev) => ({
      ...prev,
      [assignmentId]: { file: e.target.files[0] }, // Store the file object
    }));
  };

  const submitAssignment = async (assignmentId) => {
    const token = localStorage.getItem('token');
    const studentId = JSON.parse(atob(token.split('.')[1])).id; // Correct JWT decoding
    try {
      const config = { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } };
      const formData = new FormData();
      formData.append('assignment_id', assignmentId);
      formData.append('student_id', studentId);
      formData.append('file', submissions[assignmentId].file);

      // Check for existing submission
      const checkRes = await axios.get(`http://localhost:5000/api/assignments/submit/check/${assignmentId}/${studentId}`, config);
      if (checkRes.data.exists) {
        setError('You have already submitted this assignment.');
        return;
      }

      await axios.post('http://localhost:5000/api/assignments/submit', formData, config);
      alert('Assignment submitted successfully!');
      fetchAssignments(); // Refresh assignments
    } catch (err) {
      console.error('Submit assignment error:', err.response?.data || err.message);
      setError(err.response?.data?.error || 'Failed to submit assignment.');
    }
  };

  return (
    <div className="dashboard-container">
      <h2>Your Assignments</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <div className="card">
        <ul>
          {assignments.map((assignment) => (
            <li key={assignment.id} className="assignment-item">
              <strong>{assignment.title}</strong> - {assignment.description} (Due: {new Date(assignment.due_date).toLocaleDateString()})
              <input
                type="file"
                onChange={(e) => handleFileChange(assignment.id, e)}
              />
              <button onClick={() => submitAssignment(assignment.id)} disabled={!submissions[assignment.id]?.file}>
                Submit
              </button>
            </li>
          ))}
        </ul>
        <Link to="/student-dashboard" className="custom-link">Back to Dashboard</Link>
      </div>
    </div>
  );
};

export default StudentAssignments;
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const TeacherAssignments = () => {
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [newAssignment, setNewAssignment] = useState({ title: '', description: '', due_date: '' });
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await axios.get('http://localhost:5000/api/classes', { headers: { Authorization: `Bearer ${token}` } });
      setClasses(res.data || []);
    } catch (err) {
      console.error('Fetch classes error:', err.response?.data || err.message);
      setError('Failed to fetch classes.');
    }
  };

  const fetchSubjectsAndAssignments = async (classId) => {
    const token = localStorage.getItem('token');
    try {
      const [subjectRes, assignmentRes] = await Promise.all([
        axios.get(`http://localhost:5000/api/subjects/${classId}`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`http://localhost:5000/api/assignments/${classId}`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setSubjects(subjectRes.data || []);
      setAssignments(assignmentRes.data || []);
    } catch (err) {
      console.error('Fetch subjects/assignments error:', err.response?.data || err.message);
      setError('Failed to fetch subjects or assignments.');
    }
  };

  const handleClassSelect = (cls) => {
    setSelectedClass(cls);
    fetchSubjectsAndAssignments(cls.id);
  };

  const handleInputChange = (e) => {
    setNewAssignment({ ...newAssignment, [e.target.name]: e.target.value });
  };

  const createAssignment = async () => {
    const token = localStorage.getItem('token');
    try {
      await axios.post(
        'http://localhost:5000/api/assignments',
        { subject_id: selectedSubject.id, ...newAssignment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchSubjectsAndAssignments(selectedClass.id);
      setNewAssignment({ title: '', description: '', due_date: '' });
      setSelectedClass(null);
      setSelectedSubject(null);
    } catch (err) {
      console.error('Create assignment error:', err.response?.data || err.message);
      setError('Failed to create assignment.');
    }
  };

  return (
    <div className="dashboard-container">
      <h2>Assignments</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {!selectedClass ? (
        <div className="form-group">
          <h3>Select Class</h3>
          <ul>
            {classes.map(cls => (
              <li key={cls.id} onClick={() => handleClassSelect(cls)}>{cls.year}-{cls.division}</li>
            ))}
          </ul>
          <Link to="/teacher-dashboard" className="custom-link">Back</Link>
        </div>
      ) : (
        <>
          <h3>{selectedClass.year}-{selectedClass.division}</h3>
          <select className="styled-select" onChange={(e) => setSelectedSubject(subjects.find(s => s.id === parseInt(e.target.value)))} value={selectedSubject?.id || ''}>
            <option value="">Select Subject</option>
            {subjects.map(sub => (
              <option key={sub.id} value={sub.id}>{sub.name}</option>
            ))}
          </select>
          <Link to="/teacher-dashboard" className="custom-link">Back</Link>
          {selectedSubject && (
            <div className="form-group">
              <h4>Create Assignment for {selectedSubject.name}</h4>
              <input name="title" placeholder="Title" value={newAssignment.title} onChange={handleInputChange} />
              <input name="description" placeholder="Description" value={newAssignment.description} onChange={handleInputChange} />
              <input type="date" name="due_date" value={newAssignment.due_date} onChange={handleInputChange} />
              <button onClick={createAssignment}>Create</button>
              <Link to="/teacher-dashboard" className="custom-link">Back</Link>
              <h4>Existing Assignments</h4>
              <ul>
                {assignments.map(assignment => (
                  <li key={assignment.id}>{assignment.title} - Due: {new Date(assignment.due_date).toLocaleDateString()}</li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default TeacherAssignments;
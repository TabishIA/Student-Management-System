import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const TeacherAttendance = () => {
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
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

  const fetchSubjectsAndStudents = async (classId) => {
    const token = localStorage.getItem('token');
    try {
      const [subjectRes, studentRes] = await Promise.all([
        axios.get(`http://localhost:5000/api/subjects/${classId}`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`http://localhost:5000/api/students/${classId}`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setSubjects(subjectRes.data || []);
      setStudents(studentRes.data.sort((a, b) => a.roll_number - b.roll_number) || []);
      setAttendance(studentRes.data.reduce((acc, student) => ({
        ...acc,
        [student.id]: { present: false },
      }), {}) || {});
    } catch (err) {
      console.error('Fetch subjects/students error:', err.response?.data || err.message);
      setError('Failed to fetch subjects or students.');
    }
  };

  const handleClassSelect = (cls) => {
    setSelectedClass(cls);
    fetchSubjectsAndStudents(cls.id);
  };

  const handleAttendanceChange = (studentId) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: { present: !prev[studentId].present },
    }));
  };

  const submitAttendance = async () => {
    const token = localStorage.getItem('token');
    try {
      const attendanceData = Object.entries(attendance).map(([studentId, status]) => ({
        student_id: parseInt(studentId),
        is_present: status.present,
      }));
      await axios.post(
        'http://localhost:5000/api/attendance',
        { subject_id: selectedSubject.id, date: new Date().toISOString().split('T')[0], attendance: attendanceData },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Attendance submitted');
      setSelectedClass(null);
      setSelectedSubject(null);
    } catch (err) {
      console.error('Submit attendance error:', err.response?.data || err.message);
      setError('Failed to submit attendance.');
    }
  };

  return (
    <div className="dashboard-container">
      <h2>Record Attendance</h2>
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
              <h4>Attendance for {selectedSubject.name}</h4>
              <table>
                <thead>
                  <tr>
                    <th>Roll No</th>
                    <th>Name</th>
                    <th>Present</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map(student => (
                    <tr key={student.id}>
                      <td>{student.roll_number}</td>
                      <td>{student.name}</td>
                      <td>
                        <input
                          type="checkbox"
                          checked={attendance[student.id]?.present || false}
                          onChange={() => handleAttendanceChange(student.id)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button onClick={submitAttendance}>Submit</button>
              <Link to="/teacher-dashboard" className="custom-link">Back</Link>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default TeacherAttendance;
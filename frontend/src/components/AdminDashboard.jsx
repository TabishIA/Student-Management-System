import { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/AdminDashboard.css'

const AdminDashboard = () => {
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [newClass, setNewClass] = useState({ year: '', division: '' });
  const [newStudent, setNewStudent] = useState({ registration_number: '', name: '', password: '', year: '', division: '', roll_number: '' });
  const [newStaff, setNewStaff] = useState({ staff_id: '', name: '', password: '', role: 'teacher' });
  const [newBatch, setNewBatch] = useState({ class_id: '', batch_name: '' });
  const [newSubject, setNewSubject] = useState({ name: '', class_id: '' });
  const [newAssignment, setNewAssignment] = useState({ class_id: '', subject_id: '', teacher_id: '' });
  const [newStudentBatch, setNewStudentBatch] = useState({ roll_number: '', student_id: '', batch_id: '' });
  const [studentDetails, setStudentDetails] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const token = localStorage.getItem('token');
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const classRes = await axios.get('http://localhost:5000/api/admin/classes', config);
      const studentRes = await axios.get('http://localhost:5000/api/admin/students', config);
      const teacherRes = await axios.get('http://localhost:5000/api/admin/teachers', config);
      setClasses(classRes.data);
      setStudents(studentRes.data);
      setTeachers(teacherRes.data);
    } catch (err) {
      console.error('Fetch error:', err.response?.data || err.message);
    }
  };

  const fetchSubjects = async (classId) => {
    const token = localStorage.getItem('token');
    try {
      const res = await axios.get(`http://localhost:5000/api/admin/subjects/${classId}`, { headers: { Authorization: `Bearer ${token}` } });
      setSubjects(res.data);
    } catch (err) {
      console.error('Fetch subjects error:', err.response?.data || err.message);
    }
  };

  const fetchStudentDetails = async (rollNumber) => {
    const token = localStorage.getItem('token');
    try {
      const res = await axios.get(`http://localhost:5000/api/admin/student/roll/${rollNumber}`, { headers: { Authorization: `Bearer ${token}` } });
      setStudentDetails(res.data);
      setNewStudentBatch(prev => ({ ...prev, student_id: res.data.id }));
    } catch (err) {
      console.error('Fetch student error:', err.response?.data || err.message);
      setStudentDetails(null);
    }
  };

  const handleInputChange = (setter) => (e) => setter((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const addClass = async () => {
    const token = localStorage.getItem('token');
    const schoolId = JSON.parse(atob(token.split('.')[1])).school_id || 1;
    try {
      await axios.post('http://localhost:5000/api/admin/classes', { ...newClass, school_id: schoolId }, { headers: { Authorization: `Bearer ${token}` } });
      setNewClass({ year: '', division: '' });
      fetchData();
      alert('Class added successfully!');
    } catch (err) {
      console.error('Add class error:', err.response?.data || err.message);
    }
  };

  const addStudent = async () => {
    const token = localStorage.getItem('token');
    const schoolId = JSON.parse(atob(token.split('.')[1])).school_id || 1;
    try {
      await axios.post('http://localhost:5000/api/admin/students', { ...newStudent, school_id: schoolId }, { headers: { Authorization: `Bearer ${token}` } });
      setNewStudent({ registration_number: '', name: '', password: '', year: '', division: '', roll_number: '' });
      fetchData();
      alert('Student added successfully!');
    } catch (err) {
      console.error('Add student error:', err.response?.data || err.message);
    }
  };

  const addStaff = async () => {
    const token = localStorage.getItem('token');
    const schoolId = JSON.parse(atob(token.split('.')[1])).school_id || 1;
    try {
      await axios.post('http://localhost:5000/api/admin/staff', { ...newStaff, school_id: schoolId }, { headers: { Authorization: `Bearer ${token}` } });
      setNewStaff({ staff_id: '', name: '', password: '', role: 'teacher' });
      fetchData();
      alert('Staff added successfully!');
    } catch (err) {
      console.error('Add staff error:', err.response?.data || err.message);
    }
  };

  const addBatch = async () => {
    const token = localStorage.getItem('token');
    const schoolId = JSON.parse(atob(token.split('.')[1])).school_id || 1;
    try {
      await axios.post('http://localhost:5000/api/admin/batches', { ...newBatch, school_id: schoolId }, { headers: { Authorization: `Bearer ${token}` } });
      setNewBatch({ class_id: '', batch_name: '' });
      fetchData();
      alert('Batch added successfully!');
    } catch (err) {
      console.error('Add batch error:', err.response?.data || err.message);
    }
  };

  const addSubject = async () => {
    const token = localStorage.getItem('token');
    const schoolId = JSON.parse(atob(token.split('.')[1])).school_id || 1;
    try {
      await axios.post('http://localhost:5000/api/admin/subjects', { ...newSubject, school_id: schoolId }, { headers: { Authorization: `Bearer ${token}` } });
      setNewSubject({ name: '', class_id: '' });
      fetchData();
      alert('Subject added successfully!');
    } catch (err) {
      console.error('Add subject error:', err.response?.data || err.message);
    }
  };

  const assignTeacher = async () => {
    const token = localStorage.getItem('token');
    const schoolId = JSON.parse(atob(token.split('.')[1])).school_id || 1;
    try {
      await axios.post('http://localhost:5000/api/admin/class-subjects-teachers', { ...newAssignment, school_id: schoolId }, { headers: { Authorization: `Bearer ${token}` } });
      setNewAssignment({ class_id: '', subject_id: '', teacher_id: '' });
      fetchData();
      alert('Teacher assigned successfully!');
    } catch (err) {
      console.error('Assign teacher error:', err.response?.data || err.message);
    }
  };

  const assignStudentToBatch = async () => {
    const token = localStorage.getItem('token');
    const schoolId = JSON.parse(atob(token.split('.')[1])).school_id || 1;
    try {
      await axios.post('http://localhost:5000/api/admin/student-batches', { student_id: newStudentBatch.student_id, batch_id: newStudentBatch.batch_id, school_id: schoolId }, { headers: { Authorization: `Bearer ${token}` } });
      setNewStudentBatch({ roll_number: '', student_id: '', batch_id: '' });
      setStudentDetails(null);
      fetchData();
      alert('Student assigned to batch successfully!');
    } catch (err) {
      console.error('Assign student error:', err.response?.data || err.message);
    }
  };

  return (
    <div className="dashboard-container">
      <h2>Admin Dashboard</h2>

      <div className="form-box">
        <h3>Add Class</h3>
        <div className="form-group">
          <input name="year" placeholder="Year" value={newClass.year} onChange={handleInputChange(setNewClass)} />
          <input name="division" placeholder="Division" value={newClass.division} onChange={handleInputChange(setNewClass)} />
          <button onClick={addClass}>Add Class</button>
        </div>
      </div>

      <div className="form-box">
        <h3>Add Student</h3>
        <div className="form-group">
          <input name="registration_number" placeholder="Registration Number" value={newStudent.registration_number} onChange={handleInputChange(setNewStudent)} />
          <input name="name" placeholder="Name" value={newStudent.name} onChange={handleInputChange(setNewStudent)} />
          <input name="password" placeholder="Password" value={newStudent.password} onChange={handleInputChange(setNewStudent)} />
          <input name="year" placeholder="Year" value={newStudent.year} onChange={handleInputChange(setNewStudent)} />
          <input name="division" placeholder="Division" value={newStudent.division} onChange={handleInputChange(setNewStudent)} />
          <input name="roll_number" placeholder="Roll Number" value={newStudent.roll_number} onChange={handleInputChange(setNewStudent)} />
          <button onClick={addStudent}>Add Student</button>
        </div>
      </div>

      <div className="form-box">
        <h3>Add Staff</h3>
        <div className="form-group">
          <input name="staff_id" placeholder="Staff ID" value={newStaff.staff_id} onChange={handleInputChange(setNewStaff)} />
          <input name="name" placeholder="Name" value={newStaff.name} onChange={handleInputChange(setNewStaff)} />
          <input name="password" placeholder="Password" value={newStaff.password} onChange={handleInputChange(setNewStaff)} />
          <select name="role" value={newStaff.role} onChange={handleInputChange(setNewStaff)}>
            <option value="teacher">Teacher</option>
            <option value="admin">Admin</option>
          </select>
          <button onClick={addStaff}>Add Staff</button>
        </div>
      </div>

      <div className="form-box">
        <h3>Add Batch</h3>
        <div className="form-group">
          <select name="class_id" value={newBatch.class_id} onChange={handleInputChange(setNewBatch)}>
            <option value="">Select Class</option>
            {classes.map((cls) => (
              <option key={cls.id} value={cls.id}>{cls.year}-{cls.division}</option>
            ))}
          </select>
          <input name="batch_name" placeholder="Batch Name" value={newBatch.batch_name} onChange={handleInputChange(setNewBatch)} />
          <button onClick={addBatch}>Add Batch</button>
        </div>
      </div>

      <div className="form-box">
        <h3>Add Subject</h3>
        <div className="form-group">
          <select name="class_id" value={newSubject.class_id} onChange={handleInputChange(setNewSubject)}>
            <option value="">Select Class</option>
            {classes.map((cls) => (
              <option key={cls.id} value={cls.id}>{cls.year}-{cls.division}</option>
            ))}
          </select>
          <input name="name" placeholder="Subject Name" value={newSubject.name} onChange={handleInputChange(setNewSubject)} />
          <button onClick={addSubject}>Add Subject</button>
        </div>
      </div>

      <div className="form-box">
        <h3>Assign Teacher to Subject</h3>
        <div className="form-group">
          <select name="class_id" value={newAssignment.class_id} onChange={(e) => { handleInputChange(setNewAssignment)(e); fetchSubjects(e.target.value); }}>
            <option value="">Select Class</option>
            {classes.map((cls) => (
              <option key={cls.id} value={cls.id}>{cls.year}-{cls.division}</option>
            ))}
          </select>
          <select name="subject_id" value={newAssignment.subject_id} onChange={handleInputChange(setNewAssignment)}>
            <option value="">Select Subject</option>
            {subjects.map((sub) => (
              <option key={sub.id} value={sub.id}>{sub.name}</option>
            ))}
          </select>
          <select name="teacher_id" value={newAssignment.teacher_id} onChange={handleInputChange(setNewAssignment)}>
            <option value="">Select Teacher</option>
            {teachers.map((teacher) => (
              <option key={teacher.id} value={teacher.id}>{teacher.name}</option>
            ))}
          </select>
          <button onClick={assignTeacher}>Assign Teacher</button>
        </div>
      </div>

      <div className="form-box">
        <h3>Assign Student to Batch</h3>
        <div className="form-group">
          <input
            name="roll_number"
            placeholder="Student Roll Number"
            value={newStudentBatch.roll_number}
            onChange={(e) => {
              handleInputChange(setNewStudentBatch)(e);
              fetchStudentDetails(e.target.value);
            }}
          />
          {studentDetails && (
            <div className="student-details">
              <p>Name: {studentDetails.name}</p>
              <p>Roll No: {studentDetails.roll_number}</p>
              <p>Class: {studentDetails.year}-{studentDetails.division}</p>
            </div>
          )}
          <select name="batch_id" value={newStudentBatch.batch_id} onChange={handleInputChange(setNewStudentBatch)}>
            <option value="">Select Batch</option>
            {studentDetails && classes.find(cls => cls.year === studentDetails.year && cls.division === studentDetails.division)?.batches?.map(batch => (
              <option key={batch.id} value={batch.id}>{batch.batch_name}</option>
            ))}
          </select>
          <button onClick={assignStudentToBatch}>Assign to Batch</button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
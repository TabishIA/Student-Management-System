import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import TeacherDashboard from './components/TeacherDashboard';
import TeacherAttendance from './components/TeacherAttendance';
import TeacherMarks from './components/TeacherMarks';
import TeacherAssignments from './components/TeacherAssignments';
import Announcements from './components/Announcements';
import Header from './components/Header';
import Login from './components/Login';
import AdminDashboard from './components/AdminDashboard';
import StudentDashboard from './components/StudentDashboard';
import StudentAssignments from './components/StudentAssignments';
import StudentProfile from './components/StudentProfile';
import StudentAttendance from './components/StudentAttendance';
import StudentMarks from './components/StudentMarks';
import './styles/global.css';

const ProtectedRoute = ({ role, children }) => {
  const userRole = localStorage.getItem('role');
  return userRole === role ? children : <Navigate to={`/${userRole}-dashboard`} />;
};

function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/teacher-dashboard" element={<TeacherDashboard />} />
        <Route path="/teacher-attendance" element={<TeacherAttendance />} />
        <Route path="/teacher-marks" element={<TeacherMarks />} />
        <Route path="/teacher-assignments" element={<TeacherAssignments />} />
        <Route path="/announcements" element={<ProtectedRoute role="teacher"><Announcements /></ProtectedRoute>} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/student-dashboard" element={<StudentDashboard />} />
        <Route path="/student-assignments" element={<StudentAssignments />} />
        <Route path="/student-profile" element={<StudentProfile />} />
        <Route path="/student-attendance" element={<StudentAttendance />} />
        <Route path="/student-marks" element={<StudentMarks />} />
        <Route path="/" element={<Login />} />
      </Routes>
    </Router>
  );
}

export default App;
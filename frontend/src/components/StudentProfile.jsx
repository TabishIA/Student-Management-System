import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import '../styles/StudentProfile.css';

const StudentProfile = () => {
  const [profile, setProfile] = useState({
    class: '',
    batch: '',
    roll_number: '',
    registration_id: '',
    name: '',
    mobile_number: '',
    email: '',
    parent_contact: '',
  });
  const [editMode, setEditMode] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const token = localStorage.getItem('token');
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const decoded = JSON.parse(atob(token.split('.')[1]));
      const studentId = decoded.id;

      const res = await axios.get(`http://localhost:5000/api/student/profile/${studentId}`, config);
      const profileData = res.data || {
        email: '',
        mobile_number: '',
        parent_contact: '',
        name: '',
        registration_id: '',
        roll_number: '',
        class: '',
        batch: '',
      };
      setProfile(profileData);
    } catch (err) {
      console.error('Fetch profile error:', err.response?.data || err.message);
      setError('Failed to fetch profile.');
    }
  };

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const saveProfile = async () => {
    const token = localStorage.getItem('token');
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const decoded = JSON.parse(atob(token.split('.')[1]));
      const studentId = decoded.id;

      await axios.put(`http://localhost:5000/api/student/profile/${studentId}`, {
        email: profile.email,
        mobile_number: profile.mobile_number,
        parent_contact: profile.parent_contact,
      }, config);

      setEditMode(false);
      alert('Profile updated successfully!');
      fetchProfile(); // Refresh data
    } catch (err) {
      console.error('Update profile error:', err.response?.data || err.message);
      setError('Failed to update profile.');
    }
  };

  return (
    <div className="dashboard-container">
      <h2>Student Profile</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <div className="card">
        <h3>Student Profile {editMode ? <button onClick={saveProfile}>Save</button> : <button onClick={() => setEditMode(true)}>Edit</button>}</h3>
        <div className="profile-details">
          <p><strong>Class:</strong> {profile.class || 'N/A'}</p>
          <p><strong>Batch:</strong> {profile.batch || 'N/A'}</p>
          <p><strong>Roll Number:</strong> {profile.roll_number || 'N/A'}</p>
          <p><strong>Registration ID:</strong> {profile.registration_id || 'N/A'}</p>
          <p><strong>Name:</strong> {profile.name || 'N/A'}</p>
          <p><strong>Mobile:</strong> {editMode ? <input name="mobile_number" value={profile.mobile_number} onChange={handleChange} /> : profile.mobile_number || 'N/A'}</p>
          <p><strong>Email:</strong> {editMode ? <input name="email" value={profile.email} onChange={handleChange} /> : profile.email || 'N/A'}</p>
          <p><strong>Parent Contact:</strong> {editMode ? <input name="parent_contact" value={profile.parent_contact} onChange={handleChange} /> : profile.parent_contact || 'N/A'}</p>
        </div>
        <Link to="/student-dashboard" className="custom-link">Back to Dashboard</Link>
      </div>
    </div>
  );
};

export default StudentProfile;
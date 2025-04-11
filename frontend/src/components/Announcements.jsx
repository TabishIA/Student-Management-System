import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Announcements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [newAnnouncement, setNewAnnouncement] = useState({ title: '', content: '' });
  const role = localStorage.getItem('role');
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  useEffect(() => {
    if (role === 'teacher') {
      fetchAnnouncements();
    } else {
      setError('You do not have permission to view announcements.');
    }
  }, [role]); // Dependency on role to avoid re-fetching

  const fetchAnnouncements = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await axios.get('http://localhost:5000/api/announcements', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAnnouncements(res.data || []);
      setError(null); // Clear error on success
    } catch (err) {
      console.error('Fetch announcements error:', err.response?.data || err.message);
      setError('You do not have permission to view announcements.');
    }
  };

  const handleInputChange = (e) => {
    setNewAnnouncement({ ...newAnnouncement, [e.target.name]: e.target.value });
  };

  const postAnnouncement = async () => {
    const token = localStorage.getItem('token');
    try {
      await axios.post('http://localhost:5000/api/announcements', newAnnouncement, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNewAnnouncement({ title: '', content: '' });
      fetchAnnouncements();
    } catch (err) {
      console.error('Post announcement error:', err.response?.data || err.message);
      setError('Failed to post announcement.');
    }
  };

  const deleteAnnouncement = async (announcementId) => {
    const token = localStorage.getItem('token');
    try {
      await axios.delete(`http://localhost:5000/api/announcements/${announcementId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchAnnouncements();
    } catch (err) {
      console.error('Delete announcement error:', err.response?.data || err.message);
      setError('Failed to delete announcement.');
    }
  };

  const handleBack = () => {
    navigate(role === 'student' ? '/student-dashboard' : '/teacher-dashboard');
  };

  // Render only for teachers, show error for others
  if (role !== 'teacher') {
    return (
      <div className="dashboard-container">
        <h2>Announcements</h2>
        <p style={{ color: 'red' }}>{error}</p>
        <button onClick={handleBack} className="custom-link">Back</button>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <h2>Announcements</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <div className="form-group">
        <h3>New Announcement</h3>
        <input name="title" placeholder="Title" value={newAnnouncement.title} onChange={handleInputChange} />
        <input name="content" placeholder="Content" value={newAnnouncement.content} onChange={handleInputChange} />
        <button onClick={postAnnouncement}>Post</button>
      </div>
      <ul>
        {announcements.length > 0 ? (
          announcements.map((ann) => (
            <li key={ann.id}>
              <strong>{ann.title}</strong> - {ann.content} ({new Date(ann.created_at).toLocaleString()})
              <button onClick={() => deleteAnnouncement(ann.id)}>Delete</button>
            </li>
          ))
        ) : (
          <li>No announcements available</li>
        )}
      </ul>
      <button onClick={handleBack} className="custom-link">Back</button>
    </div>
  );
};

export default Announcements;
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for redirection
import '../styles/Header.css';

const Header = () => {
  const [userName, setUserName] = useState('');
  const navigate = useNavigate(); // Hook for navigation

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const decoded = JSON.parse(atob(token.split('.')[1]));
      setUserName(decoded.name || 'User');
    }
  }, []);

  const handleLogout = () => {
    localStorage.clear(); // Clear all localStorage data (token, user info, etc.)
    navigate('/login'); // Redirect to login page
  };

  return (
    <header className="header">
      <h1>SchoolSync</h1>
      <div className="header-right">
        {userName && <span className="user-name">{userName}</span>}
        {userName && (
          <button className="logout-button" onClick={handleLogout}>
            Logout
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;
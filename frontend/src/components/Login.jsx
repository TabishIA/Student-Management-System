import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/Login.css';

const Login = () => {
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    console.log('Login attempt:', { id, password });
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', { id, password });
      console.log('Login response:', res.data);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('role', res.data.role);
      navigate(`/${res.data.role}-dashboard`);
    } catch (err) {
      console.error('Login error:', err.response?.data || err.message);
      setError('Invalid credentials');
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      <form className="form-group" onSubmit={handleLogin}>
        <input
          type="text"
          placeholder="Staff ID / Registration Number"
          value={id}
          onChange={(e) => setId(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Login</button>
        {error && <p className="error">{error}</p>}
      </form>
    </div>
  );
};

export default Login;
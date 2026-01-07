import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const LoginPage = () => {
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', form);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('username', res.data.username);
      toast.success('Zalogowano pomyślnie!');
      navigate('/user');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Błąd logowania');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="start-form">
      <h2>Logowanie</h2>

      <label>Nazwa użytkownika lub e-mail:</label>
      <input name="username" value={form.username} onChange={handleChange} required />

      <label>Hasło:</label>
      <input name="password" type="password" value={form.password} onChange={handleChange} required />

      { <p style={{ color: 'red' }}></p>}

      <button type="submit">Zaloguj się</button>
    </form>
  );
};

export default LoginPage;


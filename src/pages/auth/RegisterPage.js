import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const RegisterPage = () => {
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await axios.post('http://localhost:5000/api/auth/register', form);
      toast.success('Konto zostało utworzone!');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Błąd rejestracji');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="start-form">
      <h2>Rejestracja</h2>

      <label>Nazwa użytkownika:</label>
      <input name="username" value={form.username} onChange={handleChange} required />

      <label>E-mail:</label>
      <input name="email" value={form.email} onChange={handleChange} required type="email" />

      <label>Hasło:</label>
      <input name="password" value={form.password} onChange={handleChange} required type="password" />

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <button type="submit">Zarejestruj się</button>
    </form>
  );
};

export default RegisterPage;


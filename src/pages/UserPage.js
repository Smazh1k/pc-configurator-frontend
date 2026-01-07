import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const UserPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchUser = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/user/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser(res.data);
      } catch (err) {
        console.error(err);
        toast.error('Sesja wygasła, zaloguj się ponownie.');
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        navigate('/login');
      }
    };

    fetchUser();
  }, [navigate, token]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    toast.success('Wylogowano!');
    navigate('/');
  };

  if (!user) return null;

  return (
    <div className="start-form">
      <h2>Mój profil</h2>
      <p><strong>Nazwa użytkownika:</strong> {user.username}</p>
      <p><strong>Adres e-mail:</strong> {user.email}</p>

      <hr style={{ margin: '1.5rem 0' }} />

      <h3>Moje zapisane konfiguracje</h3>
      <ul>
        <li>🔧 Brak zapisanych konfiguracji</li>
      </ul>

      <Link to="/start">
        <button style={{ marginTop: '1rem' }}>Rozpocznij nową konfigurację</button>
      </Link>

      <button
        onClick={handleLogout}
        style={{ backgroundColor: '#dc3545', color: '#fff', marginTop: '1rem' }}
      >
        Wyloguj się
      </button>
    </div>
  );
};

export default UserPage;

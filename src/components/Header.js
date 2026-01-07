import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Header.css';


const Header = () => {
  const username = localStorage.getItem('username');
  const token = localStorage.getItem('token');
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    navigate('/');
  };

  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className="header">
      <div className="nav-links">
        <Link to="/">Strona główna</Link>
        <Link to="/start">Konfigurator</Link>
      </div>

   <nav ref={dropdownRef} className="dropdown">
  {!token ? (
    <div className="nav-links">
      <Link to="/login">Zaloguj się</Link>
      <Link to="/register">Rejestracja</Link>
    </div>
  ) : (
    <div style={{ cursor: 'pointer', userSelect: 'none' }}>
      <span onClick={() => setShowDropdown(!showDropdown)}>
        👤 {username}
      </span>

      {showDropdown && (
        <div className="dropdown-menu">
          <Link to="/user">Mój profil</Link>
          <button onClick={handleLogout}>Wyloguj się</button>
        </div>
      )}
    </div>
  )}
</nav>
    </header>
  );
};

export default Header;

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthModal from './AuthModal';

const Navbar = ({ user, setUser }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/'); // Кидаем на главную после выхода
  };

  return (
    <>
      <nav className="bg-white shadow-sm border-b px-6 py-4 flex justify-between items-center">
        {/* Логотип */}
        <Link to="/" className="text-2xl font-black text-primary tracking-tight">
          🧠 SmartBuild
        </Link>
        
        <div className="flex items-center gap-6">
          <Link to="/" className="text-slate-600 hover:text-primary transition font-medium">Konfigurator</Link>
          
          {/* Ссылка на админку (видна только админу) */}
          {user?.role === 'admin' && (
            <Link to="/admin" className="text-red-500 hover:text-red-600 transition font-bold">Admin Panel</Link>
          )}

          {/* Состояние входа */}
          {user ? (
            <div className="flex items-center gap-4 border-l pl-4">
              <Link to="/profile" className="text-dark hover:text-primary transition font-semibold">
                {user.username}
              </Link>
              <button 
                onClick={handleLogout} 
                className="text-sm text-slate-400 hover:text-red-500 transition"
              >
                Wyloguj
              </button>
            </div>
          ) : (
            <button 
              onClick={() => setIsModalOpen(true)} 
              className="bg-primary hover:bg-primaryHover text-white px-5 py-2.5 rounded-lg font-semibold transition shadow-md shadow-primary/30"
            >
              Zaloguj się
            </button>
          )}
        </div>
      </nav>
      
      {/* Само окно (рендерится поверх всего) */}
      <AuthModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} setUser={setUser} />
    </>
  );
};

export default Navbar;
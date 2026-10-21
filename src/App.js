import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Home from './pages/Home';
import Profile from './pages/Profile';
import Admin from './pages/Admin';
import Navbar from './components/Navbar';
import SharedBuild from './pages/SharedBuild';

const App = () => {
  // Синхронно читаем localStorage при инициализации, убирая пустой useEffect
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        return JSON.parse(storedUser);
      } catch (e) {
        localStorage.removeItem('user');
        return null;
      }
    }
    return null;
  });

  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Navbar user={user} setUser={setUser} />
        
        <main className="flex-1 w-full max-w-6xl mx-auto p-6">
          <Routes>
            <Route path="/" element={<Home user={user} />} />
            <Route path="/profile" element={user ? <Profile user={user} /> : <Navigate to="/" />} />
            <Route path="/admin" element={user?.role === 'admin' ? <Admin /> : <Navigate to="/" />} />
            <Route path="/shared/:id" element={<SharedBuild />} />
          </Routes>
        </main>

        <ToastContainer position="bottom-right" autoClose={3000} />
      </div>
    </Router>
  );
};

export default App;
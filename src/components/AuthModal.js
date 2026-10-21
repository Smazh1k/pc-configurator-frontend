import React, { useState } from 'react';
import { toast } from 'react-toastify';
import client from '../api/client';

const AuthModal = ({ isOpen, onClose, setUser }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (isLogin) {
        // Логин
        const res = await client.post('/auth/login', { username: form.username, password: form.password });
        localStorage.setItem('token', res.data.token);
        
        const userData = { id: res.data.id, username: res.data.username, role: res.data.role };
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        
        toast.success('Zalogowano pomyślnie!');
        onClose(); // Закрываем окно
      } else {
        // Регистрация
        await client.post('/auth/register', form);
        toast.success('Konto utworzone! Możesz się teraz zalogować.');
        setIsLogin(true); // Переключаем на вкладку логина
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Wystąpił błąd');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4 transition-opacity">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 relative">
        
        {/* Кнопка закрытия */}
        <button onClick={onClose} className="absolute top-4 right-5 text-slate-400 hover:text-red-500 text-3xl font-light transition">
          &times;
        </button>
        
        <h2 className="text-3xl font-bold text-dark mb-6 text-center">
          {isLogin ? 'Witaj ponownie 👋' : 'Dołącz do nas 🚀'}
        </h2>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input 
            name="username" 
            placeholder="Nazwa użytkownika" 
            value={form.username} 
            onChange={handleChange} 
            required 
            className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/50 transition" 
          />
          
          {!isLogin && (
            <input 
              name="email" 
              type="email" 
              placeholder="E-mail" 
              value={form.email} 
              onChange={handleChange} 
              required 
              className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/50 transition" 
            />
          )}
          
          <input 
            name="password" 
            type="password" 
            placeholder="Hasło" 
            value={form.password} 
            onChange={handleChange} 
            required 
            className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/50 transition" 
          />
          
          <button 
            type="submit" 
            disabled={loading} 
            className="w-full bg-primary hover:bg-primaryHover text-white font-bold py-3 rounded-lg mt-2 transition transform hover:-translate-y-0.5"
          >
            {loading ? 'Przetwarzanie...' : (isLogin ? 'Zaloguj się' : 'Zarejestruj się')}
          </button>
        </form>
        
        <div className="mt-6 text-center text-slate-500">
          {isLogin ? 'Nie masz konta? ' : 'Masz już konto? '}
          <button 
            onClick={() => setIsLogin(!isLogin)} 
            className="text-primary font-bold hover:underline"
          >
            {isLogin ? 'Zarejestruj się' : 'Zaloguj się'}
          </button>
        </div>
        
      </div>
    </div>
  );
};

export default AuthModal;
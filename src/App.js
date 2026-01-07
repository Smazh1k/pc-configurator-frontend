import React from 'react';
import StartForm from './pages/StartForm';
import ConfiguratorPage from './pages/ConfiguratorPage';
import RegisterPage from './pages/auth/RegisterPage';
import LoginPage from './pages/auth/LoginPage';
import UserPage from './pages/UserPage';
import HomePage from './pages/HomePage';
import AutoBuildPage from "./pages/AutoBuildPage";
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/start" element={<StartForm />} />
        <Route path="/configurator" element={<ConfiguratorPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/user" element={<UserPage />} />
        <Route path="/autobuild" element={<AutoBuildPage />} />
      </Routes>
      <ToastContainer position="bottom-right" autoClose={3000} />
    </Router>
  );
}

export default App;

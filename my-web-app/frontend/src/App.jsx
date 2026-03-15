import React from 'react';
import { NavLink, Route, Routes } from 'react-router-dom';
import ClientDashboardPage from './pages/ClientDashboardPage';
import SignupPage from './pages/SignupPage';
import TrainerDashboardPage from './pages/TrainerDashboardPage';
import './styles.css';

const App = () => {
  return (
    <main className="app-shell">
      <h1>FitMarket</h1>
      <nav className="top-nav">
        <NavLink to="/" end className={({ isActive }) => (isActive ? 'active-link' : '')}>
          Sign Up
        </NavLink>
        <NavLink to="/client" className={({ isActive }) => (isActive ? 'active-link' : '')}>
          Client Dashboard
        </NavLink>
        <NavLink to="/trainer" className={({ isActive }) => (isActive ? 'active-link' : '')}>
          Trainer Dashboard
        </NavLink>
      </nav>

      <Routes>
        <Route path="/" element={<SignupPage />} />
        <Route path="/client" element={<ClientDashboardPage />} />
        <Route path="/trainer" element={<TrainerDashboardPage />} />
      </Routes>
    </main>
  );
};

export default App;

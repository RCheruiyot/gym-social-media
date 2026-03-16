import React from 'react';
import { NavLink, Route, Routes, useNavigate } from 'react-router-dom';
import RequireRole from './auth/RequireRole';
import { useRole } from './auth/RoleContext';
import ClientDashboardPage from './pages/ClientDashboardPage';
import SignupPage from './pages/SignupPage';
import TrainerDashboardPage from './pages/TrainerDashboardPage';
import './styles.css';
import { Button, Flex, Heading } from '@radix-ui/themes';

const App = () => {
  const { role, clearRole } = useRole();
  const navigate = useNavigate();

  return (
    <>
    <Flex align={"center"}><Heading>FitMarket</Heading></Flex>
      <main className="app-shell">
        <Flex justify="between" align="center" className="app-header">    
          <Flex align={"end"}>
            {/* <NavLink to="/" end className={({ isActive }) => (isActive ? 'active-link' : '')}>
              Sign Up
            </NavLink>
            {role === 'client' && (
              <NavLink to="/client" className={({ isActive }) => (isActive ? 'active-link' : '')}>
                Client Dashboard
              </NavLink>
            )}
            {role === 'trainer' && (
              <NavLink to="/trainer" className={({ isActive }) => (isActive ? 'active-link' : '')}>
                Trainer Dashboard
              </NavLink>
            )} */}
          
            

          </Flex>
        </Flex>
        <Routes>
          <Route path="/" element={<SignupPage />} />
          <Route
            path="/client"
            element={
              <RequireRole allowedRole="client">
                <ClientDashboardPage />
              </RequireRole>
            }
          />
          <Route
            path="/trainer"
            element={
              <RequireRole allowedRole="trainer">
                <TrainerDashboardPage />
              </RequireRole>
            }
          />
        </Routes>
      </main>
    </>

  );
};

export default App;

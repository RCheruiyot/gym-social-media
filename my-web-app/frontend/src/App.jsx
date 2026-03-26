import React from 'react';
import { Route, Routes } from 'react-router-dom';
import RequireRole from './auth/RequireRole';
import ClientDashboardPage from './pages/ClientDashboardPage';
import FindTrainerPage from './pages/FindTrainerPage';
import SessionsPage from './pages/SessionsPage';
import SignupPage from './pages/SignupPage';
import TrainerDashboardPage from './pages/TrainerDashboardPage';
import './styles.css';
import { Flex, Heading } from '@radix-ui/themes';

const App = () => {
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
            path="/client/find-trainer"
            element={
              <RequireRole allowedRole="client">
                <FindTrainerPage />
              </RequireRole>
            }
          />
          <Route
            path="/client/sessions"
            element={
              <RequireRole allowedRole="client">
                <SessionsPage />
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
          <Route
            path="/trainer/schedule"
            element={
              <RequireRole allowedRole="trainer">
                <SessionsPage />
              </RequireRole>
            }
          />
        </Routes>
      </main>
    </>

  );
};

export default App;

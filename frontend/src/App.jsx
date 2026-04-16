import React from 'react';
import { Link, NavLink, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import RequireRole from './auth/RequireRole';
import { useRole } from './auth/RoleContext';
import ClientDashboardPage from './pages/ClientDashboardPage';
import FindTrainerPage from './pages/FindTrainerPage';
import SessionsPage from './pages/SessionsPage';
import SignupPage from './pages/SignupPage';
import TrainerDashboardPage from './pages/TrainerDashboardPage';
import './styles.css';
import { Button, Flex, Heading, Text } from '@radix-ui/themes';

const App = () => {
  const { role, clearRole } = useRole();
  const location = useLocation();
  const navigate = useNavigate();
  const trainerTab = new URLSearchParams(location.search).get('tab') || 'schedule';

  return (
    <main className="app-shell">
      <header className="app-topbar">
        <Flex align="center" className="app-brand">
          <Heading>FitMarket</Heading>
        </Flex>
        <nav className="app-nav">
          {role === 'client' ? (
            <>
              <NavLink to="/client" className={({ isActive }) => (isActive ? 'active-link' : '')}>
                <Text>Dashboard</Text>
              </NavLink>
              <NavLink to="/client/find-trainer" className={({ isActive }) => (isActive ? 'active-link' : '')}>
                <Text>Find Trainer</Text>
              </NavLink>
              <NavLink to="/client/sessions" className={({ isActive }) => (isActive ? 'active-link' : '')}>
                <Text>My Sessions</Text>
              </NavLink>
            </>
          ) : null}
          {role === 'trainer' ? (
            <>
              <Link to="/trainer?tab=schedule" className={trainerTab === 'schedule' ? 'active-link' : ''}>
                <Text>Clients</Text>
              </Link>
              <Link to="/trainer?tab=plans" className={trainerTab === 'plans' ? 'active-link' : ''}>
                <Text>Programs</Text>
              </Link>
              <Link to="/trainer?tab=earnings" className={trainerTab === 'earnings' ? 'active-link' : ''}>
                <Text>Payments</Text>
              </Link>
              <Link to="/trainer?tab=profile" className={trainerTab === 'profile' ? 'active-link' : ''}>
                <Text>Profile</Text>
              </Link>
            </>
          ) : null}
        </nav>
        <div className="app-topbar-actions">
          {role ? (
            <Button
              type="button"
              variant="soft"
              onClick={() => {
                clearRole();
                navigate('/');
              }}
            >
              Log out
            </Button>
          ) : null}
        </div>
      </header>

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
  );
};

export default App;

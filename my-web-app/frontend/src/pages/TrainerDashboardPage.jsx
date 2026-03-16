import React from 'react';
import { NavLink, Route, Routes, useNavigate } from 'react-router-dom';
import RequireRole from '../auth/RequireRole';
import { useRole } from '../auth/RoleContext';
import { Button, Flex, Heading } from '@radix-ui/themes';
const TrainerDashboardPage = () => {
  const { role, clearRole } = useRole();
  const navigate = useNavigate();
  return (
    <section>
            <Flex justify={"between"}>
        <Heading>Trainer Dashboard</Heading>
        {role && (
            <Button
              type="button"
              onClick={() => {
                clearRole();
                navigate('/');
              }}
            >
              Log out
            </Button>
        )}
      </Flex>
      <header className="dashboard-header">
        <a href="#clients">Clients</a>
        <a href="#schedule">Schedule</a>
        <a href="#payments">Payments</a>
        <a href="#profile">Profile</a>
      </header>

      <div className="widget-grid">
        <article className="widget-card" id="clients">
          <h3>Client Requests</h3>
          <p>Approve new requests, set onboarding calls, and manage active clients.</p>
        </article>

        <article className="widget-card">
          <h3>Workout Plan Uploads</h3>
          <p>Upload and version workout plans, meal templates, and weekly adjustments.</p>
        </article>

        <article className="widget-card" id="payments">
          <h3>Earnings & Upcoming Sessions</h3>
          <p>Track payout status, booked sessions, and projected weekly earnings.</p>
        </article>
      </div>
    </section>
  );
};

export default TrainerDashboardPage;

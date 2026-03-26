import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useRole } from '../auth/RoleContext';
import { Button, Card, Flex, Heading, Text } from '@radix-ui/themes';
import DashboardCalendarPanel from '../components/DashboardCalendarPanel';
const TrainerDashboardPage = () => {
  const { role, clearRole } = useRole();
  const navigate = useNavigate();
  const [activeWidget, setActiveWidget] = useState('schedule');

  const widgetDetails = {
    schedule: <DashboardCalendarPanel role="trainer" />,
    plans: (
      <Card className="widget-detail-card">
        <Heading size="5">Workout Plan Uploads</Heading>
        <Text color="gray">
          This is the trainer workspace for uploading programs, meal templates, and weekly changes. It is wired
          as a clickable dashboard surface and ready for file upload logic later.
        </Text>
      </Card>
    ),
    earnings: (
      <Card className="widget-detail-card">
        <Heading size="5">Earnings & Upcoming Sessions</Heading>
        <Text color="gray">
          Use this section for payout summaries, completed sessions, and projected revenue. Right now it gives
          you an interactive destination instead of a dead dashboard tile.
        </Text>
      </Card>
    ),
  };

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
        <Link to="/trainer/schedule">Schedule</Link>
        <a href="#payments">Payments</a>
        <a href="#profile">Profile</a>
      </header>

      <div className="widget-grid">
        <button
          type="button"
          className={`widget-card widget-action-card ${activeWidget === 'schedule' ? 'widget-card-active' : ''}`}
          id="clients"
          onClick={() => setActiveWidget('schedule')}
        >
          <h3>Client Requests</h3>
          <p>Approve new requests, set onboarding calls, and manage active clients.</p>
        </button>

        <button
          type="button"
          className={`widget-card widget-action-card ${activeWidget === 'plans' ? 'widget-card-active' : ''}`}
          onClick={() => setActiveWidget('plans')}
        >
          <h3>Workout Plan Uploads</h3>
          <p>Upload and version workout plans, meal templates, and weekly adjustments.</p>
        </button>

        <button
          type="button"
          className={`widget-card widget-action-card ${activeWidget === 'earnings' ? 'widget-card-active' : ''}`}
          id="payments"
          onClick={() => setActiveWidget('earnings')}
        >
          <h3>Earnings & Upcoming Sessions</h3>
          <p>Track payout status, booked sessions, and projected weekly earnings.</p>
        </button>
      </div>

      <div className="widget-detail-section">{widgetDetails[activeWidget]}</div>
    </section>
  );
};

export default TrainerDashboardPage;

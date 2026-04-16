import React, { useState } from 'react';
import { Card, Heading, Text } from '@radix-ui/themes';
import DashboardCalendarPanel from '../components/DashboardCalendarPanel';

const ClientDashboardPage = () => {
  const [activeWidget, setActiveWidget] = useState('sessions');

  const widgetDetails = {
    sessions: <DashboardCalendarPanel role="client" />,
    plans: (
      <Card className="widget-detail-card">
        <Heading size="5">Assigned Workouts & Meal Plans</Heading>
        <Text color="gray">
          Review this week&apos;s workouts, meal structure, and coach notes. This panel is ready for backend
          plan data when you wire it in.
        </Text>
      </Card>
    ),
    progress: (
      <Card className="widget-detail-card">
        <Heading size="5">Progress Tracker</Heading>
        <Text color="gray">
          Use this area for weigh-ins, rep maxes, weekly photos, and consistency metrics. Right now it is a
          clickable placeholder so the dashboard feels like a working product instead of static copy.
        </Text>
      </Card>
    ),
    settings: (
      <Card className="widget-detail-card">
        <Heading size="5">Settings</Heading>
        <Text color="gray">
          Use this area for notification preferences, profile details, and account controls once those forms are
          wired in. For now it gives the dashboard a real destination instead of a dead link.
        </Text>
      </Card>
    ),
  };

  return (
    <section>
      <Text size="2" color="gray" className="dashboard-kicker">
        Client Dashboard
      </Text>

      <section className="dashboard-main">
        <div className="widget-grid">
          <button
            type="button"
            className={`widget-card widget-action-card ${activeWidget === 'sessions' ? 'widget-card-active' : ''}`}
            id="my-sessions"
            onClick={() => setActiveWidget('sessions')}
          >
            <span className="widget-eyebrow">Availability</span>
            <h3>Book Upcoming Sessions</h3>
            <p>Book or reschedule your next 1:1 training slots with available trainers.</p>
          </button>

          <button
            type="button"
            className={`widget-card widget-action-card ${activeWidget === 'plans' ? 'widget-card-active' : ''}`}
            onClick={() => setActiveWidget('plans')}
          >
            <span className="widget-eyebrow">Plans</span>
            <h3>Assigned Workouts & Meal Plans</h3>
            <p>Review active plans uploaded by your trainer and mark tasks complete.</p>
          </button>

          <button
            type="button"
            className={`widget-card widget-action-card ${activeWidget === 'progress' ? 'widget-card-active' : ''}`}
            onClick={() => setActiveWidget('progress')}
          >
            <span className="widget-eyebrow">Metrics</span>
            <h3>Track Progress</h3>
            <p>Log weight, reps, body metrics, and weekly check-ins in one timeline.</p>
          </button>
        </div>

        <div className="widget-detail-section">{widgetDetails[activeWidget]}</div>
      </section>
    </section>
  );
};

export default ClientDashboardPage;

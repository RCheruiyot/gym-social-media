import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, Heading, Text } from '@radix-ui/themes';
import DashboardCalendarPanel from '../components/DashboardCalendarPanel';
const TrainerDashboardPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeWidget, setActiveWidgetState] = useState(searchParams.get('tab') || 'schedule');

  useEffect(() => {
    setActiveWidgetState(searchParams.get('tab') || 'schedule');
  }, [searchParams]);

  const setActiveWidget = (nextWidget) => {
    setActiveWidgetState(nextWidget);
    setSearchParams({ tab: nextWidget });
  };

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
    profile: (
      <Card className="widget-detail-card">
        <Heading size="5">Trainer Profile</Heading>
        <Text color="gray">
          This panel is the natural place for your bio, specialties, media, and pricing controls. It is ready
          for profile editing once you connect the form and backend data.
        </Text>
      </Card>
    ),
  };

  return (
    <section>
      <Text size="2" color="gray" className="dashboard-kicker">
        Trainer Dashboard
      </Text>

      <section className="dashboard-main">
        <div className="widget-grid">
          <button
            type="button"
            className={`widget-card widget-action-card ${activeWidget === 'schedule' ? 'widget-card-active' : ''}`}
            onClick={() => setActiveWidget('schedule')}
          >
            <span className="widget-eyebrow">Requests</span>
            <h3>Client Requests</h3>
            <p>Approve new requests, set onboarding calls, and manage active clients.</p>
          </button>

          <button
            type="button"
            className={`widget-card widget-action-card ${activeWidget === 'plans' ? 'widget-card-active' : ''}`}
            onClick={() => setActiveWidget('plans')}
          >
            <span className="widget-eyebrow">Programs</span>
            <h3>Workout Plan Uploads</h3>
            <p>Upload and version workout plans, meal templates, and weekly adjustments.</p>
          </button>

          <button
            type="button"
            className={`widget-card widget-action-card ${activeWidget === 'earnings' ? 'widget-card-active' : ''}`}
            onClick={() => setActiveWidget('earnings')}
          >
            <span className="widget-eyebrow">Revenue</span>
            <h3>Earnings & Upcoming Sessions</h3>
            <p>Track payout status, booked sessions, and projected weekly earnings.</p>
          </button>
        </div>

        <div className="widget-detail-section">{widgetDetails[activeWidget]}</div>
      </section>
    </section>
  );
};

export default TrainerDashboardPage;

import React from 'react';
import { Card } from '@radix-ui/themes';
import SessionCalendar from './SessionCalendar';

const DashboardCalendarPanel = ({ role }) => (
  <div className="dashboard-calendar-panel">
    <Card className="calendar-shell">
      <SessionCalendar
        role={role}
        variant="dashboard"
        showHeader
        showItemCount
        headerTitle={role === 'trainer' ? 'Schedule Manager' : 'Booking Calendar'}
        headerDescription={
          role === 'trainer'
            ? 'Create slots, edit titles and descriptions, and cancel sessions from one calendar.'
            : 'Review available trainer slots and book the one that fits your schedule.'
        }
      />
    </Card>
  </div>
);

export default DashboardCalendarPanel;

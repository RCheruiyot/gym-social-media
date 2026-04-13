import React, { useMemo } from 'react';
import { Badge, Card, Flex, Heading, Text } from '@radix-ui/themes';
import { useRole } from '../auth/RoleContext';
import SessionCalendar from '../components/SessionCalendar';

const SessionsPage = () => {
  const { role } = useRole();

  const title = role === 'trainer' ? 'Schedule' : 'My Sessions';
  const subtitle =
    role === 'trainer'
      ? 'Manage availability, update session details, and cancel sessions from your calendar.'
      : 'See your booked sessions, including trainer titles and descriptions, in calendar view.';

  const todayCount = useMemo(() => {
    const now = new Date();
    return now.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  }, []);

  return (
    <section className="sessions-page">
      <Flex justify="between" align="start" wrap="wrap" gap="4" className="sessions-hero">
        <div>
          <Heading size="8">{title}</Heading>
          <Text color="gray" className="sessions-subtitle">
            {subtitle}
          </Text>
        </div>
        <Flex gap="2" wrap="wrap">
          <Badge color={role === 'trainer' ? 'violet' : 'blue'} size="3">
            {role === 'trainer' ? 'Trainer View' : 'Client View'}
          </Badge>
          <Badge color="green" size="3">
            {todayCount}
          </Badge>
        </Flex>
      </Flex>

      <div className="sessions-layout">
        <Card className="calendar-shell">
          <SessionCalendar role={role} variant="sessions" />
        </Card>
      </div>
    </section>
  );
};

export default SessionsPage;

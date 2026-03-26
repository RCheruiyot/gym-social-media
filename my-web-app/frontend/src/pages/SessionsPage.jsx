import React, { useMemo, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import timeGridPlugin from '@fullcalendar/timegrid';
import { Badge, Button, Card, Flex, Heading, Text } from '@radix-ui/themes';
import { useRole } from '../auth/RoleContext';

const baseEvents = [
  {
    id: '1',
    title: 'Upper Body Power',
    start: '2026-03-23T07:00:00',
    end: '2026-03-23T08:00:00',
    trainer: 'Maya Chen',
    location: 'Virtual',
    status: 'Confirmed',
  },
  {
    id: '2',
    title: 'Mobility Reset',
    start: '2026-03-24T18:30:00',
    end: '2026-03-24T19:15:00',
    trainer: 'Jordan Miles',
    location: 'Studio A',
    status: 'Pending',
  },
  {
    id: '3',
    title: 'Conditioning Intervals',
    start: '2026-03-26T09:00:00',
    end: '2026-03-26T10:00:00',
    trainer: 'Maya Chen',
    location: 'Virtual',
    status: 'Confirmed',
  },
  {
    id: '4',
    title: 'Progress Review',
    start: '2026-03-28T12:00:00',
    end: '2026-03-28T12:45:00',
    trainer: 'Alex Rivera',
    location: 'Virtual',
    status: 'Waitlist',
  },
];

const SessionsPage = () => {
  const { role } = useRole();
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const title = role === 'trainer' ? 'Schedule' : 'My Sessions';
  const subtitle =
    role === 'trainer'
      ? 'Manage availability, upcoming client calls, and reschedules in one calendar.'
      : 'See your booked sessions, upcoming training blocks, and session details in calendar view.';

  const events = useMemo(
    () =>
      baseEvents.map((event) => ({
        ...event,
        classNames: [`fc-status-${event.status.toLowerCase()}`],
      })),
    [],
  );

  const todayCount = events.filter((event) => event.start.startsWith('2026-03-23')).length;

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
            {todayCount} today
          </Badge>
        </Flex>
      </Flex>

      <div className="sessions-layout">
        <Card className="calendar-shell">
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="timeGridWeek"
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek,timeGridDay',
            }}
            height="auto"
            events={events}
            selectable
            nowIndicator
            eventClick={(info) => {
              setSelectedEvent(
                info.event.extendedProps && info.event.title
                  ? {
                      id: info.event.id,
                      title: info.event.title,
                      start: info.event.startStr,
                      end: info.event.endStr || '',
                      trainer: info.event.extendedProps.trainer,
                      location: info.event.extendedProps.location,
                      status: info.event.extendedProps.status,
                    }
                  : null,
              );
              setIsDialogOpen(true);
            }}
          />
        </Card>
      </div>

      <Dialog.Root open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="dialog-overlay" />
          <Dialog.Content className="dialog-content">
            <Flex direction="column" gap="4">
              <div>
                <Dialog.Title asChild>
                  <Heading size="5">Session Details</Heading>
                </Dialog.Title>
                <Dialog.Description asChild>
                  <Text color="gray">
                    {role === 'trainer'
                      ? 'Review or adjust this scheduled session.'
                      : 'Review this session and request changes if needed.'}
                  </Text>
                </Dialog.Description>
              </div>

              {selectedEvent ? (
                <Flex direction="column" gap="3" className="session-detail-stack">
                  <div>
                    <Text weight="bold">{selectedEvent.title}</Text>
                    <Text color="gray">{new Date(selectedEvent.start).toLocaleString()}</Text>
                  </div>
                  <div className="session-meta-row">
                    <Text color="gray">Coach</Text>
                    <Text>{selectedEvent.trainer}</Text>
                  </div>
                  <div className="session-meta-row">
                    <Text color="gray">Location</Text>
                    <Text>{selectedEvent.location}</Text>
                  </div>
                  <div className="session-meta-row">
                    <Text color="gray">Status</Text>
                    <Badge
                      color={
                        selectedEvent.status === 'Confirmed'
                          ? 'green'
                          : selectedEvent.status === 'Pending'
                            ? 'amber'
                            : 'gray'
                      }
                    >
                      {selectedEvent.status}
                    </Badge>
                  </div>
                  <Flex justify="between" gap="3" wrap="wrap">
                    <Dialog.Close asChild>
                      <Button variant="soft" color="gray">
                        Close
                      </Button>
                    </Dialog.Close>
                    <Button variant="soft">{role === 'trainer' ? 'Adjust Session' : 'Request Change'}</Button>
                  </Flex>
                </Flex>
              ) : null}
            </Flex>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </section>
  );
};

export default SessionsPage;

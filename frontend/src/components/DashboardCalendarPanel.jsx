import React, { useEffect, useMemo, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import timeGridPlugin from '@fullcalendar/timegrid';
import { Badge, Button, Card, Flex, Heading, IconButton, Text } from '@radix-ui/themes';
import { Cross1Icon } from '@radix-ui/react-icons';
import { createTrainerSession, DEFAULT_TRAINER_ID, fetchTrainerSessions } from '../api/trainerSessions';

const clientBaseEvents = [
  {
    id: 'c1',
    title: 'Upper Body Power',
    start: '2026-03-23T07:00:00',
    end: '2026-03-23T08:00:00',
    coachLabel: 'Coach',
    coachName: 'Maya Chen',
    location: 'Virtual',
    status: 'Confirmed',
  },
  {
    id: 'c2',
    title: 'Mobility Reset',
    start: '2026-03-24T18:30:00',
    end: '2026-03-24T19:15:00',
    coachLabel: 'Coach',
    coachName: 'Jordan Miles',
    location: 'Studio A',
    status: 'Pending',
  },
  {
    id: 'c3',
    title: 'Progress Review',
    start: '2026-03-28T12:00:00',
    end: '2026-03-28T12:45:00',
    coachLabel: 'Coach',
    coachName: 'Alex Rivera',
    location: 'Virtual',
    status: 'Waitlist',
  },
];

const trainerBaseEvents = [
  {
    id: 't1',
    title: 'Onboarding Call',
    start: '2026-03-23T10:00:00',
    end: '2026-03-23T10:30:00',
    coachLabel: 'Client',
    coachName: 'Taylor Brooks',
    location: 'Virtual',
    status: 'Confirmed',
  },
  {
    id: 't2',
    title: 'Technique Check-In',
    start: '2026-03-24T16:00:00',
    end: '2026-03-24T17:00:00',
    coachLabel: 'Client',
    coachName: 'Jordan Lee',
    location: 'Studio B',
    status: 'Confirmed',
  },
  {
    id: 't3',
    title: 'Availability Hold',
    start: '2026-03-26T08:00:00',
    end: '2026-03-26T09:00:00',
    coachLabel: 'Client',
    coachName: 'Open Slot',
    location: 'Virtual',
    status: 'Pending',
  },
];

const formatSelectedEvent = (event) => ({
  id: event.id,
  title: event.title,
  start: event.startStr,
  end: event.endStr || '',
  coachLabel: event.extendedProps.coachLabel,
  coachName: event.extendedProps.coachName,
  location: event.extendedProps.location,
  status: event.extendedProps.status,
});

const DashboardCalendarPanel = ({ role }) => {
  const seedEvents = role === 'trainer' ? trainerBaseEvents : clientBaseEvents;
  const [events, setEvents] = useState(seedEvents);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    let isMounted = true;

    if (role !== 'trainer') {
      setEvents(clientBaseEvents);
      return undefined;
    }

    fetchTrainerSessions()
      .then((rows) => {
        if (!isMounted) return;
        setEvents(rows);
        setStatusMessage('');
      })
      .catch((error) => {
        if (!isMounted) return;
        setEvents([]);
        setStatusMessage(error.message);
      });

    return () => {
      isMounted = false;
    };
  }, [role]);

  const calendarEvents = useMemo(
    () =>
      events.map((event) => ({
        ...event,
        classNames: [`fc-status-${event.status.toLowerCase()}`],
      })),
    [events],
  );

  const addDraftSession = (selection) => {
    const draftEvent = {
      id: `draft-${selection.startStr}`,
      title: role === 'trainer' ? 'Available Slot' : 'Requested Session',
      start: selection.startStr,
      end: selection.endStr || selection.startStr,
      trainerId: DEFAULT_TRAINER_ID,
      coachLabel: role === 'trainer' ? 'Client' : 'Coach',
      coachName: role === 'trainer' ? 'Open Slot' : 'Unassigned',
      location: role === 'trainer' ? 'Choose format' : 'Pending confirmation',
      status: 'Pending',
    };

    setEvents((currentEvents) => {
      const withoutOldDrafts = currentEvents.filter((event) => !event.id.startsWith('draft-'));
      return [...withoutOldDrafts, draftEvent];
    });
    setSelectedEvent(draftEvent);
    setIsDialogOpen(true);
  };

  const saveTrainerSession = async () => {
    if (role !== 'trainer' || !selectedEvent || !selectedEvent.id.startsWith('draft-')) {
      setIsDialogOpen(false);
      return;
    }

    setIsSaving(true);
    setStatusMessage('');

    try {
      const savedEvent = await createTrainerSession({
        start: selectedEvent.start,
        end: selectedEvent.end,
        trainerId: selectedEvent.trainerId || DEFAULT_TRAINER_ID,
      });

      setEvents((currentEvents) => [
        ...currentEvents.filter((event) => event.id !== selectedEvent.id),
        savedEvent,
      ]);
      setSelectedEvent(savedEvent);
      setIsDialogOpen(false);
    } catch (error) {
      setStatusMessage(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="dashboard-calendar-panel">
      <Card className="calendar-shell">
        <Flex justify="between" align="center" wrap="wrap" gap="3" className="calendar-panel-header">
          <div>
            <Heading size="5">{role === 'trainer' ? 'Schedule Manager' : 'Booking Calendar'}</Heading>
            <Text color="gray">
              {role === 'trainer'
                ? 'Click an event to manage it, or drag across time to create an availability hold.'
                : 'Click an event for details, or drag across time to request a new training block.'}
            </Text>
          </div>
          <Badge color={role === 'trainer' ? 'violet' : 'blue'}>{events.length} items</Badge>
        </Flex>
        {statusMessage ? (
          <Text color="red" size="2">
            {statusMessage}
          </Text>
        ) : null}

        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay',
          }}
          height="auto"
          events={calendarEvents}
          selectable
          editable
          selectMirror
          nowIndicator
          select={addDraftSession}
          eventClick={(info) => {
            setSelectedEvent(formatSelectedEvent(info.event));
            setIsDialogOpen(true);
          }}
          eventDrop={(info) => {
            setSelectedEvent(formatSelectedEvent(info.event));
            setIsDialogOpen(true);
          }}
          eventResize={(info) => {
            setSelectedEvent(formatSelectedEvent(info.event));
            setIsDialogOpen(true);
          }}
        />
      </Card>

      <Dialog.Root open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <Dialog.Content className="dialog-content">
            <Flex direction="column" gap="4">
              <div>
                <Flex justify="between" align="center">
                    <Dialog.Title asChild>
                      <Heading size="5">{role === 'trainer' ? 'Schedule Details' : 'Session Details'}</Heading>
                    </Dialog.Title>
                    <Dialog.Close asChild>
                      <IconButton variant="ghost" color="gray">
                        <Cross1Icon />
                              
                      </IconButton>
                    </Dialog.Close>
                </Flex>

                <Text color="gray">
                  {role === 'trainer'
                    ? 'Update a booked session or review an availability hold.'
                    : 'Review this session and send a request if you want to change it.'}
                </Text>
              </div>

              {selectedEvent ? (
                <Flex direction="column" gap="3" className="session-detail-stack">
                  <Flex justify={"between"}>
                    <Text weight="bold">{selectedEvent.title}</Text>
                    <Text color="gray">{new Date(selectedEvent.start).toLocaleString()}</Text>
                  </Flex>
                  <div className="session-meta-row">
                    <Text color="gray">{selectedEvent.coachLabel}</Text>
                    <Text>{selectedEvent.coachName}</Text>
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
                    <Button variant="soft" onClick={saveTrainerSession} disabled={isSaving}>
                      {role === 'trainer'
                        ? selectedEvent.id.startsWith('draft-')
                          ? (isSaving ? 'Saving...' : 'Create Availability Slot')
                          : 'Close'
                        : 'Send Booking Request'}
                    </Button>
                  </Flex>
                </Flex>
              ) : null}
            </Flex>
          </Dialog.Content>
      </Dialog.Root>
    </div>
  );
};

export default DashboardCalendarPanel;
